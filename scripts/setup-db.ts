import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

dotenv.config();

const setupDatabase = async () => {
    // Configuration for connecting to PostgreSQL
    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'semantic_search',
    };

    console.log('Setting up the database...');

    // Create a connection pool
    const pool = new Pool(config);

    try {
        // Check if connected to the database
        await pool.query('SELECT NOW()');
        console.log(`Successfully connected to PostgreSQL at ${config.host}:${config.port}`);

        // Check if pgvector extension is installed
        const { rows: extensionRows } = await pool.query(
            "SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector')"
        );

        if (!extensionRows[0].exists) {
            console.log('Installing the pgvector extension...');
            await pool.query('CREATE EXTENSION IF NOT EXISTS vector');
            console.log('pgvector extension successfully installed');
        } else {
            console.log('pgvector extension is already installed');
        }

        // Read the SQL initialization script
        const initSqlPath = path.join(__dirname, '..', 'scripts', 'init-db.sql');

        // Check if the file exists
        if (!fs.existsSync(initSqlPath)) {
            console.error('SQL initialization file not found. Creating it...');

            // Create the directory if it doesn't exist
            const dir = path.dirname(initSqlPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Generate the SQL content
            const sqlContent = `-- Enable the pgvector extension
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
$$;`;

            // Write the SQL file
            fs.writeFileSync(initSqlPath, sqlContent);
            console.log(`Created SQL initialization file at ${initSqlPath}`);
        }

        // Read and execute the SQL script
        const fileStream = fs.createReadStream(initSqlPath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        // Collect SQL statements
        let sqlStatement = '';
        const sqlStatements = [];

        for await (const line of rl) {
            // Skip comments and empty lines
            if (line.trim().startsWith('--') || line.trim() === '') {
                continue;
            }

            sqlStatement += line + ' ';

            // If the line ends with a semicolon, it's the end of a statement
            if (line.trim().endsWith(';')) {
                sqlStatements.push(sqlStatement);
                sqlStatement = '';
            }
        }

        // Execute each SQL statement
        console.log('Executing SQL initialization script...');
        for (const statement of sqlStatements) {
            try {
                await pool.query(statement);
            } catch (error) {
                console.error(`Error executing SQL statement: ${statement.substring(0, 100)}...`);
                console.error(error);
            }
        }

        console.log('Database setup completed successfully');
    } catch (error) {
        console.error('Error setting up database:', error);
        throw error;
    } finally {
        // Close the pool
        await pool.end();
    }
};

// Run the setup if this script is executed directly
if (require.main === module) {
    setupDatabase()
        .then(() => {
            console.log('Setup complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Setup failed:', error);
            process.exit(1);
        });
}

export default setupDatabase;