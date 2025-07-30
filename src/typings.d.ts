/// <reference types="@testing-library/jest-dom" />

declare module "*.mdx" {
  const value: string;
  export default value;
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(className: string): R
      toBeVisible(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveTextContent(text: string | RegExp): R
      toHaveValue(value: string | string[] | number): R
      toBeChecked(): R
      toBeDisabled(): R
      toBeEmpty(): R
      toBeEmptyDOMElement(): R
      toBePartiallyChecked(): R
      toBeRequired(): R
      toBeValid(): R
      toBeInvalid(): R
      toHaveAccessibleDescription(expectedAccessibleDescription?: string | RegExp): R
      toHaveAccessibleName(expectedAccessibleName?: string | RegExp): R
      toHaveDisplayValue(expectedDisplayValue: string | RegExp | (string | RegExp)[]): R
      toHaveFormValues(expectedValues: Record<string, any>): R
      toHaveStyle(css: string | Record<string, any>): R
      toHaveFocus(): R
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace?: boolean }): R
      toHaveValue(value: string | string[] | number): R
    }
  }
}

export { }
