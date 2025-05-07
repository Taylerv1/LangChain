# Website RAG (Retrieval-Augmented Generation) Application

A Node.js application that allows users to extract content from any website and ask questions about it using LangChain and OpenAI's GPT models.

## How It Works

### 1. Content Extraction
The application uses Axios and Cheerio to fetch and parse website content:

```javascript
async function fetchWebsiteContent(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(html);
  // Removes non-content elements like scripts and hidden elements
  $('script, style, meta').remove();
  // Extracts and cleans text
  let text = $('body').text();
}
```

### 2. Text Processing
The content is split into manageable chunks using LangChain's RecursiveCharacterTextSplitter:

```javascript
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", ". ", " ", ""]
});
```

- `chunkSize`: Maximum size of each text chunk (1000 characters)
- `chunkOverlap`: Overlap between chunks to maintain context (200 characters)
- `separators`: Prioritized list of where to split text

### 3. Vector Storage
Text chunks are converted into vector embeddings using OpenAI's embedding model:

```javascript
const documents = chunks.map(chunk => 
  new Document({ 
    pageContent: chunk,
    metadata: { source: sourceUrl }
  })
);
```

Two vector store options are available:
- FAISS: For persistent storage
- Memory: For temporary, in-memory storage

### 4. RAG Chain Setup
The RAG chain combines:
1. Document retrieval
2. Prompt engineering
3. Language model processing

Key components:

```javascript
const chain = RunnableSequence.from([
  {
    context: async (input) => {
      const docs = await retriever.getRelevantDocuments(input.question);
      return docs.map(doc => doc.pageContent).join('\n');
    },
    question: (input) => input.question,
  },
  prompt,
  model,
  new StringOutputParser(),
]);
```

This sequence:
1. Retrieves relevant documents based on the question
2. Formats the context and question using a template
3. Sends to the language model for processing
4. Parses the response

### 5. Question-Answering Process

The application maintains an interactive Q&A session:

```javascript
rl.question('\nAsk a question about the website content (or type "exit" to quit): ',
  async (question) => {
    const result = await ragChain.invoke({
      question: question,
    });
    console.log('\n=== Answer ===');
    console.log(result);
  }
);
```

## Key Features

1. **Automatic Protocol Handling**: Automatically adds 'https://' if no protocol is specified
2. **Text Cleaning**: Removes irrelevant HTML elements and normalizes whitespace
3. **Context-Aware Responses**: Uses document retrieval to provide relevant answers
4. **Error Handling**: Comprehensive error catching and user-friendly messages
5. **Flexible Storage**: Supports both in-memory and FAISS vector stores

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `VECTOR_STORE_TYPE`: Set to 'faiss' for FAISS storage (optional)

## Example Usage

```bash
$ node main.js
Welcome to Website RAG - Ask questions about any website!
-------------------------------------------------------
Enter the website URL to analyze: example.com

# Example Questions:
Q: "What is the main topic of this website?"
Q: "Can you summarize the key points?"
Q: "What technologies are mentioned?"
```

## Technical Implementation Details

### Prompt Template
The system uses a carefully crafted prompt template:
```javascript
const prompt = ChatPromptTemplate.fromTemplate(`
You are an AI assistant that answers questions based on the provided website content.

Context information is below:
---
{context}
---

Given the context information and not prior knowledge, answer the question: {question}
`);
```

### Vector Retrieval
The retriever is configured to fetch the 5 most relevant document chunks:
```javascript
const retriever = vectorStore.asRetriever({
  k: 5, // Number of relevant chunks to retrieve
});
```

This balances between providing enough context and maintaining relevance.
