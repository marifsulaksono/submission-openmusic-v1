const { SongSchema } = require('./schema')
const InvariantError = require('../../exceptions/InvariantError')

const SongValidator = {
    validateSongPayload: (payload) => {
        const validationResult = SongSchema.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    }
}

module.exports = SongValidator