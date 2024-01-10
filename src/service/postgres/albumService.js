const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class AlbumService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService
    }

    async addAlbum({ name, year }) {
        const id = `album-${nanoid(16)}`

        const query = {
            text: 'INSERT INTO albums VALUES ($1, $2, $3) RETURNING id',
            values: [id, name, year],
        };

        const result = await this._pool.query(query)
        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan')
        }

        return result.rows[0].id
    }

    async getAlbumById(id) {
        const query = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id],
        }

        const result = await this._pool.query(query)
        if (!result.rowCount) {
            throw new NotFoundError('Album tidak ditemukan')
        }

        const album = {
            id: result.rows[0].id,
            name: result.rows[0].name,
            year: result.rows[0].year,
            coverUrl: result.rows[0].cover
        }

        return album
    }

    async getSongsByAlbumId(albumId) {
        const query = {
            text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
            values: [albumId],
        }

        const result = await this._pool.query(query)
        return result.rows
    }

    async editAlbumById(id, { name, year }) {
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id],
        }

        const result = await this._pool.query(query)
        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan')
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        }

        const result = await this._pool.query(query)
        if (!result.rows.length) {
            throw new NotFoundError('Gagal menghapus album. Id tidak ditemukan')
        }
    }

    async postAlbumLikes(albumId, userId) {
        const existUserLikeQuery = {
            text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
            values: [albumId, userId]
        }

        const existUserLikeOnAlbum = await this._pool.query(existUserLikeQuery)
        if (existUserLikeOnAlbum.rows.length > 0) {
            throw new InvariantError('Anda hanya dapat memberikan 1 like untuk 1 album')
        }
        const id = `albumlike-${nanoid(16)}`

        const query = {
            text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
            values: [id, userId, albumId]
        }

        const result = await this._pool.query(query)
        if (!result.rows.length) {
            throw new InvariantError('Gagal menambahkan like pada album')
        }

        await this._cacheService.delete(`likes:${albumId}`)
    }

    async getAlbumLikes(id) {
        try {
            const result = await this._cacheService.get(`likes:${id}`)
            return [JSON.parse(result), true]
        } catch (error) {
            const query = {
                text: 'SELECT COUNT(album_id) AS likes FROM user_album_likes WHERE album_id = $1',
                values: [id]
            }

            const resultDB = await this._pool.query(query)
            await this._cacheService.set(`likes:${id}`, JSON.stringify(resultDB.rows[0]))
            return [resultDB.rows[0], false]
        }
    }

    async deleteAlbumLikes(albumId, userId) {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
            values: [albumId, userId]
        }

        const result = await this._pool.query(query)
        if (!result.rows.length) {
            throw new InvariantError('Gagal mengahpus like')
        }

        await this._cacheService.delete(`likes:${albumId}`)
    }

    async saveCoverAlbum(coverUrl, id) {
        const query = {
            text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
            values: [coverUrl, id]
        }

        const result = await this._pool.query(query)
    }
}

module.exports = AlbumService