import {Pool} from "pg";
import {config} from "../socktrader.config"

const pool = new Pool({
    user: config.database.username,
    password: config.database.password,
    database: config.database.database,
    host: config.database.host,
    port: config.database.port,
});

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, _) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

export default pool;
