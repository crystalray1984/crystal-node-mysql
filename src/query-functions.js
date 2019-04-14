'use strict'

const isArray = require('is-array')
const Constrants = require('./constrants')

class QueryFunctions {
    async queryOne(...args) {
        let results = await this.query(...args)
        if (isArray(results)) {
            if (results.length > 0) {
                return results[0]
            }
            else {
                return null
            }
        }
        else {
            return results
        }
    }

    async queryField(...args) {
        let result = await this.queryOne(...args)
        if (!result) {
            return null
        }
        for (let n in result) {
            return result[n]
        }
        return null
    }
}

QueryFunctions.prototype.constrants = Constrants

module.exports = QueryFunctions