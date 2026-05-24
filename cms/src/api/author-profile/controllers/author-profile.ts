/**
 * author-profile controller
 */

import { factories } from '@strapi/strapi';
import type { Core } from '@strapi/strapi';

const UID = 'api::author-profile.author-profile';

export default factories.createCoreController(UID, ({ strapi }: { strapi: Core.Strapi }) => ({
  async listLinkableAdminUsers(ctx) {
    const excludeDocumentId =
      typeof ctx.query.excludeDocumentId === 'string' ? ctx.query.excludeDocumentId : undefined;

    const adminUsers = await strapi.db.query('admin::user').findMany({
      select: ['id', 'firstname', 'lastname', 'email', 'isActive'],
      where: { isActive: true },
      orderBy: [{ firstname: 'asc' }, { lastname: 'asc' }],
    });

    const linkedProfiles = await strapi.db.query(UID).findMany({
      select: ['adminUserId', 'documentId'],
    });

    const linkedAdminUserIds = new Set(
      linkedProfiles
        .filter(
          (profile) =>
            typeof profile.adminUserId === 'number' &&
            profile.documentId !== excludeDocumentId
        )
        .map((profile) => profile.adminUserId as number)
    );

    ctx.body = {
      data: adminUsers
        .filter((user) => !linkedAdminUserIds.has(user.id))
        .map((user) => ({
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          label: `${user.firstname} ${user.lastname} (${user.email})`,
        })),
    };
  },
}));
