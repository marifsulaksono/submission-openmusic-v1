const { AlbumSchema, AlbumCoverHeaders } = require('./schema')
const InvariantError = require('../../exceptions/InvariantError')

const AlbumValidator = {
    validateAlbumPayload: (payload) => {
        const validationResult = AlbumSchema.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },
    validateAlbumCoverHeaders: (headers) => {
        const validationResult = AlbumCoverHeaders.validate(headers)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    }
}

module.exports = AlbumValidator