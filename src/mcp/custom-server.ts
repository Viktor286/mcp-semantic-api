import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { mcpTools } from './tools';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

/**
 * A simplified MCP server implementation using Express and Socket.IO
 * This replaces the dependency on @modelcontextprotocol packages
 */
export class CustomMcpServer {
    private app: express.Express;
    private server: http.Server;
    private io: SocketServer;
    private port: number;
    private tools: Record<string, any>;

    constructor(port: number) {
        this.port = port;
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new SocketServer(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        this.tools = {};

        // Set up middleware
        this.app.use(express.json());

        // Register tools
        this.registerTools();

        // Set up routes
        this.setupRoutes();

        // Set up Socket.IO event handlers
        this.setupSocketHandlers();
    }

    /**
     * Register tools from the mcpTools array
     */
    private registerTools() {
        for (const tool of mcpTools) {
            this.tools[tool.name] = tool.func;
            logger.info(`Registered MCP tool: ${tool.name}`);
        }
    }

    /**
     * Set up Express routes
     */
    private setupRoutes() {
        // MCP Schema endpoint
        this.app.get('/schema', (req, res) => {
            const schema = {
                tools: mcpTools.map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters,
                    returns: tool.returns
                }))
            };

            res.json(schema);
        });

        // Tool execution endpoint
        this.app.post('/tools/:name', async (req, res) => {
            const toolName = req.params.name;
            const params = req.body;

            if (!this.tools[toolName]) {
                return res.status(404).json({
                    error: `Tool '${toolName}' not found`
                });
            }

            try {
                const result = await this.tools[toolName](params);
                res.json({ result });
            } catch (error: any) {
                logger.error(`Error executing tool ${toolName}:`, error);
                res.status(500).json({
                    error: error.message || 'Internal server error'
                });
            }
        });

        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                tools: Object.keys(this.tools)
            });
        });
    }

    /**
     * Set up Socket.IO event handlers
     */
    private setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            logger.info(`MCP client connected: ${socket.id}`);

            // Tool execution via Socket.IO
            socket.on('execute_tool', async (data, callback) => {
                const { tool, params } = data;

                if (!this.tools[tool]) {
                    return callback({
                        error: `Tool '${tool}' not found`
                    });
                }

                try {
                    const result = await this.tools[tool](params);
                    callback({ result });
                } catch (error: any) {
                    logger.error(`Error executing tool ${tool}:`, error);
                    callback({
                        error: error.message || 'Internal server error'
                    });
                }
            });

            socket.on('disconnect', () => {
                logger.info(`MCP client disconnected: ${socket.id}`);
            });
        });
    }

    /**
     * Start the MCP server
     */
    public async start(): Promise<void> {
        return new Promise((resolve) => {
            this.server.listen(this.port, () => {
                logger.info(`Custom MCP server started on port ${this.port}`);
                logger.info(`Available tools: ${Object.keys(this.tools).join(', ')}`);
                resolve();
            });
        });
    }

    /**
     * Stop the MCP server
     */
    public async stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server.close((err) => {
                if (err) {
                    logger.error('Error closing MCP server:', err);
                    reject(err);
                } else {
                    logger.info('MCP server stopped');
                    resolve();
                }
            });
        });
    }
}

// Start the server if this file is run directly
if (require.main === module) {
    const port = parseInt(process.env.MCP_SERVER_PORT || '8080', 10);
    const server = new CustomMcpServer(port);
    server.start();
}

export default CustomMcpServer;