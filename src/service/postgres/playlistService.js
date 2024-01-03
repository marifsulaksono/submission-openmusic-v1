const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const AuthorizationError = require('../../exceptions/AuthorizationError')
const NotFoundError = require('../../exceptions/NotFoundError')

class PlaylistService {
    constructor(collaborationService) {
        this._pool = new Pool()
        this._collaborationService = collaborationService
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
            text: 'SELECT p.id, p.name, u.username FROM playlists p JOIN users u ON p.owner = u.id LEFT JOIN collaborations c ON p.id = c.playlist_id WHERE p.owner = $1 OR c.user_id = $1',
            values: [owner]
        }

        const result = await this._pool.query(query)
        if (!result.rows.length < 0) {
            throw new NotFoundError('Playlist tidak ditemukan')
        }

        return result.rows
    }

    async deletePlaylistById(id) {
        const result = await this._pool.query('DELETE FROM playlists WHERE id = $1 RETURNING id', [id])
        if (!result.rows.length) {
            throw new NotFoundError('Gagal menghapus playlist. Id tidak ditemukan')
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

    async addPlaylistActivites(playlistId, songId, userId, action) {
        const id = `playsongaction-${nanoid(16)}`
        const time = new Date().toISOString()

        const query = {
            text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            values: [id, playlistId, songId, userId, action, time]
        }

        const result = await this._pool.query(query)
        if (!result.rows.length) {
            throw new Error('Gagal menambahkan aktivitas playlist song')
        }
    }

    async getPlaylistActivitiesById(id) {
        const query = {
            text: 'SELECT u.username, s.title, psa.action, psa.time FROM playlist_song_activities psa JOIN users u ON psa.user_id = u.id JOIN songs s ON psa.song_id = s.id WHERE psa.playlist_id = $1',
            values: [id]
        }

        const result = await this._pool.query(query)
        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan')
        }

        return result.rows
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

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId)
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error
            }

            try {
                await this._collaborationService.verifyCollaborator(playlistId, userId)
            } catch (error) {
                throw error
            }
        }
    }
}

module.exports = PlaylistService