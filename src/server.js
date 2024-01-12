require('dotenv').config()

const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')
const Inert = require('@hapi/inert')
const path = require('path')

const albums = require('./api/albums')
const AlbumService = require('./service/postgres/albumService')
const AlbumValidator = require('./validator/albums')

const songs = require('./api/songs')
const SongService = require('./service/postgres/songService')
const SongValidator = require('./validator/songs')

const users = require('./api/users')
const UserService = require('./service/postgres/userService')
const UserValidator = require('./validator/users')

const authentications = require('./api/authentications')
const AuthenticationService = require('./service/postgres/authenticationService')
const AuthenticationValidator = require('./validator/authentications')

const playlists = require('./api/playlists')
const PlaylistService = require('./service/postgres/playlistService')
const PlaylistValidator = require('./validator/playlists')

const collaborations = require('./api/collaborations')
const CollaborationService = require('./service/postgres/collaborationService')
const CollaborationValidator = require('./validator/collaborations')

const _exports = require('./api/exports')
const ProducerService = require('./service/rabbitmq/producerService')
const ExportsValidator = require('./validator/exports')

const StorageService = require('./service/storage/storageService')
const CacheService = require('./service/redis/cacheService')

const TokenManager = require('./tokenize/tokenManager')
const ClientError = require('./exceptions/ClientError')
const config = require('./utils/config')

const init = async () => {
    const cacheService = new CacheService()
    const albumService = new AlbumService(cacheService)
    const songService = new SongService()
    const userService = new UserService()
    const authenticationService = new AuthenticationService()
    const collaborationService = new CollaborationService()
    const playlistService = new PlaylistService(collaborationService)
    const storageService = new StorageService(path.resolve(__dirname, 'uploads/file/images'))
    const server = Hapi.server({
        port: config.app.port,
        host: config.app.host,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register([
        {
            plugin: Jwt
        },
        {
            plugin: Inert
        }
    ])

    server.route({
        method: 'GET',
        path: '/upload/{param*}',
        handler: {
            directory: {
                path: path.resolve(__dirname, 'uploads/file')
            }
        }
    })

    server.auth.strategy('playlist_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE
        },
        validate: (artifacts) => ({
            isValid: true,
            credential: {
                id: artifacts.decoded.payload.id
            }
        })
    })

    await server.register(
        [
            {
                plugin: albums,
                options: {
                    albumService,
                    storageService,
                    validator: AlbumValidator
                },
            },
            {
                plugin: songs,
                options: {
                    service: songService,
                    validator: SongValidator
                },
            },
            {
                plugin: users,
                options: {
                    service: userService,
                    validator: UserValidator
                },
            },
            {
                plugin: authentications,
                options: {
                    authenticationService,
                    userService,
                    tokenManager: TokenManager,
                    validator: AuthenticationValidator
                }
            },
            {
                plugin: playlists,
                options: {
                    playlistService,
                    songService,
                    validator: PlaylistValidator
                }
            },
            {
                plugin: collaborations,
                options: {
                    collaborationService,
                    playlistService,
                    userService,
                    validator: CollaborationValidator
                }
            },
            {
                plugin: _exports,
                options: {
                    producerService: ProducerService,
                    playlistService,
                    validator: ExportsValidator
                }
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
            console.log(response.message)
            return newResponse;
        }

        return h.continue;
    })

    await server.start()
    console.log(`server running at ${server.info.uri}`)
}

init()
