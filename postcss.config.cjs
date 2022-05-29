const easyImport = require('postcss-easy-import');
const nested = require('postcss-nested');
const nestedProps = require('postcss-nested-props');
const presetEnv = require('postcss-preset-env')({
  stage: 0,
  features: {
    "nesting-rules": true,
  },
});



module.exports = {
  plugins: [
    easyImport,
    nested,
    nestedProps,
    presetEnv
  ]
}