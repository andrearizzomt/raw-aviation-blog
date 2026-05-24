import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const { ApplicationError } = errors;

const AUTHOR_PROFILE_UID = 'api::author-profile.author-profile';

function getAdminBaseUrl(strapi: Core.Strapi): string {
  const configured =
    process.env.PUBLIC_URL ||
    strapi.config.get<string>('server.url') ||
    'http://localhost:1337';

  return configured.replace(/\/$/, '');
}

function normalizeName(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function parseEntryId(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return Number(value);
  }

  return undefined;
}

function parseDocumentId(
  where: Record<string, unknown>,
  data?: Record<string, unknown>
): string | undefined {
  if (typeof where.documentId === 'string') {
    return where.documentId;
  }

  if (typeof data?.documentId === 'string') {
    return data.documentId;
  }

  return undefined;
}

async function resolveUpdateContext(
  strapi: Core.Strapi,
  event: { params: { where?: Record<string, unknown>; data?: Record<string, unknown> } }
) {
  const where = event.params.where ?? {};
  const entryId = parseEntryId(where.id);
  let documentId = parseDocumentId(where, event.params.data);

  if (!documentId && entryId) {
    const entry = await strapi.db.query(AUTHOR_PROFILE_UID).findOne({
      where: { id: entryId },
      select: ['documentId'],
    });

    documentId = entry?.documentId;
  }

  return { documentId, entryId };
}

function resolveCreateContext(event: {
  params: { data?: Record<string, unknown> };
}) {
  const documentId = parseDocumentId({}, event.params.data);

  return { documentId };
}

async function validateAuthorProfileLink(
  strapi: Core.Strapi,
  data: Record<string, unknown>,
  context: { documentId?: string; entryId?: number } = {}
) {
  let adminUserId = data.adminUserId;

  if ((adminUserId === undefined || adminUserId === null) && context.entryId) {
    const existing = await strapi.db.query(AUTHOR_PROFILE_UID).findOne({
      where: { id: context.entryId },
      select: ['adminUserId', 'firstName', 'lastName', 'email'],
    });

    if (existing?.adminUserId) {
      adminUserId = existing.adminUserId;
      data.adminUserId ??= existing.adminUserId;
      data.firstName ??= existing.firstName;
      data.lastName ??= existing.lastName;
      data.email ??= existing.email;
    }
  }

  if (typeof adminUserId !== 'number' || adminUserId < 1) {
    throw new ApplicationError('Select an admin user for this author profile.');
  }

  const linkedProfiles = await strapi.db.query(AUTHOR_PROFILE_UID).findMany({
    select: ['id', 'adminUserId', 'documentId'],
    where: { adminUserId },
  });

  const duplicate = linkedProfiles.some((profile) => {
    if (context.documentId && profile.documentId === context.documentId) {
      return false;
    }

    if (context.entryId && profile.id === context.entryId) {
      return false;
    }

    return true;
  });

  if (duplicate) {
    throw new ApplicationError('This admin user is already linked to another author profile.');
  }

  const adminUser = await strapi.db.query('admin::user').findOne({
    where: { id: adminUserId },
    select: ['id', 'firstname', 'lastname', 'email', 'isActive'],
  });

  if (!adminUser?.isActive) {
    throw new ApplicationError('The selected admin user was not found or is inactive.');
  }

  if (
    normalizeName(data.firstName) !== normalizeName(adminUser.firstname) ||
    normalizeName(data.lastName) !== normalizeName(adminUser.lastname)
  ) {
    throw new ApplicationError(
      'First name and last name must match the linked admin user exactly.'
    );
  }

  data.email = adminUser.email;
}

const HIDDEN_LINK_FIELDS = ['adminUserId', 'firstName', 'lastName', 'email'] as const;

async function hideAuthorProfileLinkFields(strapi: Core.Strapi) {
  const contentType = strapi.contentType(AUTHOR_PROFILE_UID);

  if (!contentType) {
    return;
  }

  const cmService = strapi.plugin('content-manager').service('content-types');
  const config = await cmService.findConfiguration(contentType);
  let changed = false;

  for (const field of HIDDEN_LINK_FIELDS) {
    const currentVisible = config.metadatas?.[field]?.edit?.visible;

    if (currentVisible !== false) {
      config.metadatas[field] = {
        ...config.metadatas[field],
        edit: {
          ...config.metadatas[field]?.edit,
          visible: false,
        },
      };
      changed = true;
    }
  }

  if (Array.isArray(config.layouts?.edit)) {
    const nextLayout = config.layouts.edit
      .map((row: Array<{ name: string }>) =>
        row.filter((item) => !HIDDEN_LINK_FIELDS.includes(item.name as (typeof HIDDEN_LINK_FIELDS)[number]))
      )
      .filter((row: Array<{ name: string }>) => row.length > 0);

    if (JSON.stringify(nextLayout) !== JSON.stringify(config.layouts.edit)) {
      config.layouts.edit = nextLayout;
      changed = true;
    }
  }

  if (changed) {
    await cmService.updateConfiguration(contentType, config);
  }
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    hideAuthorProfileLinkFields(strapi).catch((error) => {
      strapi.log.warn('Could not hide author profile link fields in Content Manager', error);
    });

    strapi.server.routes({
      type: 'admin',
      prefix: '/admin',
      routes: [
        {
          method: 'GET',
          path: '/author-profiles/linkable-admin-users',
          handler: 'author-profile.listLinkableAdminUsers',
          config: {
            policies: ['admin::isAuthenticatedAdmin'],
          },
          info: {
            apiName: 'author-profile',
          },
        },
      ],
    });

    strapi.db.lifecycles.subscribe({
      models: ['admin::user'],

      async afterCreate(event) {
        const { result } = event;
        const email = result?.email as string | undefined;
        const registrationToken = result?.registrationToken as string | null | undefined;
        const password = result?.password as string | null | undefined;

        if (!email || !registrationToken || password) {
          return;
        }

        const firstname = (result?.firstname as string | undefined) ?? '';
        const lastname = (result?.lastname as string | undefined) ?? '';
        const name = [firstname, lastname].filter(Boolean).join(' ') || email;
        const registerUrl = `${getAdminBaseUrl(strapi)}/admin/auth/register?registrationToken=${registrationToken}`;

        try {
          await strapi.plugin('email').service('email').send({
            to: email,
            subject: 'You have been invited to RAW Aviation CMS',
            text: `Hello ${name},

You have been invited to join the RAW Aviation CMS admin panel.

Accept your invitation and set your password here:
${registerUrl}

If you did not expect this invitation, you can ignore this email.`,
            html: `
              <p>Hello ${name},</p>
              <p>You have been invited to join the RAW Aviation CMS admin panel.</p>
              <p><a href="${registerUrl}">Accept invitation and set your password</a></p>
              <p>If you did not expect this invitation, you can ignore this email.</p>
            `,
          });

          strapi.log.info(`Admin invite email sent to ${email}`);
        } catch (error) {
          strapi.log.error(`Failed to send admin invite email to ${email}`, error);
        }
      },
    });

    strapi.db.lifecycles.subscribe({
      models: [AUTHOR_PROFILE_UID],

      async beforeCreate(event) {
        const context = resolveCreateContext(event);

        await validateAuthorProfileLink(strapi, event.params.data, context);
      },

      async beforeUpdate(event) {
        const context = await resolveUpdateContext(strapi, event);

        await validateAuthorProfileLink(strapi, event.params.data, context);
      },
    });
  },
};
