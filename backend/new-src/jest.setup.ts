/**
 * Jest setup file for global test configuration
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/fluxori-test';

// Global test timeout (5 seconds)
jest.setTimeout(5000);

// Add custom matchers
expect.extend({
  /**
   * Custom matcher for checking if an object has a specific structure
   * @param received - Object to check
   * @param expected - Expected keys
   * @returns Matcher result
   */
  toHaveStructure(received: Record<string, unknown>, expected: string[]) {
    const pass = expected.every(key => Object.prototype.hasOwnProperty.call(received, key));
    
    if (pass) {
      return {
        message: () => `expected ${received} not to have structure with keys: ${expected.join(', ')}`,
        pass: true,
      };
    } else {
      const missingKeys = expected.filter(key => !Object.prototype.hasOwnProperty.call(received, key));
      
      return {
        message: () => `expected ${JSON.stringify(received)} to have structure with keys: ${expected.join(', ')}\nMissing keys: ${missingKeys.join(', ')}`,
        pass: false,
      };
    }
  },
});

// Global teardown
afterAll(async () => {
  // MongoDB in-memory server cleanup will be added here when created
});