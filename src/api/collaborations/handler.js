const autoBind = require("auto-bind")

class CollaborationHandler {
    constructor(collaborationService, playlistService, userService, validator) {
        this._collaborationService = collaborationService
        this._playlistService = playlistService
        this._userService = userService
        this._validator = validator

        autoBind(this)
    }

    async postCollaborationHandler(request, h) {
        this._validator.validateCollaborationPayload(request.payload)
        const { id: credentialId } = request.auth.credentials
        const { playlistId, userId } = request.payload

        await this._playlistService.verifyPlaylistOwner(playlistId, credentialId)
        await this._userService.getUserById(userId)
        const collaborationId = await this._collaborationService.addCollaboration(playlistId, userId)

        const response = h.response({
            status: 'success',
            data: {
                collaborationId
            }
        })

        response.code(201)
        return response
    }

    async deleteCollaborationHandler(request, h) {
        this._validator.validateCollaborationPayload(request.payload)
        const { id: credentialId } = request.auth.credentials
        const { playlistId, userId } = request.payload

        await this._playlistService.verifyPlaylistOwner(playlistId, credentialId)
        const collaborationId = await this._collaborationService.deleteCollaboration(playlistId, userId)

        return {
            status: 'success',
            message: 'Collaboration berhasil dihapus'
        }
    }
}

module.exports = CollaborationHandler