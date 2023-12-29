const autoBind = require("auto-bind")

class AuthenticationHandler {
    constructor(authenticationService, userService, tokenManager, validator) {
        this._authenticationService = authenticationService
        this._userService = userService
        this._tokenManager = tokenManager
        this._validator = validator

        autoBind(this)
    }

    async postAuthHandler(request, h) {
        this._validator.validatePostAuthenticationSchema(request.payload)
        const { username, password } = request.payload
        const id = await this._userService.verifyUserCredential(username, password)
        const accessToken = await this._tokenManager.generateAccessToken({ id })
        const refreshToken = await this._tokenManager.generateRefreshToken({ id })
        await this._authenticationService.addRefreshToken(refreshToken)

        const response = h.response({
            status: 'success',
            message: 'Authentication berhasil ditambahkan',
            data: {
                accessToken,
                refreshToken
            }
        })

        response.code(201)
        return response
    }

    async putAuthHandler(request, h) {
        this._validator.validatePutOrDeleteAuthenticationSchema(request.payload)
        const { refreshToken } = request.payload
        await this._authenticationService.verifyRefreshToken(refreshToken)
        const { id } = await this._tokenManager.verifyRefreshToken(refreshToken)
        const accessToken = await this._tokenManager.generateAccessToken({ id })

        return {
            status: 'success',
            data: {
                accessToken
            }
        }
    }

    async deleteAuthHandler(request, h) {
        this._validator.validatePutOrDeleteAuthenticationSchema(request.payload)
        const { refreshToken } = request.payload
        await this._authenticationService.verifyRefreshToken(refreshToken)
        await this._authenticationService.deleteRefreshToken(refreshToken)

        return {
            status: 'success',
            message: 'Refresh token berhasil dihapus'
        }
    }
}

module.exports = AuthenticationHandler