const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')

class AuthenticationService {
    constructor() {
        this._pool = new Pool()
    }

    async addRefreshToken(token) {
        await this._pool.query('INSERT INTO authentications VALUES($1)', [token])
    }

    async verifyRefreshToken(token) {
        const result = await this._pool.query('SELECT token FROM authentications WHERE token = $1', [token])
        if (!result.rowCount) {
            throw new InvariantError('Refresh token tidak valid')
        }
    }

    async deleteRefreshToken(token) {
        await this._pool.query('DELETE FROM authentications WHERE token = $1', [token])
    }
}

module.exports = AuthenticationService