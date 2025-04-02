/**
 * ESLint plugin to register the Chakra to Lucide icon migration rule
 */
const iconMigrationRule = require('./chakra-icons-to-lucide');

module.exports = {
  rules: {
    'replace-icons': iconMigrationRule
  }
};