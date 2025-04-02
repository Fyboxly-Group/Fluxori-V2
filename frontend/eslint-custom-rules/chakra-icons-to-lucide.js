/**
 * ESLint rule to detect Chakra UI icon imports and suggest migrating to Lucide React
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Replace Chakra UI icons with Lucide React equivalents',
      category: 'Chakra UI',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      useReplacement: 'Use {{replacement}} from lucide-react instead of {{original}} from @chakra-ui/icons',
      useLucide: 'Use lucide-react icons instead of @chakra-ui/icons'
    }
  },
  create(context) {
    // Map Chakra icons to their Lucide equivalents
    const iconMap = {
      // Basic shapes and actions
      'CheckIcon': 'Check',
      'CloseIcon': 'X',
      'AddIcon': 'Plus',
      'MinusIcon': 'Minus',
      'SmallAddIcon': 'Plus',
      'SmallCloseIcon': 'X',
      
      // Chevrons and arrows
      'ChevronDownIcon': 'ChevronDown',
      'ChevronUpIcon': 'ChevronUp',
      'ChevronLeftIcon': 'ChevronLeft',
      'ChevronRightIcon': 'ChevronRight',
      'ArrowBackIcon': 'ArrowLeft',
      'ArrowForwardIcon': 'ArrowRight',
      'ArrowUpIcon': 'ArrowUp',
      'ArrowDownIcon': 'ArrowDown',
      'ArrowLeftIcon': 'ArrowLeft',
      'ArrowRightIcon': 'ArrowRight',
      
      // Common UI actions
      'SearchIcon': 'Search',
      'EditIcon': 'Edit',
      'DeleteIcon': 'Trash',
      'ViewIcon': 'Eye',
      'ViewOffIcon': 'EyeOff',
      'DownloadIcon': 'Download',
      'UploadIcon': 'Upload',
      'RepeatIcon': 'RotateCw',
      'RepeatClockIcon': 'RotateClockwise',
      'CalendarIcon': 'Calendar',
      'TimeIcon': 'Clock',
      'SpinnerIcon': 'Loader',
      'StarIcon': 'Star',
      'LinkIcon': 'Link',
      'ExternalLinkIcon': 'ExternalLink',
      'EmailIcon': 'Mail',
      'PhoneIcon': 'Phone',
      'AttachmentIcon': 'Paperclip',
      'LockIcon': 'Lock',
      'UnlockIcon': 'Unlock',
      
      // Notifications and statuses
      'WarningIcon': 'AlertTriangle',
      'InfoIcon': 'Info',
      'InfoOutlineIcon': 'Info',
      'QuestionIcon': 'HelpCircle',
      'QuestionOutlineIcon': 'HelpCircle',
      'WarningTwoIcon': 'AlertCircle',
      'NotAllowedIcon': 'XCircle',
      'TriangleDownIcon': 'ChevronDown',
      'TriangleUpIcon': 'ChevronUp',
      'BellIcon': 'Bell',
      
      // Media and content
      'CopyIcon': 'Copy',
      'HamburgerIcon': 'Menu',
      'SunIcon': 'Sun',
      'MoonIcon': 'Moon',
      'SettingsIcon': 'Settings',
      'ChatIcon': 'MessageSquare',
      'AtSignIcon': 'AtSign',
      'PlusSquareIcon': 'PlusSquare',
      'MinusSquareIcon': 'MinusSquare',
    };

    // Return the ESLint rule
    return {
      // Check import declarations
      ImportDeclaration(node) {
        // Look for @chakra-ui/icons imports
        if (node.source.value === '@chakra-ui/icons') {
          const imports = node.specifiers
            .filter(specifier => specifier.type === 'ImportSpecifier')
            .map(specifier => specifier.imported.name);
            
          const replacements = imports
            .filter(name => iconMap[name])
            .map(name => ({ original: name, replacement: iconMap[name] }));
            
          // Create a replacement import statement
          if (replacements.length > 0) {
            const replacementSpecifiers = replacements
              .map(r => r.replacement)
              .sort() // Sort them alphabetically for consistency
              .join(', ');
              
            const replacementCode = `import { ${replacementSpecifiers} } from 'lucide-react';`;
            
            // Report each icon with its specific replacement
            replacements.forEach(({ original, replacement }) => {
              context.report({
                node,
                messageId: 'useReplacement',
                data: {
                  original,
                  replacement
                },
                fix(fixer) {
                  return fixer.replaceText(node, replacementCode);
                }
              });
            });
          } else {
            // General message if no specific replacements found
            context.report({
              node,
              messageId: 'useLucide',
              fix(fixer) {
                return fixer.replaceText(
                  node, 
                  `import { /* TODO: Add specific Lucide icons */ } from 'lucide-react';`
                );
              }
            });
          }
        }
      }
    };
  }
};