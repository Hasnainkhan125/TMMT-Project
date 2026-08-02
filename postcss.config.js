export default {
  plugins: {
    '@tailwindcss/postcss': {
      config: './tailwind.config.ts',
    },
    autoprefixer: {},
    'postcss-pxtorem': {
      rootValue: 16,
      propList: ['*'],
    },
  },
}
