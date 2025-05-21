// src/types/index.ts

// Request types
export interface CreateDocumentRequest {
    title: string;
    content: string;
    metadata?: Record<string, any>;
}

export interface UpdateDocumentRequest {
    title?: string;
    content?: string;
    metadata?: Record<string, any>;
}

export interface SearchRequest {
    query: string;
    similarityThreshold?: number;
    maxResults?: number;
}

// Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Error types
export class ApiError extends Error {
    statusCode: number;
    details?: any;

    constructor(message: string, statusCode: number, details?: any) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.details = details;
    }
}

// Model Context Protocol types
export interface McpTool {
    name: string;
    description: string;
    parameters: Record<string, any>;
    returns: Record<string, any>;
    func: (...args: any[]) => Promise<any>;
}

export interface McpToolDefinition {
    name: string;
    description: string;
    parameters: Record<string, any>;
    returns: Record<string, any>;
}

export interface McpServerConfig {
    port: number;
    tools: McpToolDefinition[];
}