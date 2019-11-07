module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  extends: 'airbnb',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react'],
  parser: 'babel-eslint',
  rules: {
    'singleQuote': true,
    "trailingComma": 'es5',
    'bracketSpacing': false,
    'semi': [2, 'never'],
    'no-param-reassign': [2, { props: false }],
    'no-underscore-dangle': ['error', { allow: ['_isMounted'] }],
    "no-use-before-define": [
      "error", {
        "functions": false,
        "classes": true,
        "variables": true
      }
    ],
    'import/no-named-as-default': 0,
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.js', '.jsx'],
      },
    ],
    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        required: {
          some: ['nesting', 'id'],
        },
      },
    ],
    'jsx-a11y/label-has-for': [
      'error',
      {
        required: {
          some: ['nesting', 'id'],
        },
      },
    ],
  },
}
