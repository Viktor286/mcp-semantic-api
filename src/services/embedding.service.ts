import OpenAI from 'openai';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

class EmbeddingService {
    private openai: OpenAI;
    private readonly embeddingModel: string = 'text-embedding-3-small';

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY environment variable is required');
        }

        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    /**
     * Generate an embedding for a text string
     */
    async generateEmbedding(text: string): Promise<{ embedding: number[]; model: string }> {
        try {
            // Ensure the text isn't too long
            const truncatedText = text.substring(0, 8191);

            const response = await this.openai.embeddings.create({
                model: this.embeddingModel,
                input: truncatedText,
                encoding_format: 'float',
            });

            return {
                embedding: response.data[0].embedding,
                model: this.embeddingModel,
            };
        } catch (error) {
            logger.error('Error generating embedding', error);
            throw error;
        }
    }

    /**
     * Generate embeddings for multiple texts in batch
     */
    async generateEmbeddingsBatch(texts: string[]): Promise<Array<{ embedding: number[]; model: string }>> {
        try {
            // Ensure no text is too long
            const truncatedTexts = texts.map(text => text.substring(0, 8191));

            const response = await this.openai.embeddings.create({
                model: this.embeddingModel,
                input: truncatedTexts,
                encoding_format: 'float',
            });

            return response.data.map(item => ({
                embedding: item.embedding,
                model: this.embeddingModel,
            }));
        } catch (error) {
            logger.error('Error generating embeddings batch', error);
            throw error;
        }
    }

    /**
     * Combine the title and content to create a more comprehensive embedding
     */
    async generateDocumentEmbedding(title: string, content: string): Promise<{ embedding: number[]; model: string }> {
        const combinedText = `Title: ${title}\n\nContent: ${content}`;
        return this.generateEmbedding(combinedText);
    }
}

export default new EmbeddingService();