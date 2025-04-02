// Type declarations for mongoose
declare module 'mongoose' {
  import { EventEmitter } from 'events';
  import { Stream } from 'stream';
  
  // Basic mongoose types
  export class Schema {
    constructor(definition: any, options?: any);
    static Types: any;
    add(fields: any): void;
    index(fields: any, options?: any): void;
    method(name: string, fn: Function): void;
    pre(method: string, fn: Function): void;
    post(method: string, fn: Function): void;
    virtual(name: string): any;
    // Add more Schema methods as needed
  }
  
  export class Model {
    constructor(doc?: any);
    static find(conditions?: any, projection?: any, options?: any): Query<any[], any>;
    static findOne(conditions?: any, projection?: any, options?: any): Query<any, any>;
    static findById(id: any, projection?: any, options?: any): Query<any, any>;
    static findByIdAndUpdate(id: any, update: any, options?: any): Query<any, any>;
    static findByIdAndDelete(id: any, options?: any): Query<any, any>;
    static updateOne(conditions: any, update: any, options?: any): Query<any, any>;
    static updateMany(conditions: any, update: any, options?: any): Query<any, any>;
    static deleteOne(conditions: any, options?: any): Query<any, any>;
    static deleteMany(conditions: any, options?: any): Query<any, any>;
    static countDocuments(conditions: any): Query<number, any>;
    static aggregate(pipeline: any[]): Aggregate<any[]>;
    save(options?: any): Promise<this>;
    // Add more Model methods as needed
  }
  
  export interface Document {
    _id: any;
    save(options?: any): Promise<this>;
    // Add more Document properties as needed
  }
  
  export class Query<ResultType, DocType> {
    exec(): Promise<ResultType>;
    then<TResult1 = ResultType, TResult2 = never>(
      onfulfilled?: ((value: ResultType) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): Promise<TResult1 | TResult2>;
    sort(args: any): this;
    skip(n: number): this;
    limit(n: number): this;
    select(arg: any): this;
    populate(path: string | any, select?: string): this;
    // Add more Query methods as needed
  }
  
  export class Aggregate<ResultType> {
    exec(): Promise<ResultType>;
    then<TResult1 = ResultType, TResult2 = never>(
      onfulfilled?: ((value: ResultType) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): Promise<TResult1 | TResult2>;
    // Add more Aggregate methods as needed
  }
  
  export interface Connection extends EventEmitter {
    // Add Connection properties and methods
  }
  
  export namespace Types {
    export class ObjectId {
      constructor(id?: string | number | ObjectId);
      toHexString(): string;
      toString(): string;
      // Add more ObjectId methods as needed
    }
    
    export class Decimal128 {
      constructor(value: string);
    }
    
    export class DocumentArray extends Array {
      // Add DocumentArray methods
    }
    
    export class Embedded {
      // Add Embedded properties
    }
    
    export class Map extends global.Map {
      // Add Map methods
    }
    
    export class Subdocument {
      // Add Subdocument properties
    }
  }
  
  // Mongoose globals
  export function model<T>(name: string, schema?: Schema): Model & T;
  export function connect(uri: string, options?: any): Promise<typeof mongoose>;
  export function createConnection(uri: string, options?: any): Connection;
  export function disconnect(): Promise<void>;
  
  // Export the mongoose namespace
  const mongoose: {
    connect: typeof connect;
    disconnect: typeof disconnect;
    connection: Connection;
    connections: Connection[];
    models: { [key: string]: Model };
    Schema: typeof Schema;
    Types: typeof Types;
    model: typeof model;
    // Add more properties as needed
  };
  
  export default mongoose;
}