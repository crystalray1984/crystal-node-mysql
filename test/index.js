'use strict'

const Mysql = require('mysql2')

const conn = Mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'staticx',
    database: 'carclub'
})

let query = conn.execute('SELECT * FROM car_series')
query.on('error', function (err) {
    // Handle error, an 'end' event will be emitted after this as well
})
query.on('fields', function (fields) {
    //console.log('fields', fields)
    // the field packets for the rows to follow
})
query.on('result', function (row) {
    //console.log('result', arguments)
})
query.on('end', function () {
    console.log('end', arguments)
    //this._connection.release()
})