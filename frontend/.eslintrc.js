module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'next/core-web-vitals',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'react-hooks',
  ],
  rules: {
    // Custom rules for Chakra UI v3
    'chakra-ui-v3/imports': 'warn',
    'chakra-ui-v3/props': 'warn',
    'chakra-ui-v3/types': 'warn',
    
    // Other recommended rules
    'react/react-in-jsx-scope': 'off', // Not needed in Next.js
    'react/prop-types': 'off', // Using TypeScript instead
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  // Load custom rules
  plugins: [
    {
      rules: {
        'chakra-ui-v3/imports': require('./eslint-custom-rules/chakra-ui-v3-imports'),
        'chakra-ui-v3/props': require('./eslint-custom-rules/chakra-ui-v3-props'),
        'chakra-ui-v3/types': require('./eslint-custom-rules/chakra-ui-v3-types'),
      },
    },
  ],
};