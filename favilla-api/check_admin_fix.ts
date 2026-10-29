
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Point to the .env file in the current directory (favilla-api)
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function main() {
    try {
        console.log('Connecting to DB...');
        const result = await pool.query('SELECT id, email, role FROM users');

        if (result.rows.length === 0) {
            console.log('No users found.');
            return;
        }

        console.log('Found users:');
        let hasAdmin = false;
        for (const user of result.rows) {
            console.log(`- ${user.email} (${user.role})`);
            if (user.role === 'admin') hasAdmin = true;
        }

        if (!hasAdmin) {
            console.log('No admin found. Promoting the first user to admin...');
            const firstUser = result.rows[0];
            await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [firstUser.id]);
            console.log(`User ${firstUser.email} is now ADMIN.`);
        } else {
            console.log('Admin user exists.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

main();
