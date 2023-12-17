require('dotenv').config()

const Hapi = require('@hapi/hapi')
const albums = require('./api/albums')
const songs = require('./api/songs')
const AlbumService = require('./service/postgres/albumService')
const AlbumValidator = require('./validator/albums')
const SongService = require('./service/postgres/songService')
const SongValidator = require('./validator/songs')
const ClientError = require('./exceptions/ClientError')

const init = async () => {
    const albumService = new AlbumService()
    const songService = new SongService()
    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register(
        [
            {
                plugin: albums,
                options: {
                    service: albumService,
                    validator: AlbumValidator
                },
            },
            {
                plugin: songs,
                options: {
                    service: songService,
                    validator: SongValidator
                },
            }
        ]
    );

    server.ext('onPreResponse', (request, h) => {
        const { response } = request
        if (response instanceof Error) {

            if (response instanceof ClientError) {
                const newResponse = h.response({
                    status: 'fail',
                    message: response.message,
                });
                newResponse.code(response.statusCode);
                return newResponse;
            }

            if (!response.isServer) {
                return h.continue;
            }

            const newResponse = h.response({
                status: 'error',
                message: 'terjadi kegagalan pada server kami',
            });
            newResponse.code(500);
            return newResponse;
        }

        return h.continue;
    })

    await server.start()
    console.log(`server running at ${server.info.uri}`)
}

init()
