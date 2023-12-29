const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class PlaylistService {
    constructor() {
        this._pool = new Pool()
    }

    async addPlaylist(name, owner) {
        const id = `playlist-${nanoid(16)}`
        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner]
        }

        const result = await this._pool.query(query)
        if (!result.rows[0].id) {
            throw new InvariantError('Playlist gagal ditambahkan')
        }

        return result.rows[0].id
    }

    async getPlaylistsByOwner(owner) {
        const query = {
            text: 'SELECT playlists.* FROM playlists WHERE owner = $1',
            values: [owner]
        }

        const result = await this._pool.query(query)
        if (!result.rows.length) {
            throw new InvariantError('Playlist tidak ditemukan')
        }

        return result.rows
    }

    async deletePlaylistById(id) {
        const result = await this._pool.query('DELETE FROM playlists WHERE id = $1 RETURNING id', [id])
        if (!result.rows.length) {
            throw new InvariantError('Gagal menghapus playlist. Id tidak ditemukan')
        }
    }

    async verifyPlaylistOwner(id, owner) {
        const result = await this._pool.query('SELECT * FROM playlists WHERE id = $1', [id])
        if (!result.rows.length) {
            throw new InvariantError('Playlist tidak ditemukan')
        }

        const playlist = result.rows[0]
        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
        }
    }
}

module.exports = PlaylistService