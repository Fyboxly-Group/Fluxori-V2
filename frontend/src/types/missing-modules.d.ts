import React from 'react';
/**
 * Declaration file for missing modules
 * Generated automatically by fix-frontend-ts-errors-enhanced.js
 */
/// <reference path="../types/module-declarations.d.ts" />


// HTML to Canvas
declare module 'html2canvas' {
  export interface Html2CanvasOptions {
    allowTaint?: boolean;
    backgroundColor?: string;
    canvas?: HTMLCanvasElement;
    foreignObjectRendering?: boolean;
    logging?: boolean;
    proxy?: string;
    removeContainer?: boolean;
    scale?: number;
    useCORS?: boolean;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    scrollX?: number;
    scrollY?: number;
    windowWidth?: number;
    windowHeight?: number;
  }

  export default function html2canvas(
    element: HTMLElement,
    options?: Html2CanvasOptions
  ): Promise<HTMLCanvasElement>;
}

// Chart.js
declare module 'chart.js/auto' {
  export * from 'chart.js';
}

// React Hook Form
declare module 'react-hook-form' {
  export interface RegisterOptions {
    required?: boolean | string;
    min?: number | { value: number; message: string };
    max?: number | { value: number; message: string };
    maxLength?: number | { value: number; message: string };
    minLength?: number | { value: number; message: string };
    pattern?: RegExp | { value: RegExp; message: string };
    validate?: (value: any) => boolean | string | Promise<boolean | string>;
  }

  export interface UseFormRegisterReturn {
    onChange: (...event: any[]) => void;
    onBlur: (...event: any[]) => void;
    ref: React.Ref<any>;
    name: string;
  }

  export interface FieldError {
    type: string;
    message?: string;
  }

  export interface FieldErrors {
    [key: string]: FieldError;
  }

  export interface UseFormReturn {
    register: (name: string, options?: RegisterOptions) => UseFormRegisterReturn;
    handleSubmit: (callback: (data: any) => void) => (e: React.FormEvent) => void;
    formState: {
      errors: FieldErrors;
      isSubmitting: boolean;
      isValid: boolean;
      isDirty: boolean;
      touchedFields: Record<string, boolean>;
      dirtyFields: Record<string, boolean>;
    };
    watch: (name?: string | string[]) => any;
    setValue: (name: string, value: any, options?: Record<string, boolean>) => void;
    getValues: (name?: string | string[]) => any;
    reset: (values?: Record<string, any>) => void;
    clearErrors: (name?: string | string[]) => void;
    setError: (name: string, error: FieldError) => void;
    trigger: (name?: string | string[]) => Promise<boolean>;
    control: any;
  }

  export function useForm<TFieldValues = Record<string, any>>(
    options?: Record<string, any>
  ): UseFormReturn;
}