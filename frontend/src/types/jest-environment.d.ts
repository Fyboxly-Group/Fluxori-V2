// Global Jest namespace for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveTextContent(text: string | RegExp): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveValue(value: string | number | string[]): R
      toHaveStyle(style: string | { [key: string]: string }): R
      toBeDisabled(): R
      toBeEnabled(): R
      toBeChecked(): R
      toBeVisible(): R
      toHaveFocus(): R
    }
    
    type Mock<T = any, Y extends any[] = any> = {
      (...args: Y): T
      mockImplementation: (fn: (...args: Y) => T) => Mock<T, Y>
      mockReturnValue: (value: T) => Mock<T, Y>
      mockReturnValueOnce: (value: T) => Mock<T, Y>
      mockReset: () => void
      mockClear: () => void
      mockRestore: () => void
      mockResolvedValue: (value: T) => Mock<Promise<T>, Y>
      mockResolvedValueOnce: (value: T) => Mock<Promise<T>, Y>
      mockRejectedValue: (value: any) => Mock<Promise<never>, Y>
      mockRejectedValueOnce: (value: any) => Mock<Promise<never>, Y>
      mockImplementationOnce: (fn: (...args: Y) => T) => Mock<T, Y>
      getMockName: () => string
      getMockImplementation: () => ((...args: Y) => T) | undefined
      mock: {
        calls: Y[]
        instances: T[]
        invocationCallOrder: number[]
        results: Array<{ type: 'return' | 'throw', value: any }>
      }
    }
    
    interface Expect {
      <T = any>(actual: T): Matchers<void>
      objectContaining<T extends {}>(obj: T): T
      arrayContaining<T>(arr: T[]): T[]
      stringContaining(str: string): string
      stringMatching(regex: RegExp): string
      any(constructor: any): any
      anything(): any
    }
    
    function fn<T = any, Y extends any[] = any>(implementation?: (...args: Y) => T): Mock<T, Y>
    function spyOn<T extends {}, M extends keyof T>(obj: T, method: M): Mock<T[M], T[M] extends (...args: infer A) => any ? A : never>
    function mock(path: string, options?: any): any
    
    let expect: Expect
    let describe: (name: string, fn: () => void) => void
    let it: (name: string, fn: () => void | Promise<void>, timeout?: number) => void
    let test: typeof it
    let beforeAll: (fn: () => void | Promise<void>, timeout?: number) => void
    let afterAll: (fn: () => void | Promise<void>, timeout?: number) => void
    let beforeEach: (fn: () => void | Promise<void>, timeout?: number) => void
    let afterEach: (fn: () => void | Promise<void>, timeout?: number) => void
  }
}