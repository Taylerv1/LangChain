// Website RAG (Retrieval-Augmented Generation) Application
// This app extracts content from a website, indexes it, and answers user questions about it

// Import required libraries
import * as dotenv from 'dotenv';
import * as readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ChatOpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";

// Load environment variables
dotenv.config();

// Set up ES module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to fetch and extract text from a website
async function fetchWebsiteContent(url) {
  try {
    console.log(`Fetching content from ${url}...`);
    
    // Add http protocol if not present
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Fetch HTML content
    const response = await axios.get(url);
    const html = response.data;
    
    // Load HTML into cheerio
    const $ = cheerio.load(html);
    
    // Remove script, style, and hidden elements
    $('script, style, meta, link, noscript, [style*="display:none"], [style*="display: none"]').remove();
    
    // Extract text from HTML body
    let text = $('body').text();
    
    // Clean up text: remove extra whitespace, normalize line breaks
    text = text.replace(/\s+/g, ' ')
               .replace(/\n+/g, '\n')
               .trim();
    
    console.log(`Successfully extracted ${text.length} characters of text`);
    return text;
  } catch (error) {
    console.error('Error fetching website content:', error.message);
    throw error;
  }
}

// Function to split text into chunks
async function splitTextIntoChunks(text) {
  try {
    console.log('Splitting text into chunks...');
    
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", ". ", " ", ""]
    });
    
    const chunks = await splitter.splitText(text);
    
    console.log(`Text split into ${chunks.length} chunks`);
    return chunks;
  } catch (error) {
    console.error('Error splitting text:', error.message);
    throw error;
  }
}

// Function to create vector store from chunks
async function createVectorStore(chunks, sourceUrl) {
  try {
    console.log('Creating vector store from chunks...');
    
    // Create documents from chunks, adding metadata
    const documents = chunks.map(chunk => 
      new Document({ 
        pageContent: chunk,
        metadata: { source: sourceUrl }
      })
    );
    
    // Initialize OpenAI embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    
    // Choose vector store type based on environment variable or default to memory
    let vectorStore;
    if (process.env.VECTOR_STORE_TYPE === 'faiss') {
      // For FAISS, you'd typically save to disk, but for simplicity, we'll just create in memory
      vectorStore = await FaissStore.fromDocuments(documents, embeddings);
      console.log('FAISS vector store created successfully');
    } else {
      // Default to in-memory vector store
      vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);
      console.log('Memory vector store created successfully');
    }
    
    return vectorStore;
  } catch (error) {
    console.error('Error creating vector store:', error.message);
    throw error;
  }
}

// Function to set up RAG chain with ChatOpenAI
async function setupRAGChain(vectorStore) {
  try {
    console.log('Setting up RAG chain...');
    
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.2,
      modelName: "gpt-4",
    });

    const prompt = ChatPromptTemplate.fromTemplate(`
    You are an AI assistant that answers questions based on the provided website content.
    
    Context information is below:
    ---
    {context}
    ---
    
    Given the context information and not prior knowledge, answer the question: {question}
    
    If the answer cannot be found in the context, say "I don't have enough information to answer this question based on the website content."
    `);

    const retriever = vectorStore.asRetriever({
      k: 5,
    });

    // Create the RAG chain using the new API
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

    console.log('RAG chain set up successfully');
    return chain;
  } catch (error) {
    console.error('Error setting up RAG chain:', error.message);
    throw error;
  }
}

// Function to handle user questions
async function handleUserQuestions(ragChain) {
  return new Promise((resolve) => {
    const askQuestion = () => {
      rl.question('\nAsk a question about the website content (or type "exit" to quit): ', async (question) => {
        if (question.toLowerCase() === 'exit') {
          console.log('Exiting Q&A session.');
          rl.close();
          resolve();
          return;
        }
        
        try {
          console.log('\nFinding answer...');
          
          // Execute RAG chain to get answer
          const result = await ragChain.invoke({
            question: question,
          });
          
          console.log('\n=== Answer ===');
          console.log(result);
          
          askQuestion();
        } catch (error) {
          console.error('Error getting answer:', error.message);
          askQuestion();
        }
      });
    };
    
    askQuestion();
  });
}

// Main function to run the application
async function run() {
  try {
    console.log('Welcome to Website RAG - Ask questions about any website!');
    console.log('-------------------------------------------------------');
    
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY environment variable not set');
      console.log('Please create a .env file with your OpenAI API key');
      process.exit(1);
    }
    
    // Get website URL from user
    rl.question('Enter the website URL to analyze: ', async (url) => {
      try {
        // Process the website
        const websiteContent = await fetchWebsiteContent(url);
        const textChunks = await splitTextIntoChunks(websiteContent);
        const vectorStore = await createVectorStore(textChunks, url);
        const ragChain = await setupRAGChain(vectorStore);
        
        console.log('\nWebsite content has been processed and indexed successfully!');
        console.log('You can now ask questions about the content.');
        
        // Handle user questions
        await handleUserQuestions(ragChain);
      } catch (error) {
        console.error('Application error:', error.message);
        rl.close();
      }
    });
    
    // Handle readline close event
    rl.on('close', () => {
      console.log('\nThank you for using Website RAG. Goodbye!');
      process.exit(0);
    });
  } catch (error) {
    console.error('Application setup error:', error);
    process.exit(1);
  }
}

// Run the application
run();