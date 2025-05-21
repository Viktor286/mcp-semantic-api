import documentModel from '../models/document.model';
import searchService from '../services/search.service';
import logger from '../utils/logger';
import { McpTool } from '../types';

// Define the MCP tools
export const mcpTools: McpTool[] = [
    {
        name: 'getDocuments',
        description: 'Get documents with pagination',
        parameters: {
            page: {
                type: 'number',
                description: 'Page number (starts at 1)',
                required: false,
                default: 1
            },
            pageSize: {
                type: 'number',
                description: 'Number of documents per page',
                required: false,
                default: 10
            }
        },
        returns: {
            items: {
                type: 'array',
                description: 'List of documents'
            },
            total: {
                type: 'number',
                description: 'Total number of documents'
            },
            page: {
                type: 'number',
                description: 'Current page'
            },
            pageSize: {
                type: 'number',
                description: 'Number of documents per page'
            },
            totalPages: {
                type: 'number',
                description: 'Total number of pages'
            }
        },
        func: async ({ page = 1, pageSize = 10 }) => {
            const offset = (page - 1) * pageSize;
            const documents = await documentModel.getAllDocuments(pageSize, offset);
            const total = await documentModel.countDocuments();

            return {
                items: documents,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            };
        }
    },

    {
        name: 'getDocument',
        description: 'Get a document by ID',
        parameters: {
            id: {
                type: 'number',
                description: 'Document ID',
                required: true
            }
        },
        returns: {
            id: {
                type: 'number',
                description: 'Document ID'
            },
            title: {
                type: 'string',
                description: 'Document title'
            },
            content: {
                type: 'string',
                description: 'Document content'
            },
            metadata: {
                type: 'object',
                description: 'Document metadata'
            },
            created_at: {
                type: 'string',
                description: 'Document creation timestamp'
            },
            updated_at: {
                type: 'string',
                description: 'Document update timestamp'
            }
        },
        func: async ({ id }) => {
            const document = await documentModel.getDocumentById(id);
            if (!document) {
                throw new Error(`Document with ID ${id} not found`);
            }
            return document;
        }
    },

    {
        name: 'createDocument',
        description: 'Create a new document with embedding',
        parameters: {
            title: {
                type: 'string',
                description: 'Document title',
                required: true
            },
            content: {
                type: 'string',
                description: 'Document content',
                required: true
            },
            metadata: {
                type: 'object',
                description: 'Document metadata',
                required: false
            }
        },
        returns: {
            id: {
                type: 'number',
                description: 'Document ID'
            },
            title: {
                type: 'string',
                description: 'Document title'
            },
            content: {
                type: 'string',
                description: 'Document content'
            },
            metadata: {
                type: 'object',
                description: 'Document metadata'
            },
            created_at: {
                type: 'string',
                description: 'Document creation timestamp'
            },
            updated_at: {
                type: 'string',
                description: 'Document update timestamp'
            }
        },
        func: async ({ title, content, metadata }) => {
            return await searchService.addDocumentWithEmbedding(title, content, metadata);
        }
    },

    {
        name: 'updateDocument',
        description: 'Update a document and its embedding',
        parameters: {
            id: {
                type: 'number',
                description: 'Document ID',
                required: true
            },
            title: {
                type: 'string',
                description: 'Document title',
                required: false
            },
            content: {
                type: 'string',
                description: 'Document content',
                required: false
            },
            metadata: {
                type: 'object',
                description: 'Document metadata',
                required: false
            }
        },
        returns: {
            id: {
                type: 'number',
                description: 'Document ID'
            },
            title: {
                type: 'string',
                description: 'Document title'
            },
            content: {
                type: 'string',
                description: 'Document content'
            },
            metadata: {
                type: 'object',
                description: 'Document metadata'
            },
            created_at: {
                type: 'string',
                description: 'Document creation timestamp'
            },
            updated_at: {
                type: 'string',
                description: 'Document update timestamp'
            }
        },
        func: async ({ id, title, content, metadata }) => {
            return await searchService.updateDocumentWithEmbedding(id, title, content, metadata);
        }
    },

    {
        name: 'deleteDocument',
        description: 'Delete a document and its embedding',
        parameters: {
            id: {
                type: 'number',
                description: 'Document ID',
                required: true
            }
        },
        returns: {
            success: {
                type: 'boolean',
                description: 'Whether the deletion was successful'
            }
        },
        func: async ({ id }) => {
            const success = await documentModel.deleteDocument(id);
            if (!success) {
                throw new Error(`Document with ID ${id} not found`);
            }
            return { success };
        }
    },

    {
        name: 'semanticSearch',
        description: 'Perform semantic search',
        parameters: {
            query: {
                type: 'string',
                description: 'Search query',
                required: true
            },
            similarityThreshold: {
                type: 'number',
                description: 'Minimum similarity threshold (0-1)',
                required: false,
                default: 0.7
            },
            maxResults: {
                type: 'number',
                description: 'Maximum results to return',
                required: false,
                default: 10
            }
        },
        returns: {
            results: {
                type: 'array',
                description: 'Search results'
            }
        },
        func: async ({ query, similarityThreshold = 0.7, maxResults = 10 }) => {
            const results = await searchService.semanticSearch(
                query,
                similarityThreshold,
                maxResults
            );
            return { results };
        }
    },

    {
        name: 'getDatabaseInfo',
        description: 'Get database information',
        parameters: {},
        returns: {
            version: {
                type: 'string',
                description: 'PostgreSQL version'
            },
            pgvector: {
                type: 'boolean',
                description: 'Whether pgvector extension is installed'
            }
        },
        func: async () => {
            const dbService = await import('../services/db.service').then(m => m.default);
            return await dbService.getVersionInfo();
        }
    }
];

// Convert the McpTool array to McpToolDefinition array for the server
export const getToolDefinitions = () => {
    return mcpTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
        returns: tool.returns
    }));
};