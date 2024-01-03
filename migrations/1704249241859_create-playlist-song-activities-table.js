/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.createTable('playlist_song_activities', {
        id: {
            type: 'VARCHAR(55)',
            primaryKey: true
        },
        playlist_id: {
            type: 'VARCHAR(55)',
            notNull: true
        },
        song_id: {
            type: 'VARCHAR(55)',
            notNull: true,
            references: 'songs(id)'
        },
        user_id: {
            type: 'VARCHAR(55)',
            notNull: true,
            references: 'users(id)'
        },
        action: {
            type: 'TEXT',
            notNull: true
        },
        time: {
            type: 'TEXT',
            notNull: true
        }
    })

    pgm.addConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')
};

exports.down = pgm => {
    pgm.dropTable('playlist_song_activities')
};
