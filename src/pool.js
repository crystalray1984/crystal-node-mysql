'use strict'

const Connection = require('./connection')
const Mysql = require('mysql2')

class Pool extends Mysql.Pool {
    constructor(options) {
        super(options)
        this._promise = super.promise()
    }

    getConnection() {
        return this._promise.getConnection()
    }

    end() {
        return this._promise.end()
    }

    query(sql, values) {
        return this._promise.query(sql, values)
    }

    execute(sql, values) {
        return this._promise.execute(sql, values)
    }

    streaming(sql, values) {
        return super.query(sql, values)
    }

    escape(val, stringifyObjects, timeZone) {
        return Mysql.escape(val
            , typeof stringifyObjects === 'undefined' ? this.config.connectionConfig.stringifyObjects : stringifyObjects
            , typeof timeZone === 'undefined' ? this.config.connectionConfig.timezone : timeZone)
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
        return new Connection(Mysql.createConnection(this.config.connectionConfig))
    }
}

module.exports = Pool