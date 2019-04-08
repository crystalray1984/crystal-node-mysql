'use strict'

const Mysql = require('mysql2')

const consts = {}
Object.defineProperty(consts, 'NOW', {
    get() {
        return Mysql.raw('NOW()')
    }
})
Object.defineProperty(consts, 'CURRENT_TIMESTAMP', {
    get() {
        return Mysql.raw('CURRENT_TIMESTAMP')
    }
})
Object.defineProperty(consts, 'NULL', {
    get() {
        return Mysql.raw('NULL')
    }
})

module.exports = consts