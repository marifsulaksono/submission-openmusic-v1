const InvariantError = require('../../exceptions/InvariantError')
const { PostAuthenticationSchema, PutOrDeleteAuthenticationSchema } = require('./schema')

const AuthenticationValidator = {
    validatePostAuthenticationSchema: (payload) => {
        const validationResult = PostAuthenticationSchema.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },
    validatePutOrDeleteAuthenticationSchema: (payload) => {
        const validationResult = PutOrDeleteAuthenticationSchema.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    },
}

module.exports = AuthenticationValidator