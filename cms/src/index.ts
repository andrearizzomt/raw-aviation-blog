import type { Core } from '@strapi/strapi';

function getAdminBaseUrl(strapi: Core.Strapi): string {
  const configured =
    process.env.PUBLIC_URL ||
    strapi.config.get<string>('server.url') ||
    'http://localhost:1337';

  return configured.replace(/\/$/, '');
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ['admin::user'],

      async afterCreate(event) {
        const { result } = event;
        const email = result?.email as string | undefined;
        const registrationToken = result?.registrationToken as string | null | undefined;
        const password = result?.password as string | null | undefined;

        // Invited users have a token and no password yet. Skip when admin set a password directly.
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
  },
};
