import mysql from "mysql2/promise";
import {config} from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), '.env.local') });

export const pool = mysql.createPool({
    host: process.env.DB_MYSQL_HOST,
    port: Number(process.env.DB_MYSQL_PORT || 3306),
    user: process.env.DB_MYSQL_USER,
    password: process.env.DB_MYSQL_PASSWORD,
    database: 'db_az_with_jesus',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});