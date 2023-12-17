const autoBind = require('auto-bind')

class AlbumHandler {
    constructor(service) {
        this._service = service

        // this.postAlbumHandler = this.postAlbumHandler.bind(this)
        // this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this)
        // this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this)
        // this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this)
        autoBind(this)
    }

    async postAlbumHandler(request, h) {
        try {
            const { name, year } = request.payload

            const albumId = await this._service.addAlbum({ name, year })

            const response = h.response({
                status: 'success',
                data: {
                    albumId
                }
            })

            response.code(201)
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

    async getAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params
            const album = await this._service.getAlbumById(id)

            const response = h.response({
                status: 'success',
                data: {
                    album
                }
            })

            return response
        } catch (error) {
            const response = h.response({
                status: 'fail',
                message: error.message
            })

            response.code(404)
            return response
        }
    }

    async putAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params
            await this._service.editAlbumById(id, request.payload)

            return {
                status: 'success',
                message: 'Album berhasil diperbarui'
            }
        } catch (error) {
            const response = h.response({
                status: 'fail',
                message: error.message
            })

            response.code(404)
            return response
        }
    }

    async deleteAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params
            await this._service.deleteAlbumById(id)

            return {
                status: 'success',
                message: 'Album berhasil dihapus'
            }
        } catch (error) {
            const response = h.response({
                status: 'fail',
                message: error.message
            })

            response.code(404)
            return response
        }
    }
}

module.exports = AlbumHandler
