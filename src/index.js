'use strict'

const Mysql = require('mysql2')
const Constrants = require('./constrants')
const Connection = require('./connection')
const Pool = require('./pool')
const SqlString = require('sqlstring')
const merge = require('./merge-config')

function createPool(config) {
    return new Pool(merge(config))
}

function createClient(opts) {
    return new Connection(Mysql.createConnection(merge(opts)))
}

module.exports = createPool
module.exports.createPool = createPool
module.exports.createClient = createClient
module.exports.escape = SqlString.escape
module.exports.escapeId = SqlString.escapeId
module.exports.format = SqlString.format
module.exports.raw = SqlString.raw
module.exports.constrants = Constrants