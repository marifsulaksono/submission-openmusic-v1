const autoBind = require("auto-bind")

class PlaylistHandler {
    constructor(service, validator) {
        this._service = service
        this._validator = validator

        autoBind(this)
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistPayload(request.payload)
        const { name = 'unnamed' } = request.payload
        const { id: credentialId } = request.auth.credentials

        const playlistId = await this._service.addPlaylist(name, credentialId)

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

        const playlists = await this._service.getPlaylistsByOwner(credentialId)

        return {
            status: 'success',
            data: playlists
        }
    }

    async deletePlaylistByIdHandler(request, h) {
        const { id } = request.params
        await this._service.deletePlaylistById(id)

        return {
            status: 'success',
            message: 'Playlist berhasil dihapus'
        }
    }
}

module.exports = PlaylistHandler