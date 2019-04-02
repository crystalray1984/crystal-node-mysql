'use strict'

const Mysql = require('mysql2')

const CONSTRANTS = {
    NOW: Mysql.raw('NOW()'),
    CURRENT_TIMESTAMP: Mysql.raw('CURRENT_TIMESTAMP'),
    NULL: Mysql.raw('NULL')
}

/**
 * 提供数据查询方法的连接对象
 */
class Queryable {
    /**
     * 
     * @param {Mysql.Connection} conn 
     */
    constructor(conn) {
        this.conn = conn
    }

    query(...args) {
        return new Promise((resolve, reject) => {
            let options = args[0]
            if (typeof options === 'string') {
                options = {
                    sql: options
                }
            }
            
            if (args.length > 1) {
                options.values = args[1]
            }

            this.conn.query(options, (err, results, fields) => {
                if (err) {
                    reject(err)
                }
                else {
                    if (options.fields) {
                        resolve([results, fields])
                    }
                    else {
                        resolve(results)
                    }
                }
            })
        })
    }

    streamQuery(...args) {
        let options = args[0]
        if (typeof options === 'string') {
            options = {
                sql: options
            }
        }

        if (args.length > 1) {
            options.values = args[1]
        }

        return this.conn.query(options)
    }

    execute(...args) {
        return new Promise((resolve, reject) => {
            let options = args[0]
            if (typeof options === 'string') {
                options = {
                    sql: options
                }
            }

            if (args.length > 1) {
                options.values = args[1]
            }

            this.conn.execute(options, (err, results, fields) => {
                if (err) {
                    reject(err)
                }
                else {
                    if (options.fields) {
                        resolve([results, fields])
                    }
                    else {
                        resolve(results)
                    }
                }
            })
        })
    }

    streamExecute(...args) {
        let options = args[0]
        if (typeof options === 'string') {
            options = {
                sql: options
            }
        }

        if (args.length > 1) {
            options.values = args[1]
        }

        return this.conn.execute(options)
    }

    format(...args) {
        return Mysql.format(...args)
    }

    escape(...args) {
        return Mysql.escape(...args)
    }

    escapeId(...args) {
        return Mysql.escapeId(...args)
    }
}

Queryable.prototype.CONSTRANTS = CONSTRANTS

class TransactionQueryable extends Queryable {
    commit() {
        return new Promise((resolve, reject) => {
            this.conn.commit(err => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve()
                }
            })
        })
    }

    rollback() {
        return new Promise((resolve, reject) => {
            this.conn.rollback(err => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve()
                }
            })
        })
    }

    async end() {
        this.conn.release()
    }
}

class Pool extends Queryable {
    /**
     * 
     * @param {Mysql.Pool} pool
     */
    constructor(pool) {
        super(pool)
    }

    streamQuery(...args) {
        return new Promise((resolve, reject) => {
            this.conn.getConnection((err, conn) => {
                if (err) {
                    reject(err)
                }
                else {
                    let queryable = new Queryable(conn)
                    let query = queryable.streamQuery(...args)
                    query.on('error', () => {
                        conn.release()
                    })
                    query.on('end', () => {
                        conn.release()
                    })
                    resolve(query)
                }
            })
        })
    }

    streamExecute(...args) {
        return new Promise((resolve, reject) => {
            this.conn.getConnection((err, conn) => {
                if (err) {
                    reject(err)
                }
                else {
                    let queryable = new Queryable(conn)
                    let query = queryable.streamExecute(...args)
                    query.on('error', () => {
                        conn.release()
                    })
                    query.on('end', () => {
                        conn.release()
                    })
                    resolve(query)
                }
            })
        })
    }

    /**
     * 关闭连接池
     */
    end() {
        return new Promise((resolve, reject) => {
            this.conn.end((err) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve()
                }
            })
        })
    }

    beginTransaction(isoLevel, scope) {
        if (typeof isoLevel === 'function') {
            scope = isoLevel
            isoLevel = ''
        }

        return new Promise((resolve, reject) => {
            this.conn.getConnection(async (err, conn) => {
                if (err) {
                    reject(err)
                }
                else {
                    let baseQuery = new Queryable(conn)

                    try {
                        if (isoLevel) {
                            await baseQuery.query(`SET TRANSACTION ISOLATION LEVEL ${isoLevel};`)
                        }
                        await baseQuery.query('start transaction;')
                    }
                    catch (errStartTrans) {
                        reject(err)
                        return
                    }

                    if (typeof scope !== 'function') {
                        resolve(new TransactionQueryable(conn))
                        return
                    }

                    let retQuery, errQuery
                    try {
                        retQuery = await scope(baseQuery)
                        await baseQuery.query('COMMIT;')
                    }
                    catch (err) {
                        errQuery = err
                        await baseQuery.query('ROLLBACK;')
                    }

                    conn.release()

                    if (errQuery) {
                        reject(errQuery)
                    }
                    else {
                        resolve(retQuery)
                    }
                }
            })
        })
    }
}

function createPool(options) {
    return new Pool(Mysql.createPool(options))
}

module.exports = createPool
module.exports.format = Mysql.format
module.exports.escape = Mysql.escape
module.exports.escapeId = Mysql.escapeId
module.exports.raw = Mysql.raw

module.exports.CONSTRANTS = CONSTRANTS