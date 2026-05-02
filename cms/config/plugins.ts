export default ({ env }) => ({
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
