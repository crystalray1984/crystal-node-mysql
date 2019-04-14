'use strict'

const Connection = require('./connection')
const Mysql = require('mysql2')
const QueryFunctions = require('./query-functions')

class Pool extends QueryFunctions {
    constructor(options) {
        super()
        this.pool = Mysql.createPool(options)
    }

    getConnection() {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, conn) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(conn)
                }
            })
        })
    }

    end() {
        return new Promise((resolve, reject) => {
            this.pool.end((err) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve()
                }
            })
        })
    }

    query(sql, values) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, values, (err, result) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(result)
                }
            })
        })
    }

    execute(sql, values) {
        return new Promise((resolve, reject) => {
            this.pool.execute(sql, values, (err, result) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(result)
                }
            })
        })
    }

    streaming(sql, values) {
        return this.pool.query(sql, values)
    }

    escape(val, stringifyObjects, timeZone) {
        return Mysql.escape(val
            , typeof stringifyObjects === 'undefined' ? this.pool.config.connectionConfig.stringifyObjects : stringifyObjects
            , typeof timeZone === 'undefined' ? this.pool.config.connectionConfig.timezone : timeZone)
    }

    escapeId(val, forbidQualified) {
        return Mysql.escapeId(val, forbidQualified)
    }

    raw(sql) {
        return Mysql.raw(sql)
    }

    async beginTransaction(isolationLevel, scope) {
        if (typeof isolationLevel === 'function') {
            scope = isolationLevel
            isolationLevel = ''
        }

        const conn = this.createClient()
        await conn.beginTransaction(isolationLevel)
        if (typeof scope !== 'function') {
            return conn
        }

        let ret, error
        try {
            ret = await scope(conn)
            await conn.commit()
        }
        catch (e) {
            error = e
            await conn.rollback()
        }
        finally {
            await conn.end()
        }

        if (error) {
            throw error
        }
        else {
            return ret
        }
    }

    createClient() {
        return new Connection(Mysql.createConnection(this.pool.config.connectionConfig))
    }
}

module.exports = Pool