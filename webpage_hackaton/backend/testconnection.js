const { Client } = require('pg');

const client = new Client({
    host: 'movilidadunitec.c3sk4oigqx9u.us-east-2.rds.amazonaws.com',
    user: 'postgres',
    password: '12345678',
    database: 'movilidadunitec',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000
});

client.connect(err => {
    if (err) {
        console.error('Connection error', err.stack);
    } else {
        console.log('Connected to the database');
    }
    client.end();
});
