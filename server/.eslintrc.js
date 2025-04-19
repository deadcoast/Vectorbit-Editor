module.exports = {
  env: {
    node: true,
    es6: true,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    'import/no-unresolved': [
      2,
      {
        ignore: ['cors', 'express', 'express-rate-limit', 'helmet', 'morgan', 'mongoose', 'dotenv'],
      },
    ],
  },
};
