/**
 * ESLint Plugin for MongoDB/Mongoose
 * 
 * Custom rules to enforce proper MongoDB and Mongoose patterns in TypeScript
 */

module.exports = {
  rules: {
    // Rule to enforce proper ObjectId handling
    'proper-objectid': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce proper handling of MongoDB ObjectIds',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: 'code',
        schema: [], // no options
      },
      create(context) {
        return {
          // Check for raw ObjectId string comparisons
          'BinaryExpression[operator="===" or operator="=="]'(node) {
            if (
              (node.left.type === 'MemberExpression' && node.left.property.name === '_id' && node.right.type === 'Literal') ||
              (node.right.type === 'MemberExpression' && node.right.property.name === '_id' && node.left.type === 'Literal')
            ) {
              context.report({
                node,
                message: 'Comparing ObjectId directly with string. Use .toString() or dedicated helper function.',
                fix: function(fixer) {
                  if (node.left.type === 'MemberExpression' && node.left.property.name === '_id') {
                    return fixer.replaceText(node.left, `${context.getSource(node.left)}.toString()`);
                  } else {
                    return fixer.replaceText(node.right, `${context.getSource(node.right)}.toString()`);
                  }
                }
              });
            }
          },
          
          // Check for new ObjectId without proper error handling
          'NewExpression[callee.name="ObjectId"], NewExpression[callee.property.name="ObjectId"]'(node) {
            let hasErrorHandling = false;
            let current = node;
            
            // Check if the expression is within a try-catch block
            while (current.parent) {
              if (current.parent.type === 'TryStatement') {
                hasErrorHandling = true;
                break;
              }
              current = current.parent;
            }
            
            if (!hasErrorHandling) {
              context.report({
                node,
                message: 'ObjectId creation should be in try-catch block to handle invalid IDs',
              });
            }
          },
          
          // Check for MongoDB operations without await
          'CallExpression[callee.property.name=/^(find|findOne|findById|updateOne|updateMany|deleteOne|deleteMany|aggregate|create|save)$/]'(node) {
            const isAwaitedOrPromiseHandled = 
              node.parent.type === 'AwaitExpression' || 
              (node.parent.type === 'MemberExpression' && 
               (node.parent.property.name === 'then' || node.parent.property.name === 'catch'));
            
            if (!isAwaitedOrPromiseHandled) {
              context.report({
                node,
                message: 'MongoDB operation should be awaited or handled with .then()/.catch()',
              });
            }
          },
        };
      },
    },
    
    // Rule to enforce proper schema definition
    'properly-typed-schema': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce proper typing of Mongoose schemas',
          category: 'Best Practices',
          recommended: true,
        },
        schema: [], // no options
      },
      create(context) {
        return {
          // Check for schema definition without type
          'NewExpression[callee.name="Schema"], NewExpression[callee.property.name="Schema"]'(node) {
            const sourceCode = context.getSourceCode();
            const schemaText = sourceCode.getText(node.arguments[0]);
            
            // Check if schema definition has type fields
            if (schemaText && !schemaText.includes('type:')) {
              context.report({
                node,
                message: 'Mongoose schema fields should include explicit type definitions',
              });
            }
          },
          
          // Check for pre/post hooks without proper callback typing
          'CallExpression[callee.property.name="pre"], CallExpression[callee.property.name="post"]'(node) {
            if (node.arguments.length > 1 && node.arguments[1].type === 'FunctionExpression') {
              const callbackArg = node.arguments[1].params[0];
              
              if (callbackArg && !callbackArg.typeAnnotation) {
                context.report({
                  node: callbackArg,
                  message: 'Mongoose hook callback should be properly typed',
                });
              }
            }
          },
        };
      },
    },
    
    // Rule to enforce proper error handling in Mongoose operations
    'mongoose-error-handling': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce proper error handling for Mongoose operations',
          category: 'Best Practices',
          recommended: true,
        },
        schema: [], // no options
      },
      create(context) {
        return {
          'TryStatement'(node) {
            // Check if try block contains Mongoose operations
            const sourceCode = context.getSourceCode();
            const tryBlockText = sourceCode.getText(node.block);
            
            const mongooseOperations = [
              'find(', 'findOne(', 'findById(', 'create(', 'save(',
              'updateOne(', 'updateMany(', 'deleteOne(', 'deleteMany(', 
              'aggregate('
            ];
            
            const hasMongooseOperation = mongooseOperations.some(op => tryBlockText.includes(op));
            
            if (hasMongooseOperation && node.handler) {
              // Check if the catch clause properly narrows the error type
              const catchParam = node.handler.param;
              const catchBlockText = sourceCode.getText(node.handler.body);
              
              if (catchParam && catchBlockText) {
                const properErrorCheck = [
                  `${catchParam.name} instanceof Error`, 
                  `${catchParam.name} instanceof mongoose.Error`,
                  `${catchParam.name}.name ===`,
                  `typeof ${catchParam.name}.message ===`
                ];
                
                const hasProperErrorCheck = properErrorCheck.some(check => catchBlockText.includes(check));
                
                if (!hasProperErrorCheck) {
                  context.report({
                    node: node.handler,
                    message: 'Catch clause should include proper error type narrowing for Mongoose errors',
                  });
                }
              }
            }
          },
        };
      },
    },
    
    // Rule to prevent unhandled queries
    'no-unhandled-query': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent unhandled MongoDB queries',
          category: 'Best Practices',
          recommended: true,
        },
        schema: [], // no options
      },
      create(context) {
        return {
          // Check for mongoose query that is not assigned, awaited, or returned
          'CallExpression[callee.property.name=/^(find|findOne|findById|updateOne|updateMany|deleteOne|deleteMany|aggregate)$/]'(node) {
            const isAssigned = node.parent.type === 'VariableDeclarator' || 
                              node.parent.type === 'AssignmentExpression';
            
            const isHandled = node.parent.type === 'AwaitExpression' || 
                             node.parent.type === 'ReturnStatement' ||
                             (node.parent.type === 'MemberExpression' && 
                              ['then', 'catch', 'exec'].includes(node.parent.property.name));
            
            if (!isAssigned && !isHandled) {
              context.report({
                node,
                message: 'MongoDB query result is not handled (assign, await, or return it)',
              });
            }
          },
        };
      },
    },
    
    // Rule to enforce proper use of lean() method
    'use-lean-when-appropriate': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce the use of .lean() when appropriate',
          category: 'Best Practices',
          recommended: true,
        },
        schema: [], // no options
      },
      create(context) {
        return {
          // Check for find operations without lean() in read-only contexts
          'CallExpression[callee.property.name=/^(find|findOne|findById)$/]'(node) {
            // Skip if it's part of an update chain
            let current = node;
            let hasUpdateMethod = false;
            let hasLeanMethod = false;
            
            while (current.parent && current.parent.type === 'MemberExpression') {
              if (current.parent.property.name === 'lean') {
                hasLeanMethod = true;
                break;
              }
              
              if (['save', 'update', 'updateOne', 'findOneAndUpdate'].includes(current.parent.property.name)) {
                hasUpdateMethod = true;
                break;
              }
              
              current = current.parent;
            }
            
            // If it's used only for reading and doesn't have .lean(), suggest adding it
            if (!hasUpdateMethod && !hasLeanMethod) {
              const parentFunction = context.getScope().block;
              if (parentFunction && parentFunction.type.includes('Function')) {
                const functionBody = context.getSourceCode().getText(parentFunction.body);
                
                // If function doesn't modify the result, suggest lean()
                const isReadOnly = !functionBody.includes('.save(') && 
                                  !functionBody.includes('.$set') &&
                                  !functionBody.includes('.markModified');
                
                if (isReadOnly) {
                  context.report({
                    node,
                    message: 'Consider using .lean() for read-only query to improve performance',
                  });
                }
              }
            }
          },
        };
      },
    },
  }
};