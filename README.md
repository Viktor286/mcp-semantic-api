# Semantic Search with TypeScript, MCP, PostgreSQL, and pgvector

Semantic search backend using TypeScript, PostgreSQL with the pgvector, and MCP for AI assistant integration.

## Features

- Document storage in PostgreSQL
- Vector embeddings generation and storage using pgvector
- Semantic search based on vector similarity
- RESTful API for document and search operations
- AI assistant integration via MCP

## Stack

- Node.js (v16+)
- Docker and Docker Compose
- PostgreSQL (with pgvector extension)
  - OpenAI API key (for generating embeddings)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/semantic-search.git
cd semantic-search
```

### 2. Set up environment variables

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Update the `.env` file with your OpenAI API key

### 3. Start PostgreSQL with pgvector using Docker

```bash
docker-compose up -d
```

### 4. Install dependencies

```bash
npm install
```

### 5. Set up the database

```bash
npm run setup-db
```

### 6. Seed the database with sample data

```bash
npm run seed-data
```

### 7. Build and start the application

```bash
npm run build
npm start
```

Dev with reloading:

```bash
npm run dev
```

### 8. Start the MCP server (in a separate terminal)

```bash
npm run mcp-server
```

## API Endpoints

### Documents

- `GET /api/documents` - Get all documents with pagination
- `GET /api/documents/:id` - Get a document by ID
- `POST /api/documents` - Create a new document with embedding
- `PUT /api/documents/:id` - Update a document and its embedding
- `DELETE /api/documents/:id` - Delete a document

### Search

- `GET /api/search?query={text}` - Perform semantic search

## Using the MCP Server

The MCP server enables AI assistants to interact with semantic search system. It provides tools for querying the database, adding documents, and performing semantic searches.

### Public MCP Tools

- `getDocuments` - Get documents with pagination
- `getDocument` - Get a document by ID
- `createDocument` - Create a new document with embedding
- `updateDocument` - Update a document and its embedding
- `deleteDocument` - Delete a document
- `semanticSearch` - Perform semantic search
- `getDatabaseInfo` - Get database information

### Connecting to Claude

1. Configure Claude Desktop to connect to your MCP server:

```json
{
  "mcpServers": {
    "semanticSearch": {
      "command": "node",
      "args": ["path/to/semantic-search/dist/mcp/server.js"]
    }
  }
}
```

2. Use Claude to interact with your semantic search system:

```
Claude, please use the semanticSearch tool to find documents about vector databases.
```

🎉 Win!