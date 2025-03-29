// Extended types for jsonwebtoken
import * as jwt from 'jsonwebtoken';

// Add StringValue type helper function
declare module 'jsonwebtoken' {
  // StringValue type for expiresIn
  export type StringValue = string & {
    readonly StringValueBrand: unique symbol;
  };
  
  // Helper function to convert a string to StringValue
  export function asStringValue(value: string): StringValue;
}