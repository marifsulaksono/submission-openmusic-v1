const autoBind = require("auto-bind")
const AuthorizationError = require("../../exceptions/AuthorizationError")

class ExportsHandler {
    constructor(producerService, playlistService, validator) {
        this._producerService = producerService
        this._playlistService = playlistService
        this._validator = validator

        autoBind(this)
    }

    async postExportsPlaylistHandler(request, h) {
        this._validator.validateExportsPayload(request.payload)
        const { id } = request.auth.credentials
        const { playlistId } = request.params

        await this._playlistService.verifyPlaylistOwner(playlistId, id)

        const message = {
            userId: id,
            targetEmail: request.payload.targetEmail
        }

        await this._producerService.sendMessage('export:playlists', JSON.stringify(message))
        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda sedang kami proses'
        })

        response.code(201)
        return response
    }
}

module.exports = ExportsHandler