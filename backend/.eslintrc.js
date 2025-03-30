module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 2022,
    tsconfigRootDir: __dirname,
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'import',
    'jest',
    'promise',
    'security',
    'jsdoc',
    'node',
    'unicorn',
    'sonarjs',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:jest/recommended',
    'plugin:promise/recommended',
    'plugin:security/recommended',
    'plugin:jsdoc/recommended',
    'plugin:sonarjs/recommended',
    'plugin:prettier/recommended',  // Enable prettier plugin integration
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist', 'node_modules', 'coverage', 'scripts'],
  rules: {
    // General TypeScript rules
    '@typescript-eslint/explicit-function-return-type': ['error', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    '@typescript-eslint/naming-convention': [
      'error',
      // Enforce camelCase for variables, properties, and methods
      {
        selector: ['variable', 'parameter', 'method', 'accessor', 'property'],
        format: ['camelCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'forbid',
      },
      // Allow PascalCase for classes, interfaces, type aliases, and enums
      {
        selector: ['class', 'interface', 'typeAlias', 'enum', 'typeParameter'],
        format: ['PascalCase'],
      },
      // Require I prefix for interfaces
      {
        selector: 'interface',
        format: ['PascalCase'],
        prefix: ['I'],
      },
      // Enforce camelCase for functions
      {
        selector: 'function',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
    ],
    
    // Enhanced type checking rules
    '@typescript-eslint/strict-boolean-expressions': ['warn', {
      allowString: false,
      allowNumber: false,
      allowNullableObject: false,
      allowNullableBoolean: true,
    }],
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
      disallowTypeAnnotations: true,
    }],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/ban-types': 'error',
    '@typescript-eslint/restrict-template-expressions': ['error', {
      allowNumber: true,
      allowBoolean: false,
      allowAny: false,
      allowNullish: false,
    }],
    '@typescript-eslint/prefer-readonly': 'warn',
    
    // Mongoose-specific rules
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false, // Allow void returns for mongoose methods that return Promises
      },
    ],
    
    // Promise and async handling
    'promise/always-return': 'warn',
    'promise/no-nesting': 'warn',
    'promise/catch-or-return': 'error',
    'promise/no-callback-in-promise': 'warn',
    'promise/no-promise-in-callback': 'warn',
    'promise/no-return-wrap': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    
    // Error handling
    'no-throw-literal': 'off',
    '@typescript-eslint/no-throw-literal': 'error',
    
    // Import organization
    'import/order': [
      'error',
      {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        'alphabetize': { order: 'asc', caseInsensitive: true }
      }
    ],
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': 'error',
    
    // Express-specific rules
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    
    // Testing-specific rules
    'jest/consistent-test-it': ['error', { fn: 'it' }],
    'jest/expect-expect': 'error',
    'jest/no-conditional-expect': 'error',
    'jest/no-identical-title': 'error',
    'jest/valid-expect': 'error',
    'jest/no-mocks-import': 'error',
    'jest/no-disabled-tests': 'warn',
    
    // JSDoc rules
    'jsdoc/require-jsdoc': ['warn', {
      'publicOnly': true,
      'require': {
        'FunctionDeclaration': true,
        'MethodDefinition': true,
        'ClassDeclaration': true
      }
    }],
    'jsdoc/require-param-type': 'off', // TypeScript handles this
    'jsdoc/require-returns-type': 'off', // TypeScript handles this
    
    // Security rules
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-pseudoRandomBytes': 'error',
    
    // Code quality rules
    'sonarjs/no-identical-expressions': 'error',
    'sonarjs/no-inverted-boolean-check': 'error',
    'sonarjs/no-redundant-jump': 'error',
    'sonarjs/no-small-switch': 'warn',
    'sonarjs/prefer-immediate-return': 'warn',
    'sonarjs/no-duplicate-string': ['warn', { 'threshold': 5 }],
    
    // Node.js specific rules
    'node/no-deprecated-api': 'error',
    'node/no-missing-import': 'off', // TypeScript handles this
    'node/no-unpublished-import': 'off', // TypeScript handles this
    
    // Unicorn rules for better practices
    'unicorn/error-message': 'error',
    'unicorn/no-abusive-eslint-disable': 'error',
    'unicorn/no-array-instanceof': 'error',
    'unicorn/prefer-includes': 'error',
  },
  overrides: [
    // Override rules for test files
    {
      files: ['**/*.test.ts', '**/tests/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'jest/unbound-method': 'error',
      },
    },
    // Override rules for model files
    {
      files: ['**/models/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
    },
    // Override rules for migration/seed files
    {
      files: ['**/migrations/**/*.ts', '**/seeds/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'sonarjs/no-duplicate-string': 'off',
      },
    },
    // Override rules for configuration files
    {
      files: ['**/config/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: 'tsconfig.json',
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'jsdoc': {
      'tagNamePreference': {
        'returns': 'returns',
        'param': 'param',
      },
      'overrideReplacesDocs': true,
    },
  },
};