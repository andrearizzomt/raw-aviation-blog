import type { StrapiApp } from '@strapi/strapi/admin';

import { AdminUserLinkPanel } from './components/AdminUserLinkPanel';

export default {
  config: {
    locales: [],
  },
  bootstrap(app: StrapiApp) {
    const contentManager = app.getPlugin('content-manager').apis as {
      addEditViewSidePanel: (panels: unknown[]) => void;
    };

    contentManager.addEditViewSidePanel([AdminUserLinkPanel]);
  },
};
