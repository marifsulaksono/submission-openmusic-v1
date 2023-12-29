require('dotenv').config()

const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')
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

const TokenManager = require('./tokenize/tokenManager')
const ClientError = require('./exceptions/ClientError')

const init = async () => {
    const albumService = new AlbumService()
    const songService = new SongService()
    const userService = new UserService()
    const authenticationService = new AuthenticationService()
    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register([
        {
            plugin: Jwt
        }
    ])

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
