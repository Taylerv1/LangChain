# Book Summarizer Using LangChain

This project demonstrates how to build a text summarization system using LangChain and OpenAI. It can process large text documents by splitting them into manageable chunks and generating concise summaries.

## How It Works

The summarizer works in four main steps:
1. Load and process the document
2. Split text into chunks
3. Generate embeddings and summaries for each chunk
4. Combine summaries using map-reduce

## Key Components Explained

### 1. Document Loading
```javascript
async function summarizeBook(filePath) {
  const bookContent = await fs.readFile(filePath, 'utf-8');
  // ...
}
```
Reads the text file into memory for processing.

### 2. Text Splitting
```javascript
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 2000,    // Characters per chunk
  chunkOverlap: 200,  // Overlap between chunks
  separators: ["\n\n", "\n", ". ", " ", ""]
});
```
- Breaks large texts into smaller pieces
- `chunkSize`: How many characters per chunk
- `chunkOverlap`: Helps maintain context between chunks
- `separators`: Where to split the text (in order of preference)

### 3. Document Processing
```javascript
const docs = texts.map(text => new Document({ pageContent: text }));
```
Converts text chunks into Document objects that LangChain can process.

### 4. Chain Configuration
```javascript
const chain = loadSummarizationChain(model, {
  type: "map_reduce",
  verbose: true,
});
```
Uses map-reduce approach:
- Map: Summarize each chunk independently
- Reduce: Combine chunk summaries into final summary

## Setup Instructions

1. **Install Dependencies**:
```bash
npm install @langchain/openai @langchain/core langchain dotenv
```

2. **Configure Environment**:
Create `.env` file:
```
OPENAI_API_KEY=your-api-key-here
```

3. **Prepare Your Text**:
- Place your text file in the project directory
- Update the filepath in `main.js`

## Usage Examples

### Basic Usage
```javascript
const bookFilePath = path.join(__dirname, "your-book.txt");
const summary = await summarizeBook(bookFilePath);
```

### With Custom Chunk Size
```javascript
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,    // Smaller chunks
  chunkOverlap: 100,  // Less overlap
});
```

## Practical Code Examples

### Processing Large Documents
```javascript
// For very large documents, adjust chunk settings
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 4000,     // Larger chunks for speed
  chunkOverlap: 400,   // 10% overlap ratio
  separators: ["\n## ", "\n", ".", " "], // Smart splitting
});
```

### Custom Summary Chain
```javascript
// Create a chain that focuses on specific content
const chain = loadSummarizationChain(model, {
  type: "map_reduce",
  verbose: true,
  prompt: "Summarize with focus on main concepts and technical details:"
});
```

### Progress Tracking Example
```javascript
console.log(`Book loaded successfully (${bookContent.length} characters)`);
console.log(`Split into ${texts.length} chunks`);
// Shows helpful progress like:
// "Book loaded successfully (125000 characters)"
// "Split into 63 chunks"
```

## Understanding the Output

The system provides progress updates:
```
Starting to summarize book: example.txt
Book loaded successfully (50000 characters)
Book split into 25 chunks
Generating summary...
```



## Best Practices

1. **Text Preparation**:
   - Clean your text files before processing
   - Remove special characters or formatting
   - Use UTF-8 encoding

2. **Chunk Size Optimization**:
   - Larger chunks (2000+ chars) for broad summaries
   - Smaller chunks (500-1000 chars) for detailed summaries

3. **Memory Management**:
   - Monitor RAM usage with large documents
   - Adjust chunk size if needed

## Troubleshooting

Common issues and solutions:

1. **"File not found" Error**:
   ```javascript
   // Check file path is correct
   const bookFilePath = path.join(__dirname, "filename.txt");
   ```

2. **Memory Issues**:
   ```javascript
   // Reduce chunk size
   chunkSize: 1000,  // Smaller chunks
   ```

3. **API Errors**:
   - Verify API key in .env
   - Check OpenAI account status

## Customization Options

1. **Change Model**:
```javascript
const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",  // Different model
  temperature: 0.3,            // More creative
});
```

2. **Adjust Summary Style**:
```javascript
const chain = loadSummarizationChain(model, {
  type: "stuff",  // Alternative to map_reduce
  verbose: true,
});
```

## Performance Tips

1. Optimize chunk size based on your needs
2. Use appropriate overlap for context preservation
3. Consider batch processing for large documents
4. Monitor API usage and costs

## Educational Resources

- [LangChain Documentation](https://js.langchain.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Text Splitting Strategies](https://js.langchain.com/docs/modules/data_connection/document_transformers/)
