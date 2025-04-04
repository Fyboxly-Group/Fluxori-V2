// Declaration file for morgan logger middleware
declare module 'morgan' {
  import { Handler } from 'express';
  
  /**
   * Morgan logger middleware
   * @param format Format string or a predefined format name ('combined', 'common', 'dev', 'short', 'tiny')
   * @param options Configuration options
   */
  function morgan(format: string | morgan.FormatFn, options?: morgan.Options): Handler;
  
  namespace morgan {
    type FormatFn = (tokens: TokenIndexer, req: Request, res: Response) => string;
    
    interface TokenIndexer {
      [key: string]: TokenCallbackFn;
    }
    
    type TokenCallbackFn = (req: Request, res: Response, arg?: string | number | boolean) => string | undefined;
    
    interface Options {
      immediate?: boolean;
      skip?: (req: Request, res: Response) => boolean;
      stream?: { write: (str: string) => void };
    }
    
    // Predefined formats
    const combined: string;
    const common: string;
    const dev: string;
    const short: string;
    const tiny: string;
    
    // Token generators
    function token(name: string, fn: TokenCallbackFn): morgan;
    function compile(format: string): FormatFn;
  }
  
  export = morgan;
}