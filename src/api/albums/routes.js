const routes = (handler) => [
    {
        method: 'GET',
        path: '/albums/{id}',
        handler: handler.getAlbumByIdHandler,
    },
    {
        method: 'POST',
        path: '/albums',
        handler: handler.postAlbumHandler,
    },
    {
        method: 'PUT',
        path: '/albums/{id}',
        handler: handler.putAlbumByIdHandler,
    },
    {
        method: 'DELETE',
        path: '/albums/{id}',
        handler: handler.deleteAlbumByIdHandler,
    },
    {
        method: 'POST',
        path: '/albums/{id}/likes',
        handler: handler.postAlbumLikesHandler,
        options: {
            auth: 'playlist_jwt'
        }
    },
    {
        method: 'GET',
        path: '/albums/{id}/likes',
        handler: handler.getAlbumLikesHandler,
    },
    {
        method: 'DELETE',
        path: '/albums/{id}/likes',
        handler: handler.deleteAlbumLikesHandler,
        options: {
            auth: 'playlist_jwt'
        }
    },
    {
        method: 'POST',
        path: '/albums/{id}/covers',
        handler: handler.postCoverAlbumHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream',
                maxBytes: 512000
            }
        }
    }
]

module.exports = routes