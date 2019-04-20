import mysql from 'mysql'

declare namespace Mysql {
    interface ResultSetHeader {
        fieldCount: number
        affectedRows: number
        insertId: number
        info: string
        serverStatus: number
        warningStatus: number
        changedRows: number
    }

    type QueryResult = ResultSetHeader & any[]

    type IsolationLevel = 'repeatable read' | 'read uncommitted' | 'read committed' | 'serializable'

    interface RawValue {
        toSqlString(): string
    }

    interface Constrants {
        NOW: RawValue
        CURRENT_TIMESTAMP: RawValue
        NULL: RawValue
        [x: string]: RawValue
    }

    /**
     * 提供基础查询方法的接口
     */
    interface IQuery {
        query(query: mysql.QueryOptions): Promise<QueryResult>
        query(sql: string, values?: any): Promise<QueryResult>
        execute(query: mysql.QueryOptions): Promise<QueryResult>
        execute(sql: string, values?: any): Promise<QueryResult>
        streaming(query: mysql.QueryOptions): mysql.Query
        streaming(sql: string, values?: any): mysql.Query
        queryOne(query: mysql.QueryOptions): Promise<any>
        queryOne(sql: string, values?: any): Promise<any>
        queryField(query: mysql.QueryOptions): Promise<any>
        queryField(sql: string, values?: any): Promise<any>
    }

    /**
     * 提供转义方法的接口
     */
    interface IEscape {
        format(sql: string, values?: any): string
        escape(value: any, stringifyObjects?: boolean, timeZone?: string): string
        escapeId(val: string, forbidQualified?: boolean): string
        raw(sql: string): RawValue
    }

    interface Connection extends IQuery, IEscape {
        constrants: Constrants
    }
    interface TransactionConnection extends Connection {
        commit(): Promise<void>
        rollback(): Promise<void>
    }
    interface IDisposable {
        end(): Promise<void>
    }

    interface Client extends TransactionConnection, IDisposable {
        changeUser(options: mysql.ConnectionOptions): Promise<void>
        beginTransaction(isolationLevel?: IsolationLevel): Promise<void>
        pause(): void
        resume(): void
    }

    type TransactionScope<T> = (conn: Connection) => Promise<T>

    interface Pool extends Connection, IDisposable {
        createClient(): Client
        beginTransaction(isolationLevel?: IsolationLevel): Promise<TransactionConnection & IDisposable>
        beginTransaction<T>(scope: TransactionScope<T>): Promise<T>
        beginTransaction<T>(isolationLevel: IsolationLevel, scope: TransactionScope<T>): Promise<T>
    }

    const constrants: Constrants

    interface ConnectionConfig extends mysql.ConnectionConfig { }
    interface PoolConfig extends mysql.PoolConfig { }
    
    function createPool(options: string | PoolConfig): Mysql.Pool
    function createClient(options: string | ConnectionConfig): Client
    function format(sql: string, values ?: any): string
    function escape(value: any, stringifyObjects ?: boolean, timeZone ?: string): string
    function escapeId(val: string, forbidQualified ?: boolean): string
    function raw(sql: string): RawValue
}

declare function Mysql(options: string | Mysql.PoolConfig): Mysql.Pool

export = Mysql