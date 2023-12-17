const autoBind = require('auto-bind')
const ClientError = require('../../exceptions/ClientError')

class SongHandler {
    constructor(service, validator) {
        this._service = service
        this._validator = validator

        autoBind(this)
    }

    async postSongHandler(request, h) {
        try {
            this._validator.validateSongPayload(request.payload)
            const songId = await this._service.addSong(request.payload)

            const response = h.response({
                status: 'success',
                data: {
                    songId
                }
            })

            response.code(201)
            return response
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message
                })

                response.code(error.statusCode)
                return response
            }

            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.'
            })

            response.code(500)
            console.log(error)
            return response
        }
    }

    async getAllSongsHandler(request, h) {
        try {
            const songs = await this._service.getAllSongs(request.query)

            const response = h.response({
                status: 'success',
                data: {
                    songs
                }
            })

            return response
        } catch (error) {
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.'
            })

            response.code(500)
            console.log(error)
            return response
        }
    }

    async getSongByIdHandler(request, h) {
        try {
            const { id } = request.params
            const song = await this._service.getSongById(id)

            const response = h.response({
                status: 'success',
                data: {
                    song
                }
            })

            return response
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message
                })

                response.code(error.statusCode)
                return response
            }

            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.'
            })

            response.code(500)
            console.log(error)
            return response
        }
    }

    async putSongByIdHandler(request, h) {
        try {
            this._validator.validateSongPayload(request.payload)
            const { id } = request.params

            await this._service.editSongById(id, request.payload)

            return {
                status: 'success',
                message: 'Lagu berhasil diperbarui'
            }
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message
                })

                response.code(error.statusCode)
                return response
            }

            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.'
            })

            response.code(500)
            console.log(error)
            return response
        }
    }

    async deleteSongByIdHandler(request, h) {
        try {
            const { id } = request.params
            await this._service.deleteSongById(id)

            return {
                status: 'success',
                message: 'Lagu berhasil dihapus'
            }
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message
                })

                response.code(error.statusCode)
                return response
            }

            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.'
            })

            response.code(500)
            console.log(error)
            return response
        }
    }
}

module.exports = SongHandler