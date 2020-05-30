'use-strict';

module.exports = {
    'env': {
        'browser': true,
        'es6': true
    },
    // 'extends': 'eslint:recommended',
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parserOptions': {
        'ecmaVersion': 11,
        'sourceType': 'module'
    },
    'rules': {
        'strict': ['error', 'global'],
        'no-var': 'error',
        'prefer-const': 'error',
        'one-var': ['error', 'never'],
        'camelcase': ['error', { properties: 'never' }],
        'no-unused-vars': 'error',
        'no-multi-assign': 'error',
        'quotes': ['error', 'single'],
        'no-array-constructor': 'error',
        'no-new-object': 'error',
        'no-new-wrappers': 'error',
        'no-extra-boolean-cast': 'error',
        'eqeqeq': 'error',
        'yoda': 'error',
        'no-unneeded-ternary': 'error',
        'no-nested-ternary': 'error',
        'semi': 'error',
        'semi-style': ['error', 'last'],
        'class-methods-use-this': 'error',
        'curly': 'error',
        'complexity': ['error', 4],
        'consistent-return': 'error',
        'default-case': 'error',
        'default-case-last': 'error',
        'max-classes-per-file': ['error', 1],
        'no-alert': 'error',
        'no-constructor-return': 'error',
        'no-else-return': ['error', { allowElseIf: false }],
        'no-empty-function': 'error',
        'no-extend-native': 'error',
        'no-extra-label': 'error',
        'no-fallthrough': 'error',
        'no-floating-decimal': 'error',
        'no-global-assign': ['error', { 'exceptions': ['Object'] }],
        'no-implicit-coercion': [2, { 'allow': ['!!', '~'] }],
        'no-implicit-globals': ['error', { 'lexicalBindings': false }],
        'no-invalid-this': 'error',
        'no-lone-blocks': 'error',
        'no-loop-func': 'error',
        'no-magic-numbers': ['error', { 'ignore': [1, 0] }],
        'no-multi-spaces': 'error',
        'no-multi-str': 'error',
        'no-new': 'error',
        'no-new-wrappers': 'error',
        'no-param-reassign': 'error',
        'no-redeclare': 'error',
        'no-return-assign': ['error', 'always'],
        'no-script-url': 'error',
        'no-self-compare': 'error',
        'no-sequences': 'error',
        'no-throw-literal': 'error',
        'no-unused-expressions': 'error',
        'no-unused-labels': 'error',
        'no-useless-catch': 'error',
        'no-useless-concat': 'error',
        'no-useless-return': 'error',
        'no-warning-comments': ['error', { 'terms': ['todo', 'fixme', 'any other term'], 'location': 'anywhere' }],
        'prefer-promise-reject-errors': 'error',
        'require-await': 'error',
        'vars-on-top': 'error',
        'no-shadow': 'error',
        'no-shadow-restricted-names': 'error',
        'no-undef': 'error',
        'no-undef-init': 'error',
        'no-use-before-define': 'error',
        'array-bracket-spacing': ['error', 'never'],
        'brace-style': 'error',
        'comma-dangle': ['error', 'never'],
        'func-call-spacing': ['error', 'never'],
        'func-style': ['error', 'declaration', { 'allowArrowFunctions': true }],
        // 'id-blacklist': ['x', 'y', 'error', 'data', 'err', 'e', 'cb', 'callback'],
        'id-length': ['error', { 'min': 3 }],
        'keyword-spacing': ['error', { 'before': true }],
        'line-comment-position': ['error', { 'position': 'above' }],
        'lines-between-class-members': ['error', 'always'],
        'max-depth': ['error', 4],
        'max-len': ['error', { 'code': 150 }],
        'max-lines': ['error', { 'max': 500, 'skipComments': true }],
        'max-lines-per-function': ['error', 20],
        'max-params': ['error', 3],
        'max-statements-per-line': ['error', { 'max': 1 }],
        'new-cap': 'error',
        'new-parens': 'error',
        'newline-per-chained-call': ['error', { 'ignoreChainWithDepth': 2 }],
        'no-lonely-if': 'error',
        'no-mixed-operators': 'error',
        'no-trailing-spaces': 'error',
        'no-multiple-empty-lines': 'error',
        'no-whitespace-before-property': 'error',
        // 'object-curly-spacing': ['error', 'never'],
        'operator-assignment': ['error', 'always'],
        'prefer-exponentiation-operator': 'error',
        'spaced-comment': ['error', 'always'],
        'switch-colon-spacing': 'error',
        'arrow-body-style': ['error', 'as-needed'],
        'arrow-parens': ['error', 'always'],
        'arrow-spacing': 'error',
        'constructor-super': 'error',
        'no-class-assign': 'error',
        'no-const-assign': 'error',
        'no-this-before-super': 'error',
        'no-useless-computed-key': 'error',
        'no-useless-constructor': 'error',
        'prefer-numeric-literals': 'error',
        'prefer-template': 'error'
    }
};