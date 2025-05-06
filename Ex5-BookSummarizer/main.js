// Book Summarizer using LangChain with Node.js
import * as dotenv from "dotenv";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ChatOpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { loadSummarizationChain } from "langchain/chains";
import { Document } from "@langchain/core/documents";

// Setup
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize OpenAI model
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  modelName: "gpt-4o",
});

// Configure text splitter
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 2000,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", ". ", " ", ""] //////                              /////                                         xxx
});

// Main summarization function
async function summarizeBook(filePath) {
  try {
    console.log(`Starting to summarize book: ${path.basename(filePath)}`);
    
    const bookContent = await fs.readFile(filePath, 'utf-8');
    console.log(`Book loaded successfully (${bookContent.length} characters)`);
    
    const texts = await textSplitter.splitText(bookContent);
    console.log(`Book split into ${texts.length} chunks`);
    
    const docs = texts.map(text => new Document({ pageContent: text }));
    
    const chain = loadSummarizationChain(model, {
      type: "map_reduce",
      verbose: false,
    });
    
    console.log("Generating summary...");
    const result = await chain.invoke({
      input_documents: docs,
    });
    
    return result.text;
  } catch (error) {
    console.error("Error summarizing book:", error);
    throw error;
  }
}

// Main execution
async function main() {
  const bookFilePath = path.join(__dirname, "palestinian_Intifada.txt");
  
  try {
    // Verify file exists
    await fs.access(bookFilePath);
    console.log("File found, starting summarization...");
    
    // Generate and display summary
    const summary = await summarizeBook(bookFilePath);
    console.log("\n=== BOOK SUMMARY ===\n");
    console.log(summary);
    console.log("\n===================\n");
    
    // Save summary
    const outputPath = path.join(__dirname, `${path.basename(bookFilePath, path.extname(bookFilePath))}_summary.txt`);
    await fs.writeFile(outputPath, summary);
    console.log(`Summary saved to ${outputPath}\n`);
    
  } catch (error) {
    console.error("Error:", error?.message || error);
    process.exit(1);
  }
}

// Run the application
main();