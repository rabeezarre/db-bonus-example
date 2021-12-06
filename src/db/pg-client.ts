const { Client } = require('pg');

const DATABASE_URL="URL"

const pgClient = new Client({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export default pgClient;