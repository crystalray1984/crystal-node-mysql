'use strict'

const extend2 = require('extend2')

module.exports = opts => {
    if (typeof opts === 'string') {
        return opts
    }

    return extend2(true, {
        typeCast: (field, next) => {
            if (['TIMESTAMP', 'DATE', 'DATETIME'].includes(field.type)) {
                let strval = field.string()
                if (strval === null || strval === undefined || strval === '' || strval.toLowerCase() === 'null') {
                    return null
                }
                return new Date(strval).valueOf()
            }
            else {
                return next()
            }
        }
    }, opts)
}