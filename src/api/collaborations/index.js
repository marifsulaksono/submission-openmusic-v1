const routes = require('./routes')
const CollaborationHandler = require('./handler')

module.exports = {
    name: 'collaborations',
    version: '1.0.0',
    register: async (server, { collaborationService, playlistService, userService, validator }) => {
        const collaborationHandler = new CollaborationHandler(collaborationService, playlistService, userService, validator)
        server.route(routes(collaborationHandler))
    }
}