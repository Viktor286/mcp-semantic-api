import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import documentsRoute from './api/routes/documents.route';
import searchRoute from './api/routes/search.route';
import { errorHandler, notFoundHandler } from './api/middleware/error.middleware';
import logger from './utils/logger';
import dbService from './services/db.service';
import startMcpServer from './mcp/server';

dotenv.config();

// Create Express server
const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body

// Log all requests
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/documents', documentsRoute);
app.use('/api/search', searchRoute);

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Check database connection
        await dbService.query('SELECT 1');

        // Check if pgvector extension is installed
        const pgvectorInstalled = await dbService.checkPgVectorExtension();

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: {
                connected: true,
                pgvector: pgvectorInstalled
            }
        });
    } catch (error) {
        logger.error('Health check failed', error);
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed'
        });
    }
});

// API information endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Semantic Search API',
        version: '1.0.0',
        description: 'API for semantic search using PostgreSQL with pgvector',
        endpoints: {
            documents: '/api/documents',
            search: '/api/search',
            health: '/health'
        }
    });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start the Express server
const startServer = async () => {
    try {
        // Check database connection
        const { version, pgvector } = await dbService.getVersionInfo();
        logger.info(`Connected to PostgreSQL: ${version}`);
        logger.info(`pgvector extension: ${pgvector ? 'Installed' : 'Not installed'}`);

        if (!pgvector) {
            logger.warn('pgvector extension is not installed. Some features may not work correctly.');
        }

        // Start the API server
        app.listen(port, () => {
            logger.info(`Server started on port ${port}`);
            logger.info(`API documentation available at http://localhost:${port}/`);
        });

        // Start the MCP server
        await startMcpServer();
    } catch (error) {
        logger.error('Failed to start server', error);
        process.exit(1);
    }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', { reason, promise });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error);
    process.exit(1);
});

export default app;