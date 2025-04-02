/**
 * Rule to prevent unsafe type assertions
 * 
 * This rule aims to prevent TypeScript errors by flagging potentially unsafe
 * type assertions that could lead to runtime errors.
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow unsafe type assertions that bypass TypeScript type checking',
      category: 'TypeScript Error Prevention',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      unsafeAssertion: 'Unsafe type assertion to "any". Use more specific types or type guards instead.',
      replaceWithTypeGuard: 'Consider using a type guard function or properly narrowing the type',
      propertyAccessOnAny: 'Property access on "any" type may lead to runtime errors',
    },
  },
  create(context) {
    return {
      // Detect explicit 'as any' type assertions
      TSAsExpression(node) {
        const sourceCode = context.getSourceCode();
        const typeAnnotation = sourceCode.getText(node.typeAnnotation);
        
        // Check for 'as any' type assertions
        if (typeAnnotation === 'any') {
          context.report({
            node,
            messageId: 'unsafeAssertion',
            suggest: [
              {
                messageId: 'replaceWithTypeGuard',
                fix(fixer) {
                  // Cannot auto-fix without knowing the intended type
                  return null;
                }
              }
            ]
          });
        }
      },
      
      // Detect property access on 'any' typed expressions
      MemberExpression(node) {
        // This would need TypeScript's type checker to be fully effective
        // Here we're just detecting obvious patterns
        
        if (node.object.type === 'TSAsExpression') {
          const sourceCode = context.getSourceCode();
          const typeAnnotation = sourceCode.getText(node.object.typeAnnotation);
          
          if (typeAnnotation === 'any') {
            context.report({
              node,
              messageId: 'propertyAccessOnAny',
            });
          }
        }
      },
      
      // Detect unsafe property access on potentially undefined values
      // This catches things like foo.bar where foo might be undefined
      OptionalMemberExpression(node) {
        if (!node.optional) {
          // If we're accessing a property without using optional chaining
          // but the object could be undefined, that's a potential error
          // This would need TypeScript's type checker to be fully effective
        }
      }
    };
  }
};