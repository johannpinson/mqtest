module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/recommended',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    project: 'tsconfig.json',
    extraFileExtensions: ['.vue'],
  },
  plugins: [
    'vue',
  ],
  rules: {
    'semi': ['error', 'never'],
    'space-before-function-paren': ['error', 'always'],
    'operator-linebreak': 'off',
    'no-console': ['warn', { allow: ['error'] }],
    'vue/no-unused-vars': 'error',
    'vue/max-attributes-per-line': 'off',
    'class-methods-use-this': 'off',
    'lines-between-class-members': 'off',
    'no-shadow': 'off',
    'no-floating-decimal': 0,
    'no-param-reassign': ['error', { 'props': true, 'ignorePropertyModificationsFor': ['state'] }],
    'implicit-arrow-linebreak': 'off',
    // eslint-plugin-import overrides
    'import/no-unresolved': 0,
    // 'import/named': 0,
    'import/prefer-default-export': 0,

    // @typescript-eslint/eslint-plugin overrides
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/member-delimiter-style': 0,
    '@typescript-eslint/no-inferrable-types': [true, 'ignore-params', 'ignore-properties'],
    '@typescript-eslint/camelcase': 0,
  }
}
