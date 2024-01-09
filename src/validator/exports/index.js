const InvariantError = require('../../exceptions/InvariantError')
const ExportsSchema = require('./schema')

const ExportsValidator = {
    validateExportsPayload: (payload) => {
        const validationResult = ExportsSchema.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    }
}

module.exports = ExportsValidator