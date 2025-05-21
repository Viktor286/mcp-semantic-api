import { Pool, QueryResult } from 'pg';
import pool from '../config/db.config';
import logger from '../utils/logger';

class DatabaseService {
    private pool: Pool;

    constructor() {
        this.pool = pool;
    }

    /**
     * Execute a SQL query with parameters
     */
    async query(text: string, params?: any[]): Promise<QueryResult> {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            logger.debug(`Executed query: ${text} with params: ${params} (${duration}ms)`);
            return result;
        } catch (error) {
            logger.error(`Error executing query: ${text}`, error);
            throw error;
        }
    }

    /**
     * Execute a transaction with multiple queries
     */
    async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Transaction failed', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Check if the pgvector extension is installed
     */
    async checkPgVectorExtension(): Promise<boolean> {
        try {
            const { rows } = await this.query(
                "SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector')"
            );
            return rows[0].exists;
        } catch (error) {
            logger.error('Error checking pgvector extension', error);
            return false;
        }
    }

    /**
     * Get PostgreSQL version information
     */
    async getVersionInfo(): Promise<{ version: string; pgvector: boolean }> {
        try {
            const { rows: versionRows } = await this.query('SELECT version()');
            const pgvectorInstalled = await this.checkPgVectorExtension();

            return {
                version: versionRows[0].version,
                pgvector: pgvectorInstalled
            };
        } catch (error) {
            logger.error('Error fetching PostgreSQL version info', error);
            throw error;
        }
    }
}

export default new DatabaseService();