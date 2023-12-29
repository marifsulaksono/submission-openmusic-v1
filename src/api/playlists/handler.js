const autoBind = require("auto-bind")

class PlaylistHandler {
    constructor(playlistService, songService, validator) {
        this._playlistService = playlistService
        this._songService = songService
        this._validator = validator

        autoBind(this)
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistPayload(request.payload)
        const { name = 'unnamed' } = request.payload
        const { id: credentialId } = request.auth.credentials

        const playlistId = await this._playlistService.addPlaylist(name, credentialId)

        const response = h.response({
            status: 'success',
            data: {
                playlistId
            }
        })

        response.code(201)
        return response
    }

    async getPlaylistsHandler(request, h) {
        const { id: credentialId } = request.auth.credentials
        const playlists = await this._playlistService.getPlaylistsByOwner(credentialId)

        return {
            status: 'success',
            data: {
                playlists
            }
        }
    }

    async deletePlaylistByIdHandler(request, h) {
        const { id } = request.params
        const { id: credentialId } = request.auth.credentials
        await this._playlistService.verifyPlaylistOwner(id, credentialId)
        await this._playlistService.deletePlaylistById(id)

        return {
            status: 'success',
            message: 'Playlist berhasil dihapus'
        }
    }

    async postPlaylistSongsHandler(request, h) {
        this._validator.validatePlaylistSongPayload(request.payload)
        const { id: playlistId } = request.params
        const { id: credentialId } = request.auth.credentials
        const { songId } = request.payload

        const result = await this._songService.getSongById(songId)
        await this._playlistService.verifyPlaylistOwner(playlistId, credentialId)
        await this._playlistService.addSongToPlaylistSongs(playlistId, songId)

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditambahkan ke playlist'
        })

        response.code(201)
        return response
    }

    async getPlaylistSongsHandler(request, h) {
        const { id: playlistId } = request.params
        const { id: credentialId } = request.auth.credentials

        await this._playlistService.verifyPlaylistOwner(playlistId, credentialId)
        const playlist = await this._playlistService.getPlaylistSongs(playlistId)

        return {
            status: 'success',
            data: {
                playlist
            }
        }
    }

    async deletePlaylistSongsHandler(request, h) {
        this._validator.validatePlaylistSongPayload(request.payload)
        const { id: playlistId } = request.params
        const { id: credentialId } = request.auth.credentials
        const { songId } = request.payload

        await this._playlistService.verifyPlaylistOwner(playlistId, credentialId)
        await this._playlistService.deleteSongFromPlaylist(songId)

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus dari playlist'
        }
    }
}

module.exports = PlaylistHandler