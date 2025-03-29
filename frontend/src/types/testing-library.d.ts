// Type declarations for testing libraries

declare module '@testing-library/react' {
  import { ReactElement } from 'react'
  
  export interface RenderOptions {
    container?: HTMLElement
    baseElement?: HTMLElement
    hydrate?: boolean
    wrapper?: React.ComponentType<{children: React.ReactNode}>
  }
  
  export interface RenderResult {
    container: HTMLElement
    baseElement: HTMLElement
    debug: (baseElement?: HTMLElement | DocumentFragment) => void
    rerender: (ui: React.ReactElement) => void
    unmount: () => void
    asFragment: () => DocumentFragment
    findByText: (text: string | RegExp) => Promise<HTMLElement>
    findAllByText: (text: string | RegExp) => Promise<HTMLElement[]>
    findByRole: (role: string, options?: any) => Promise<HTMLElement>
    findAllByRole: (role: string, options?: any) => Promise<HTMLElement[]>
    findByLabelText: (label: string | RegExp) => Promise<HTMLElement>
    findAllByLabelText: (label: string | RegExp) => Promise<HTMLElement[]>
    findByPlaceholderText: (text: string | RegExp) => Promise<HTMLElement>
    findAllByPlaceholderText: (text: string | RegExp) => Promise<HTMLElement[]>
    findByTestId: (testId: string) => Promise<HTMLElement>
    findAllByTestId: (testId: string) => Promise<HTMLElement[]>
    getByText: (text: string | RegExp) => HTMLElement
    getAllByText: (text: string | RegExp) => HTMLElement[]
    getByRole: (role: string, options?: any) => HTMLElement
    getAllByRole: (role: string, options?: any) => HTMLElement[]
    getByLabelText: (label: string | RegExp) => HTMLElement
    getAllByLabelText: (label: string | RegExp) => HTMLElement[]
    getByPlaceholderText: (text: string | RegExp) => HTMLElement
    getAllByPlaceholderText: (text: string | RegExp) => HTMLElement[]
    getByTestId: (testId: string) => HTMLElement
    getAllByTestId: (testId: string) => HTMLElement[]
    queryByText: (text: string | RegExp) => HTMLElement | null
    queryAllByText: (text: string | RegExp) => HTMLElement[]
    queryByRole: (role: string, options?: any) => HTMLElement | null
    queryAllByRole: (role: string, options?: any) => HTMLElement[]
    queryByLabelText: (label: string | RegExp) => HTMLElement | null
    queryAllByLabelText: (label: string | RegExp) => HTMLElement[]
    queryByPlaceholderText: (text: string | RegExp) => HTMLElement | null
    queryAllByPlaceholderText: (text: string | RegExp) => HTMLElement[]
    queryByTestId: (testId: string) => HTMLElement | null
    queryAllByTestId: (testId: string) => HTMLElement[]
  }
  
  export function render(ui: ReactElement, options?: Omit<RenderOptions, 'queries'>): RenderResult
  export const screen: {
    getByText: (text: string | RegExp) => HTMLElement
    getAllByText: (text: string | RegExp) => HTMLElement[]
    getByRole: (role: string, options?: any) => HTMLElement
    getAllByRole: (role: string, options?: any) => HTMLElement[]
    getByLabelText: (label: string | RegExp) => HTMLElement
    getAllByLabelText: (label: string | RegExp) => HTMLElement[]
    getByPlaceholderText: (text: string | RegExp) => HTMLElement
    getAllByPlaceholderText: (text: string | RegExp) => HTMLElement[]
    getByTestId: (testId: string) => HTMLElement
    getAllByTestId: (testId: string) => HTMLElement[]
    queryByText: (text: string | RegExp) => HTMLElement | null
    queryAllByText: (text: string | RegExp) => HTMLElement[]
    queryByRole: (role: string, options?: any) => HTMLElement | null
    queryAllByRole: (role: string, options?: any) => HTMLElement[]
    queryByLabelText: (label: string | RegExp) => HTMLElement | null
    queryAllByLabelText: (label: string | RegExp) => HTMLElement[]
    queryByPlaceholderText: (text: string | RegExp) => HTMLElement | null
    queryAllByPlaceholderText: (text: string | RegExp) => HTMLElement[]
    queryByTestId: (testId: string) => HTMLElement | null
    queryAllByTestId: (testId: string) => HTMLElement[]
    findByText: (text: string | RegExp) => Promise<HTMLElement>
    findAllByText: (text: string | RegExp) => Promise<HTMLElement[]>
    findByRole: (role: string, options?: any) => Promise<HTMLElement>
    findAllByRole: (role: string, options?: any) => Promise<HTMLElement[]>
    findByLabelText: (label: string | RegExp) => Promise<HTMLElement>
    findAllByLabelText: (label: string | RegExp) => Promise<HTMLElement[]>
    findByPlaceholderText: (text: string | RegExp) => Promise<HTMLElement>
    findAllByPlaceholderText: (text: string | RegExp) => Promise<HTMLElement[]>
    findByTestId: (testId: string) => Promise<HTMLElement>
    findAllByTestId: (testId: string) => Promise<HTMLElement[]>
  }
  
  export function waitFor<T>(callback: () => T | Promise<T>, options?: { timeout?: number, interval?: number }): Promise<T>
  export const fireEvent: {
    click: (element: HTMLElement) => boolean
    change: (element: HTMLElement, options?: any) => boolean
    submit: (element: HTMLElement) => boolean
    blur: (element: HTMLElement) => boolean
    focus: (element: HTMLElement) => boolean
  }

  export function act(callback: () => void | Promise<void>): Promise<void> | void
}

declare module '@testing-library/jest-dom' {
  global {
    namespace jest {
      interface Matchers<R> {
        toBeInTheDocument(): R
        toBeVisible(): R
        toBeDisabled(): R
        toBeEnabled(): R
        toBeInvalid(): R
        toBeValid(): R
        toBeRequired(): R
        toBeChecked(): R
        toHaveAttribute(attr: string, value?: any): R
        toHaveClass(...classNames: string[]): R
        toHaveStyle(style: string | object): R
        toHaveTextContent(text: string | RegExp): R
        toHaveValue(value: string | number | string[]): R
        toBeEmpty(): R
        toHaveFocus(): R
        toContainElement(element: HTMLElement | null): R
        toContainHTML(htmlText: string): R
      }
    }
  }
}

declare module '@testing-library/user-event' {
  export interface UserEvent {
    click: (element: HTMLElement) => Promise<void>
    dblClick: (element: HTMLElement) => Promise<void>
    type: (element: HTMLElement, text: string, options?: { delay?: number }) => Promise<void>
    clear: (element: HTMLElement) => Promise<void>
    selectOptions: (element: HTMLElement, values: string | string[]) => Promise<void>
    tab: (options?: { shift?: boolean }) => Promise<void>
    hover: (element: HTMLElement) => Promise<void>
    unhover: (element: HTMLElement) => Promise<void>
  }
  
  export default function userEvent(): UserEvent
}