// src/services/search.service.ts
import documentModel, { SearchResult } from '../models/document.model';
import embeddingService from './embedding.service';
import logger from '../utils/logger';

class SearchService {
    /**
     * Perform a semantic search using text query
     */
    async semanticSearch(
        query: string,
        similarityThreshold = 0.7,
        maxResults = 10
    ): Promise<SearchResult[]> {
        try {
            // Generate embedding for the query
            const { embedding } = await embeddingService.generateEmbedding(query);

            // Perform search
            const results = await documentModel.semanticSearch(
                embedding,
                similarityThreshold,
                maxResults
            );

            return results;
        } catch (error) {
            logger.error('Error performing semantic search', error);
            throw error;
        }
    }

    /**
     * Add a document with its embedding
     */
    async addDocumentWithEmbedding(title: string, content: string, metadata?: Record<string, any>) {
        try {
            // First, create the document
            const document = await documentModel.createDocument({
                title,
                content,
                metadata
            });

            // Generate embedding
            const { embedding, model } = await embeddingService.generateDocumentEmbedding(
                title,
                content
            );

            // Store the embedding
            await documentModel.storeEmbedding({
                document_id: document.id!,
                embedding,
                model
            });

            return document;
        } catch (error) {
            logger.error('Error adding document with embedding', error);
            throw error;
        }
    }

    /**
     * Update a document and its embedding
     */
    async updateDocumentWithEmbedding(
        id: number,
        title?: string,
        content?: string,
        metadata?: Record<string, any>
    ) {
        try {
            // Get the current document
            const currentDocument = await documentModel.getDocumentById(id);
            if (!currentDocument) {
                throw new Error(`Document with ID ${id} not found`);
            }

            // Update the document
            const updateData: Partial<typeof currentDocument> = {};
            if (title !== undefined) updateData.title = title;
            if (content !== undefined) updateData.content = content;
            if (metadata !== undefined) updateData.metadata = metadata;

            if (Object.keys(updateData).length === 0) {
                return currentDocument; // Nothing to update
            }

            const updatedDocument = await documentModel.updateDocument(id, updateData);
            if (!updatedDocument) {
                throw new Error(`Failed to update document with ID ${id}`);
            }

            // If title or content changed, update the embedding
            if (title !== undefined || content !== undefined) {
                const { embedding, model } = await embeddingService.generateDocumentEmbedding(
                    updatedDocument.title,
                    updatedDocument.content
                );

                // Delete existing embedding and store new one
                await documentModel.storeEmbedding({
                    document_id: updatedDocument.id!,
                    embedding,
                    model
                });
            }

            return updatedDocument;
        } catch (error) {
            logger.error(`Error updating document ${id} with embedding`, error);
            throw error;
        }
    }
}

export default new SearchService();