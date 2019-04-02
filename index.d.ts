import Mysql from 'mysql'

export declare interface ResultSetHeader {
    fieldCount: number
    affectedRows: number
    insertId: number
    info: string
    serverStatus: number
    warningStatus: number
}

export declare type QueryResult = ResultSetHeader | any[]

export declare interface Streaming {
    streamQuery(query: string, params?: any): Mysql.Query
    streamQuery(query: Mysql.QueryOptions): Mysql.Query
    streamExecute(query: string, params?: any): Mysql.Query
    streamExecute(query: Mysql.QueryOptions): Mysql.Query
}

export declare interface PromiseStreaming {
    streamQuery(query: string, params?: any): Promise<Mysql.Query>
    streamQuery(query: Mysql.QueryOptions): Promise<Mysql.Query>
    streamExecute(query: string, params?: any): Promise<Mysql.Query>
    streamExecute(query: Mysql.QueryOptions): Promise<Mysql.Query>
}

export declare interface Closable {
    end(): Promise<void>
}

export declare interface Queryable extends Mysql.EscapeFunctions {
    query(query: string, params?: any): Promise<QueryResult>
    query(query: Mysql.QueryOptions): Promise<QueryResult>

    execute(query: string, params?: any): Promise<QueryResult>
    execute(query: Mysql.QueryOptions): Promise<QueryResult>

    CONSTRANTS: Constrants
}

export function escape(value: any, stringifyObjects?: boolean, timeZone?: string): string

export function escapeId(value: string, forbidQualified?: boolean): string

export function format(sql: string, values: any[], stringifyObjects?: boolean, timeZone?: string): string

export function raw(sql: string): () => string

export declare interface TransactionQuery extends Queryable, Streaming, Closable {
    commit(): Promise<void>
    rollback(): Promise<void>
}

export declare type TransactionScope<T> = (conn: Queryable) => Promise<T>

declare interface Pool extends Queryable, Closable, PromiseStreaming {
    
}

declare class Pool {
    beginTransaction(isoLevel?: string): Promise<TransactionQuery>
    beginTransaction(scope: TransactionScope<T>): Promise<T>
    beginTransaction(isoLevel: string, scope: TransactionScope<T>): Promise<T>
}

declare function createPool(options: Mysql.PoolConfig | string): Pool

export declare interface RawValue {
    toSqlString(): string
}

declare interface Constrants {
    NULL: RawValue
    CURRENT_TIMESTAMP: RawValue
    NOW: RawValue
}

export const CONSTRANTS: Constrants

export = createPool