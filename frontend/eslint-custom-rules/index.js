module.exports = {
  rules: {
    'chakra-ui-v3-imports': require('./chakra-ui-v3-imports'),
    'chakra-ui-v3-props': require('./chakra-ui-v3-props'),
    'chakra-ui-v3-types': require('./chakra-ui-v3-types'),
    'icons-to-lucide': require('./chakra-icons-to-lucide'),
  },
};

// Register the typescript-error-prevention plugin
module.exports.plugins = [
  {
    name: 'typescript-error-prevention',
    rules: require('./typescript-error-prevention').rules,
  }
];