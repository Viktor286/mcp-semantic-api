// src/mcp/server.ts
import { createServer } from '@modelcontextprotocol/server';
import { mcpTools, getToolDefinitions } from './tools';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const startMcpServer = async () => {
    const port = parseInt(process.env.MCP_SERVER_PORT || '8080', 10);

    try {
        // Get tool definitions
        const toolDefinitions = getToolDefinitions();

        // Create MCP server
        const server = createServer({
            tools: toolDefinitions,
        });

        // Register tool handlers
        for (const tool of mcpTools) {
            server.registerToolHandler(tool.name, async (params) => {
                try {
                    return await tool.func(params);
                } catch (error) {
                    logger.error(`Error executing MCP tool ${tool.name}`, error);
                    throw error;
                }
            });
        }

        // Start the server
        await server.listen(port);

        logger.info(`MCP server started on port ${port}`);
        logger.info(`Available tools: ${mcpTools.map(tool => tool.name).join(', ')}`);
    } catch (error) {
        logger.error('Failed to start MCP server', error);
        process.exit(1);
    }
};

// Start the server if this file is run directly
if (require.main === module) {
    startMcpServer();
}

export default startMcpServer;