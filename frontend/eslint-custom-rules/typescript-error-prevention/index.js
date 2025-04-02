/**
 * ESLint plugin for preventing common TypeScript errors
 */

module.exports = {
  rules: {
    'no-unsafe-type-assertion': require('./rules/no-unsafe-type-assertion'),
    'array-callback-typing': require('./rules/array-callback-typing'),
    'require-api-response-typing': require('./rules/require-api-response-typing'),
    'safe-optional-chain': require('./rules/safe-optional-chain'),
    'no-missing-default-export': require('./rules/no-missing-default-export'),
  },
};