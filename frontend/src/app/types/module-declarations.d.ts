/**
 * Module declarations for the Fluxori frontend
 * These declarations help TypeScript recognize and properly type external modules
 */

// Declare modules for image files and other assets
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

// Add any other module declarations as needed