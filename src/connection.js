'use strict'

const Mysql = require('mysql2')
const Constrants = require('./constrants')

/**
 * 对连接的封装
 */
class Connection {
    /**
     * 
     * @param {Mysql.Connection} conn 
     */
    constructor(conn) {
        this._conn = conn
    }

    get threadId() {
        return this._conn.threadId
    }

    changeUser(options) {
        return new Promise((resolve, reject) => {
            this._conn.changeUser(options, err => {
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
            this._conn.query(sql, values, (err, results) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(results)
                }
            })
        })
    }

    execute(sql, values) {
        return new Promise((resolve, reject) => {
            this._conn.execute(sql, values, (err, results) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(results)
                }
            })
        })
    }

    streaming(...args) {
        while (args.length > 0 && (typeof args[args.length - 1] === 'undefined' || typeof args[args.length - 1] === 'function')) {
            args.pop()
        }
        return this._conn.query(...args)
    }

    /**
     * 
     * @param {string} isolationLevel 
     */
    async beginTransaction(isolationLevel) {
        if (!isolationLevel || typeof isolationLevel !== 'string' || ['repeatable read', 'read uncommitted', 'read committed', 'serializable'].includes(isolationLevel.toLowerCase())) {
            isolationLevel = ''
        }
        if (isolationLevel) {
            await this.query(`SET TRANSACTION ISOLATION LEVEL ${isolationLevel};`)
        }
        await this.query('START TRANSACTION;')
    }

    async commit() {
        await this.query('COMMIT;')
    }

    async rollback() {
        await this.query('ROLLBACK;')
    }

    end() {
        return new Promise((resolve, reject) => {
            this._conn.end(err => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve()
                }
            })
        })
    }

    ping() {
        return new Promise((resolve, reject) => {
            this._conn.ping(err => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve()
                }
            })
        })
    }

    format(sql, values) {
        return this._conn.format(sql, values)
    }

    escape(val, stringifyObjects, timeZone) {
        return Mysql.escape(val, stringifyObjects, timeZone)
    }

    escapeId(val, forbidQualified) {
        return Mysql.escapeId(val, forbidQualified)
    }

    raw(sql) {
        return Mysql.raw(sql)
    }

    pause() {
        this._conn.pause()
    }

    resume() {
        this._conn.resume()
    }
}

Connection.prototype.constrants = Constrants

module.exports = Connection