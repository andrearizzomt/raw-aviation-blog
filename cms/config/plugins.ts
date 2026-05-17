export default ({ env }) => ({
  email: {
    config: {
      provider: '@strapi/provider-email-nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'mail.privateemail.com'),
        port: env.int('SMTP_PORT', 587),
        secure: false,
        auth: {
          user: env('SMTP_USER'),
          pass: env('SMTP_PASS'),
        },
      },
      settings: {
        defaultFrom: env('SMTP_USER'),
        defaultReplyTo: env('SMTP_USER'),
      },
    },
  },
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
    },
  },
  upload: {
    config: {
      breakpoints: {
        large: 1000,
        medium: 750,
        small: 500,
        thumbnail: 250,
      },
      sizeLimit: 10 * 1024 * 1024, // 10MB in bytes
      responseRange: {
        last: true,
      },
    },
  },
});
