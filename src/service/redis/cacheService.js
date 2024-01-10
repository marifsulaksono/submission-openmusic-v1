const redis = require('redis')
const config = require('../../utils/config')

class CacheService {
    constructor() {
        this._client = redis.createClient({
            socket: {
                host: config.redis.server
            }
        })

        this._client.on('error', error => {
            console.log(error)
        })

        this._client.connect()
    }

    async set(key, value, expInSec = 1800) {
        await this._client.set(key, value, {
            EX: expInSec
        })
    }

    async get(key) {
        const result = await this._client.get(key)
        if (result === null) throw new Error('Cache tidak ditemukan')
        return result
    }

    async delete(key) {
        return await this._client.del(key)
    }
}

module.exports = CacheService