const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const AuthorizationError = require('../../exceptions/AuthorizationError')
const NotFoundError = require('../../exceptions/NotFoundError')

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
            text: 'SELECT id, name, owner AS username FROM playlists WHERE owner = $1',
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

    async addSongToPlaylistSongs(playlistId, songId) {
        const id = `playsongs-${nanoid(16)}`
        const query = {
            text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId]
        }

        const result = await this._pool.query(query)
        if (!result.rows.length) {
            throw new InvariantError('Lagu gagal ditambahkan ke playlist')
        }
    }

    async getPlaylistSongs(playlistId) {
        const query = {
            text: 'SELECT p.id AS playlist_id, p.name AS playlist_name, p.owner, s.id AS song_id, s.title, s.performer FROM playlist_songs ps JOIN playlists p ON ps.playlist_id = p.id JOIN songs s ON ps.song_id = s.id WHERE p.id = $1',
            values: [playlistId]
        }

        const result = await this._pool.query(query)
        const playlistData = result.rows[0]
        if (!playlistData) {
            throw new NotFoundError('Playlist tidak ditemukan')
        }

        const username = await this._pool.query('SELECT username FROM users WHERE id = $1', [playlistData.owner])

        const songs = result.rows.map((row) => ({
            id: row.song_id,
            title: row.title,
            performer: row.performer
        }))

        const playlist = {
            id: playlistData.playlist_id,
            name: playlistData.playlist_name,
            username: username.rows[0].username,
            songs
        }

        return playlist
    }

    async deleteSongFromPlaylist(id) {
        const query = {
            text: 'DELETE FROM playlist_songs WHERE song_id = $1 RETURNING id',
            values: [id]
        }

        const result = await this._pool.query(query)
        if (!result.rows.length) {
            throw new NotFoundError('Gagal menghapus lagu, Id tidak ditemukan')
        }
    }

    async verifyPlaylistOwner(id, owner) {
        const result = await this._pool.query('SELECT * FROM playlists WHERE id = $1', [id])
        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan')
        }

        const playlist = result.rows[0]
        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
        }
    }
}

module.exports = PlaylistService