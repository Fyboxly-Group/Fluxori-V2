import { Response } from 'supertest';

declare global {
  // Declare Jest globals to make TypeScript happy in test files
  const describe: (name: string, fn: () => void) => void;
  const it: (name: string, fn: () => void | Promise<void>) => void;
  const test: (name: string, fn: (done: jest.DoneCallback) => void | Promise<void>) => void;
  const expect: jest.Expect;
  const beforeAll: (fn: () => void | Promise<void>) => void;
  const afterAll: (fn: () => void | Promise<void>) => void;
  const beforeEach: (fn: () => void | Promise<void>) => void;
  const afterEach: (fn: () => void | Promise<void>) => void;
  
  // Also declare common mock namespaces
  namespace jest {
    interface Matchers<R> {
      toMatchObject(expected: any): R;
      toContain(expected: any): R;
      toContainEqual(expected: any): R;
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toHaveProperty(property: string, value?: any): R;
      toBeGreaterThan(expected: number): R;
      toBeLessThan(expected: number): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toBeUndefined(): R;
      toBeNull(): R;
      toBeInstanceOf(expected: any): R;
      toThrow(expected?: any): R;
    }

    type Mock<T = any> = {
      (...args: any[]): T;
      mock: {
        calls: any[][];
        instances: any[];
        invocationCallOrder: number[];
        results: any[];
      };
      mockClear(): void;
      mockReset(): void;
      mockRestore(): void;
      mockImplementation(fn: (...args: any[]) => T): Mock<T>;
      mockImplementationOnce(fn: (...args: any[]) => T): Mock<T>;
      mockReturnValue(value: T): Mock<T>;
      mockReturnValueOnce(value: T): Mock<T>;
      mockResolvedValue(value: any): Mock<Promise<T>>;
      mockResolvedValueOnce(value: any): Mock<Promise<T>>;
      mockRejectedValue(value: any): Mock<Promise<T>>;
      mockRejectedValueOnce(value: any): Mock<Promise<T>>;
      mockName(name: string): Mock<T>;
      getMockName(): string;
    };

    interface DoneCallback {
      (...args: any[]): any;
      fail(error?: string | { message: string }): any;
    }

    interface Expect {
      <T>(actual: T): jest.Matchers<void>;
    }

    // Add SpyInstance type
    type SpyInstance<T = any, Y extends any[] = any[]> = {
      (...args: Y): T;
      mockClear(): void;
      mockReset(): void;
      mockRestore(): void;
      mockImplementation(fn: (...args: Y) => T): SpyInstance<T, Y>;
      mockImplementationOnce(fn: (...args: Y) => T): SpyInstance<T, Y>;
      mockReturnValue(value: T): SpyInstance<T, Y>;
      mockReturnValueOnce(value: T): SpyInstance<T, Y>;
      mockResolvedValue<T>(value: T): SpyInstance<Promise<T>, Y>;
      mockResolvedValueOnce<T>(value: T): SpyInstance<Promise<T>, Y>;
      mockRejectedValue<T>(value: T): SpyInstance<Promise<T>, Y>;
      mockRejectedValueOnce<T>(value: T): SpyInstance<Promise<T>, Y>;
    };
  }
}

export {};