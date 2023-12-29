const InvariantError = require('../../exceptions/InvariantError')
const { PlaylistSchema, PlaylistSongSchema } = require('./schema')

const PlaylistValidator = {
    validatePlaylistPayload: (payload) => {
        const validationResult = PlaylistSchema.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },
    validatePlaylistUserPayload: (payload) => {
        const validationResult = PlaylistSongSchema.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    }
}

module.exports = PlaylistValidator