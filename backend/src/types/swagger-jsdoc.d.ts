declare module 'swagger-jsdoc' {
  export interface Options {
    definition: {
      openapi: string;
      info: {
        title: string;
        version: string;
        description?: string;
        [key: string]: any;
      };
      servers?: Array<{
        url: string;
        description?: string;
        [key: string]: any;
      }>;
      [key: string]: any;
    };
    apis: string[];
  }

  export default function swaggerJSDoc(options: Options): any;
}