const autoBind = require('auto-bind')

class AlbumHandler {
    constructor(albumService, storageService, validator) {
        this._albumService = albumService
        this._storageService = storageService
        this._validator = validator

        autoBind(this)
    }

    async postAlbumHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload)
        const { name, year } = request.payload

        const albumId = await this._albumService.addAlbum({ name, year })

        const response = h.response({
            status: 'success',
            data: {
                albumId
            }
        })

        response.code(201)
        return response
    }

    async getAlbumByIdHandler(request, h) {
        const { id } = request.params
        const album = await this._albumService.getAlbumById(id)
        const songs = await this._albumService.getSongsByAlbumId(id)
        album.songs = songs

        return {
            status: 'success',
            data: {
                album
            }
        }
    }

    async putAlbumByIdHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload)
        const { id } = request.params
        await this._albumService.editAlbumById(id, request.payload)

        return {
            status: 'success',
            message: 'Album berhasil diperbarui'
        }
    }

    async deleteAlbumByIdHandler(request, h) {
        const { id } = request.params
        await this._albumService.deleteAlbumById(id)

        return {
            status: 'success',
            message: 'Album berhasil dihapus'
        }
    }

    async postAlbumLikesHandler(request, h) {
        const { id } = request.params
        const { id: userId } = request.auth.credentials

        await this._albumService.getAlbumById(id)
        await this._albumService.postAlbumLikes(id, userId)

        const response = h.response({
            status: 'success',
            message: 'Berhasil menambahkan likes ke album'
        })

        response.code(201)
        return response
    }

    async getAlbumLikesHandler(request, h) {
        const { id } = request.params

        const [result, isCache] = await this._albumService.getAlbumLikes(id)
        const likes = parseInt(result.likes)
        const response = h.response({
            status: 'success',
            data: { likes: likes }
        })

        if (isCache) {
            response.header('X-Data-Source', 'cache')
        }

        return response
    }

    async deleteAlbumLikesHandler(request, h) {
        const { id } = request.params
        const { id: userId } = request.auth.credentials

        await this._albumService.deleteAlbumLikes(id, userId)

        return {
            status: 'success',
            message: 'Berhasil like likes pada album'
        }
    }

    async postCoverAlbumHandler(request, h) {
        const { cover } = request.payload
        this._validator.validateAlbumCoverHeaders(cover.hapi.headers)
        const { id } = request.params

        await this._albumService.getAlbumById(id)

        const filename = await this._storageService.writeFile(cover, cover.hapi)
        const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`
        await this._albumService.saveCoverAlbum(coverUrl, id)

        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah'
        })

        response.code(201)
        return response
    }
}

module.exports = AlbumHandler
