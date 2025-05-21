// scripts/seed-data.ts
import searchService from '../src/services/search.service';
import logger from '../src/utils/logger';

// Sample data for seeding
const sampleDocuments = [
    {
        title: 'Introduction to Vector Databases',
        content: `
      Vector databases are specialized database systems designed to store and query high-dimensional vectors.
      These vectors typically represent embeddings of various data types such as text, images, audio, or video.
      Vector databases excel at similarity search operations, allowing you to find items that are semantically similar to a query.
      This makes them ideal for applications like semantic search, recommendation systems, and AI-powered applications.
    `,
        metadata: {
            category: 'technology',
            tags: ['vector database', 'embeddings', 'similarity search']
        }
    },
    {
        title: 'PostgreSQL and pgvector',
        content: `
      PostgreSQL is a powerful open-source relational database system with more than 30 years of active development.
      pgvector is an extension for PostgreSQL that adds support for vector similarity search.
      With pgvector, you can store vector embeddings directly in your PostgreSQL database and perform efficient similarity searches.
      This extension supports various distance metrics including Euclidean distance, cosine similarity, and inner product.
      It also provides indexing capabilities for faster searches, such as the HNSW (Hierarchical Navigable Small World) index.
    `,
        metadata: {
            category: 'technology',
            tags: ['postgresql', 'pgvector', 'database extensions']
        }
    },
    {
        title: 'Model Context Protocol (MCP)',
        content: `
      The Model Context Protocol (MCP) is a new standard for connecting AI assistants to the systems where data lives.
      MCP acts as a bridge between AI models and external tools or data sources, including content repositories, business tools, and development environments.
      This protocol allows AI assistants to access and operate with context-specific information, leading to more relevant and useful responses.
      MCP simplifies the integration of AI with existing systems by providing a standardized way to connect to various data sources without requiring custom implementations for each one.
    `,
        metadata: {
            category: 'AI',
            tags: ['mcp', 'ai assistants', 'model context protocol']
        }
    },
    {
        title: 'Embeddings in Natural Language Processing',
        content: `
      Embeddings are dense vector representations of words, phrases, or documents in a high-dimensional space.
      In the context of Natural Language Processing (NLP), embeddings capture semantic relationships between words and phrases.
      Words with similar meanings tend to have similar vector representations, enabling machines to understand semantic similarity.
      Common embedding models include Word2Vec, GloVe, and more recently, embeddings from transformer models like BERT, GPT, and their derivatives.
      These embeddings serve as the foundation for many NLP tasks, including text classification, sentiment analysis, and semantic search.
    `,
        metadata: {
            category: 'AI',
            tags: ['nlp', 'embeddings', 'vector representations']
        }
    },
    {
        title: 'Semantic Search Implementation',
        content: `
      Semantic search goes beyond traditional keyword matching by understanding the intent and contextual meaning of search queries.
      To implement semantic search, you typically convert both the query and the documents into vector embeddings using machine learning models.
      These embeddings capture the semantic meaning of the text, allowing for comparison based on conceptual similarity rather than exact word matches.
      The search process involves calculating the similarity between the query vector and document vectors using metrics like cosine similarity.
      Results are ranked by similarity score, presenting the most semantically relevant documents to the user.
    `,
        metadata: {
            category: 'implementation',
            tags: ['semantic search', 'vector search', 'similarity metrics']
        }
    },
    {
        title: 'TypeScript for Backend Development',
        content: `
      TypeScript is a strongly typed programming language that builds on JavaScript by adding static type definitions.
      For backend development, TypeScript offers significant advantages including better code quality, improved developer experience, and fewer runtime errors.
      When using TypeScript with Node.js, developers benefit from type checking, code completion, and better documentation.
      Popular TypeScript frameworks for backend development include NestJS, Express with TypeScript, and Deno.
      The type system helps catch errors during development rather than in production, leading to more robust applications.
    `,
        metadata: {
            category: 'programming',
            tags: ['typescript', 'backend', 'web development']
        }
    },
    {
        title: 'Building AI-Powered Applications',
        content: `
      AI-powered applications integrate artificial intelligence capabilities to enhance functionality and user experience.
      These applications typically leverage machine learning models, natural language processing, computer vision, or other AI techniques.
      The key components of AI applications include data collection and preparation, model selection or training, model deployment, and monitoring.
      Integration with external AI services via APIs is a common approach for many applications, providing capabilities like language understanding or image recognition.
      Building effective AI applications requires consideration of both technical aspects and ethical concerns, including data privacy and bias mitigation.
    `,
        metadata: {
            category: 'AI',
            tags: ['ai applications', 'machine learning', 'application development']
        }
    }
];

const seedDatabase = async () => {
    try {
        logger.info('Starting database seeding...');

        // Add each sample document with its embedding
        for (const doc of sampleDocuments) {
            logger.info(`Adding document: ${doc.title}`);
            await searchService.addDocumentWithEmbedding(
                doc.title,
                doc.content,
                doc.metadata
            );
        }

        logger.info('Database seeding completed successfully');
    } catch (error) {
        logger.error('Error seeding database:', error);
        throw error;
    }
};

// Run the seeding if this script is executed directly
if (require.main === module) {
    seedDatabase()
        .then(() => {
            logger.info('Seeding complete!');
            process.exit(0);
        })
        .catch((error) => {
            logger.error('Seeding failed:', error);
            process.exit(1);
        });
}

export default seedDatabase;