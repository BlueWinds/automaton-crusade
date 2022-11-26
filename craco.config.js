const { addBeforeLoaders } = require('@craco/craco');

module.exports = {
  // ...
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.module.rules.push({
        test: /\.md/,
        type: 'asset/source'
      })
      return webpackConfig
    }
  },
}
