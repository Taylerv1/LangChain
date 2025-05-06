# RAG (Retrieval-Augmented Generation) System

A detailed guide to building and using a RAG system with LangChain and OpenAI.

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Step-by-Step Implementation](#step-by-step-implementation)
- [Code Examples](#code-examples)
- [Setup Guide](#setup-guide)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)

## Overview

RAG combines document retrieval with AI text generation to provide accurate, context-aware responses. Think of it as giving the AI a relevant "textbook" to reference before answering questions.

## System Architecture

1. **Document Processing Pipeline**:
   - Load documents (PDF, TXT, etc.)
   - Split into manageable chunks
   - Create vector embeddings
   - Store in FAISS vector database

2. **Query Pipeline**:
   - Process user question
   - Find relevant document chunks
   - Generate context-aware response

## Step-by-Step Implementation

### 1. Document Loading
```javascript
const loadDocuments = () => {
  const text = fs.readFileSync("./Ex4-RAGSystem/article.txt", 'utf8');
  return [ new Document({ pageContent: text }) ];
};
```
- Reads text files into the system
- Converts them into Document objects for processing

### 2. Text Chunking
```javascript
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,    // Characters per chunk
  chunkOverlap: 200   // Overlap between chunks
});
```
- Splits large texts into smaller pieces
- Maintains context with overlap between chunks

### 3. Vector Store Creation
```javascript
const vectorStore = await FaissStore.fromDocuments(
  chunks, 
  new OpenAIEmbeddings()
);
```
- Creates embeddings for each chunk
- Stores them in FAISS for fast retrieval

### 4. RAG Chain Setup
```javascript
const prompt = PromptTemplate.fromTemplate(`
  Answer the question based only on the following context:
  {context}
  Question: {question}
`);
```
- Defines how to use retrieved context
- Structures the AI's response format

## Setup Guide

1. **Install Dependencies**:
```bash
npm init -y
npm install @langchain/openai @langchain/core langchain faiss-node dotenv
```

2. **Environment Setup**:
Create `.env` file:
```env
OPENAI_API_KEY=your-api-key-here
```

3. **Project Structure**:
```
Ex4-RAGSystem/
├── main.js           # Main RAG implementation
├── article.txt       # Source documents
├── .env             # Environment variables
└── README.md        # Documentation
```

4. **Configure Vector Store**:
- FAISS setup happens automatically
- No additional configuration needed

## Usage Examples

### Basic Usage:
```javascript
const main = async () => {
  const documents = loadDocuments();
  const vectorStore = await createVectorStore(documents);
  const ragChain = setupRagChain(vectorStore);
  
  const question = "What is machine learning?";
  const answer = await ragChain.invoke({ question });
  console.log(answer);
};
```

### Example Conversations:

```
Q: "What is machine learning?"
A: "Machine learning is a field of inquiry that focuses on creating methods 
   that can learn from and improve through data. It's considered a part of 
   artificial intelligence, where algorithms build models based on sample 
   data to make predictions or decisions without explicit programming."

Q: "What are the key features of deep learning?"
A: "The key features of deep learning include:
   1. Automatic feature extraction
   2. Hierarchical learning
   3. End-to-end learning
   4. Scalability with data"
```

## Troubleshooting

### Common Issues and Solutions:

1. **FAISS Installation Issues**:
   ```bash
   npm rebuild faiss-node
   ```

2. **Memory Problems with Large Documents**:
   - Reduce chunk size
   - Increase Node.js memory limit:
   ```bash
   node --max-old-space-size=8192 main.js
   ```

3. **Slow Response Times**:
   - Optimize chunk size
   - Reduce number of retrieved documents
   - Use faster embedding models

### Error Messages:

```javascript
Error: Unable to load document
Solution: Check file paths and permissions

Error: Vector store creation failed
Solution: Verify OpenAI API key and connection
```

## Performance Optimization

1. **Chunk Size Tuning**:
   - Smaller chunks (500-1000 chars) for precise retrieval
   - Larger chunks (1000-2000 chars) for more context

2. **Embedding Options**:
   - OpenAI embeddings (high quality, slower)
   - Local embeddings (faster, less accurate)

3. **Memory Management**:
   - Use streaming for large documents
   - Implement pagination for large result sets

## Advanced Features

1. **Custom Document Loaders**:
```javascript
const loadCustomDocument = async (filepath) => {
  // Custom loading logic
};
```

2. **Response Formatting**:
```javascript
const formatResponse = (answer) => {
  return answer.trim().split('\n').join('\n• ');
};
```

3. **Context Window Adjustment**:
```javascript
const retriever = vectorStore.asRetriever({
  k: 2,  // Number of chunks to retrieve
});
```

## Best Practices

1. **Document Preparation**:
   - Clean and normalize text
   - Remove irrelevant content
   - Maintain consistent formatting

2. **Query Optimization**:
   - Be specific with questions
   - Use clear, concise language
   - Consider context requirements

3. **System Maintenance**:
   - Regular vector store updates
   - Performance monitoring
   - API key rotation

## Security Considerations

1. **API Key Protection**:
   - Use environment variables
   - Implement key rotation
   - Monitor usage

2. **Data Privacy**:
   - Sanitize sensitive information
   - Implement access controls
   - Log system access
