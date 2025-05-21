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

## Using Custom MCP Server

The custom MCP server implementation enables AI assistants to interact with your semantic search system through HTTP and WebSocket connections.
It provides tools for querying the database, adding documents, and performing semantic searches.

### MCP Server Endpoints

- `GET /schema` - Get the schema of available tools
- `POST /tools/:name` - Execute a tool
- `GET /health` - Check the health of the MCP server

### Available MCP Tools

- `getDocuments` - Get documents with pagination
- `getDocument` - Get a document by ID
- `createDocument` - Create a new document with embedding
- `updateDocument` - Update a document and its embedding
- `deleteDocument` - Delete a document
- `semanticSearch` - Perform semantic search
- `getDatabaseInfo` - Get database information

### Connecting AI Assistants

To connect an AI assistant to your custom MCP server:

1. Start the MCP server using `npm run mcp-server`
2. Configure your AI assistant to connect to the MCP server at `http://localhost:8080`
3. The AI assistant can access the schema at `http://localhost:8080/schema`
4. Tools can be executed via HTTP POST requests to `http://localhost:8080/tools/:name`
5. WebSocket connections can be established at `ws://localhost:8080`

### Example MCP Client

Here's a simple example of how to create a client that connects to the MCP server:

```typescript
import axios from 'axios';
import { io } from 'socket.io-client';

// HTTP Client
const httpClient = {
  async getSchema() {
    const response = await axios.get('http://localhost:8080/schema');
    return response.data;
  },
  
  async executeTool(toolName, params) {
    const response = await axios.post(`http://localhost:8080/tools/${toolName}`, params);
    return response.data.result;
  }
};

// WebSocket Client
const socket = io('http://localhost:8080');

socket.on('connect', () => {
  console.log('Connected to MCP server');
  
  // Execute a tool
  socket.emit('execute_tool', {
    tool: 'semanticSearch',
    params: {
      query: 'vector databases',
      similarityThreshold: 0.7,
      maxResults: 5
    }
  }, (response) => {
    if (response.error) {
      console.error('Error:', response.error);
    } else {
      console.log('Results:', response.result);
    }
  });
});

socket.on('disconnect', () => {
  console.log('Disconnected from MCP server');
});
```

## Notes on MCP Implementation

This project uses a custom implementation of the Model Context Protocol (MCP) rather than the official packages.
The custom implementation provides similar functionality:

- Tool registration and execution
- HTTP endpoints for schema retrieval and tool execution
- WebSocket support for real-time communication