import Mysql from 'mysql'

declare namespace NodeMysql {
    interface ResultSetHeader {
        fieldCount: number
        affectedRows: number
        insertId: number
        info: string
        serverStatus: number
        warningStatus: number
    }

    type QueryResult = ResultSetHeader | any[]

    interface Streaming {
        streamQuery(query: string, params?: any): Mysql.Query
        streamQuery(query: Mysql.QueryOptions): Mysql.Query
        streamExecute(query: string, params?: any): Mysql.Query
        streamExecute(query: Mysql.QueryOptions): Mysql.Query
    }

    interface PromiseStreaming {
        streamQuery(query: string, params?: any): Promise<Mysql.Query>
        streamQuery(query: Mysql.QueryOptions): Promise<Mysql.Query>
        streamExecute(query: string, params?: any): Promise<Mysql.Query>
        streamExecute(query: Mysql.QueryOptions): Promise<Mysql.Query>
    }

    interface Closable {
        end(): Promise<void>
    }

    interface Queryable extends Mysql.EscapeFunctions {
        query(query: string, params?: any): Promise<QueryResult>
        query(query: Mysql.QueryOptions): Promise<QueryResult>

        execute(query: string, params?: any): Promise<QueryResult>
        execute(query: Mysql.QueryOptions): Promise<QueryResult>

        CONSTRANTS: Constrants
    }

    function escape(value: any, stringifyObjects?: boolean, timeZone?: string): string

    function escapeId(value: string, forbidQualified?: boolean): string

    function format(sql: string, values: any[], stringifyObjects?: boolean, timeZone?: string): string

    function raw(sql: string): () => string

    interface TransactionQuery extends Queryable, Streaming, Closable {
        commit(): Promise<void>
        rollback(): Promise<void>
    }

    type TransactionScope<T> = (conn: Queryable) => Promise<T>

    interface Pool extends Queryable, Closable, PromiseStreaming {
        beginTransaction(isoLevel?: string): Promise<TransactionQuery>
        beginTransaction<T>(scope: TransactionScope<T>): Promise<T>
        beginTransaction<T>(isoLevel: string, scope: TransactionScope<T>): Promise<T>
    }

    function createPool(options: Mysql.PoolConfig | string): Pool

    interface RawValue {
        toSqlString(): string
    }

    const CONSTRANTS: {
        NULL: RawValue
        CURRENT_TIMESTAMP: RawValue
        NOW: RawValue
    }
}

declare function NodeMysql(options: Mysql.PoolConfig | string): NodeMysql.Pool

export = NodeMysql