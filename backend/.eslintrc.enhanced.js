/**
 * Enhanced ESLint configuration with stricter TypeScript rules
 */
module.exports = {
  extends: ['./.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // Ban @ts-nocheck in production code
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-nocheck': 'error',
        'ts-ignore': 'error',
        'ts-expect-error': {
          descriptionFormat: '^: TS\\d+: .+$'
        }
      }
    ],
    
    // Enforce explicit types
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    
    // Enforce type safety
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    
    // MongoDB/Mongoose specific rules
    '@typescript-eslint/no-misused-promises': [
      'error', 
      { 'checksVoidReturn': false }
    ]
  },
  
  // Explicitly allow @ts-nocheck only in test files
  overrides: [
    {
      files: ['**/*.test.ts', '**/tests/**/*.ts'],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off'
      }
    }
  ]
};
