import { Pool } from 'pg';

let pool: Pool | undefined;

export function getDb() {
    if (!pool) {
        if (!process.env.DB_HOST) {
            console.error("Faltan variables de entorno para DB!");
        }
        pool = new Pool({
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'Holamundo0%',
            host: process.env.DB_HOST || '35.188.41.3',
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
            database: process.env.DB_NAME || 'postgres',
            max: 10,
        });
    }
    return pool;
}
