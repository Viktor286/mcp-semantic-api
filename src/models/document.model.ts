import dbService from '../services/db.service';
import logger from '../utils/logger';

export interface Document {
    id?: number;
    title: string;
    content: string;
    metadata?: Record<string, any>;
    created_at?: Date;
    updated_at?: Date;
}

export interface Embedding {
    id?: number;
    document_id: number;
    embedding: number[];
    model: string;
    created_at?: Date;
}

export interface SearchResult {
    id: number;
    document_id: number;
    title: string;
    content: string;
    similarity: number;
}

class DocumentModel {
    /**
     * Create a new document
     */
    async createDocument(document: Document): Promise<Document> {
        try {
            const { rows } = await dbService.query(
                'INSERT INTO documents (title, content, metadata) VALUES ($1, $2, $3) RETURNING *',
                [document.title, document.content, document.metadata || {}]
            );
            return rows[0];
        } catch (error) {
            logger.error('Error creating document', error);
            throw error;
        }
    }

    /**
     * Get a document by id
     */
    async getDocumentById(id: number): Promise<Document | null> {
        try {
            const { rows } = await dbService.query(
                'SELECT * FROM documents WHERE id = $1',
                [id]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            logger.error(`Error fetching document with id ${id}`, error);
            throw error;
        }
    }

    /**
     * Get all documents with optional pagination
     */
    async getAllDocuments(limit = 100, offset = 0): Promise<Document[]> {
        try {
            const { rows } = await dbService.query(
                'SELECT * FROM documents ORDER BY created_at DESC LIMIT $1 OFFSET $2',
                [limit, offset]
            );
            return rows;
        } catch (error) {
            logger.error('Error fetching documents', error);
            throw error;
        }
    }

    /**
     * Update a document
     */
    async updateDocument(id: number, document: Partial<Document>): Promise<Document | null> {
        try {
            // Build the dynamic SET part of the query
            const setEntries = Object.entries(document)
                .filter(([key]) => key !== 'id' && key !== 'created_at' && key !== 'updated_at');

            if (setEntries.length === 0) {
                return null;
            }

            const setClause = setEntries
                .map(([key], index) => `${key} = $${index + 2}`)
                .join(', ');

            const values = [id, ...setEntries.map(([, value]) => value)];

            const { rows } = await dbService.query(
                `UPDATE documents SET ${setClause} WHERE id = $1 RETURNING *`,
                values
            );

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            logger.error(`Error updating document with id ${id}`, error);
            throw error;
        }
    }

    /**
     * Delete a document
     */
    async deleteDocument(id: number): Promise<boolean> {
        try {
            const { rowCount } = await dbService.query(
                'DELETE FROM documents WHERE id = $1',
                [id]
            );
            return rowCount > 0;
        } catch (error) {
            logger.error(`Error deleting document with id ${id}`, error);
            throw error;
        }
    }

    /**
     * Store an embedding
     */
    async storeEmbedding(embedding: Embedding): Promise<Embedding> {
        try {
            const { rows } = await dbService.query(
                'INSERT INTO embeddings (document_id, embedding, model) VALUES ($1, $2, $3) RETURNING *',
                [embedding.document_id, embedding.embedding, embedding.model]
            );
            return rows[0];
        } catch (error) {
            logger.error('Error storing embedding', error);
            throw error;
        }
    }

    /**
     * Perform semantic search using the built-in function
     */
    async semanticSearch(queryEmbedding: number[], similarityThreshold = 0.7, maxResults = 10): Promise<SearchResult[]> {
        try {
            const { rows } = await dbService.query(
                'SELECT * FROM semantic_search($1, $2, $3)',
                [queryEmbedding, similarityThreshold, maxResults]
            );
            return rows;
        } catch (error) {
            logger.error('Error performing semantic search', error);
            throw error;
        }
    }

    /**
     * Count total documents
     */
    async countDocuments(): Promise<number> {
        try {
            const { rows } = await dbService.query('SELECT COUNT(*) FROM documents');
            return parseInt(rows[0].count, 10);
        } catch (error) {
            logger.error('Error counting documents', error);
            throw error;
        }
    }
}

export default new DocumentModel();