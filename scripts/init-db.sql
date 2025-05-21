-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the documents table
CREATE TABLE IF NOT EXISTS documents (
                                         id SERIAL PRIMARY KEY,
                                         title TEXT NOT NULL,
                                         content TEXT NOT NULL,
                                         metadata JSONB,
                                         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                         updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the embeddings table
CREATE TABLE IF NOT EXISTS embeddings (
                                          id SERIAL PRIMARY KEY,
                                          document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
                                          embedding vector(1536), -- 1536 dimensions for OpenAI's text-embedding-3-small
                                          model TEXT NOT NULL, -- To track which embedding model was used
                                          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index for the embeddings using HNSW
CREATE INDEX IF NOT EXISTS embeddings_hnsw_idx ON embeddings
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at timestamp
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create a function for semantic search
CREATE OR REPLACE FUNCTION semantic_search(
    query_embedding vector(1536),
    similarity_threshold FLOAT,
    max_results INT
)
    RETURNS TABLE (
                      id INTEGER,
                      document_id INTEGER,
                      title TEXT,
                      content TEXT,
                      similarity FLOAT
                  )
    LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
        SELECT
            e.id,
            e.document_id,
            d.title,
            d.content,
            1 - (e.embedding <=> query_embedding) AS similarity
        FROM
            embeddings e
                JOIN
            documents d ON e.document_id = d.id
        WHERE
            1 - (e.embedding <=> query_embedding) > similarity_threshold
        ORDER BY
            similarity DESC
        LIMIT max_results;
END;
$$;