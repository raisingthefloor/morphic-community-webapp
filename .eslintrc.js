module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
      jest: true
  },
  extends: [
    "plugin:vue/essential",
    "@vue/standard",
    "plugin:jsdoc/recommended",
    "eslint-config-fluid"
  ],
  parserOptions: {
    parser: "babel-eslint"
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-multiple-empty-lines": "off",
    "padded-blocks": "off",
    "object-curly-spacing": "off",
    "dot-notation": [
      "error",
      {
        "allowKeywords": true
      }
    ],
    "jsdoc/require-jsdoc": 0,
    "jsdoc/newline-after-description": 0,
    "jsdoc/require-hyphen-before-param-description": "off",
    "jsdoc/no-undefined-types": 0, // https://github.com/gajus/eslint-plugin-jsdoc/issues/99

  }
};
