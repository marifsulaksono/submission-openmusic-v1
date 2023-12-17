require('dotenv').config()

const Hapi = require('@hapi/hapi')
const albums = require('./api/albums')
const songs = require('./api/songs')
const AlbumService = require('./service/postgres/albumService')
const AlbumValidator = require('./validator/albums')
const SongService = require('./service/postgres/songService')
const SongValidator = require('./validator/songs')

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

    await server.start()
    console.log(`server running at ${server.info.uri}`)
}

init()
