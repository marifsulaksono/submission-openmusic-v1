/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.createTable('playlists', {
        id: {
            type: 'VARCHAR(55)',
            primaryKey: true
        },
        name: {
            type: 'TEXT',
            notNull: true
        },
        owner: {
            type: 'VARCHAR(55)',
            notNull: true
        }
    })

    pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE')
};

exports.down = pgm => {
    pgm.dropConstraint('fk_playlists.owner_users.id')
    pgm.dropTable('playlists')
};
