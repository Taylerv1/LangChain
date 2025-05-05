// 1. Import libraries
import * as dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { Calculator } from "@langchain/community/tools/calculator";
import { BufferMemory } from "langchain/memory";
import * as readline from 'readline';

// 2. Run dotenv
dotenv.config();

// 3. Create the model
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  modelName: "gpt-4o",
});

// 4. Create the tools
const calculator = new Calculator();

// 5. Create memory 
const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "chat_history",
  inputKey: "input",
  outputKey: "output", // Add outputKey to fix multiple key issue
});

// Create agent
async function createAgent() {
  // Make sure the memory is working before you create the agent.
  await memory.clear();
  
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant who can remember the previous conversation."],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);
  
  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    prompt: prompt,
    tools: [calculator],
  });
  
  return new AgentExecutor({
    agent,
    tools: [calculator],
    memory: memory,
    verbose: false,
  });
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Modified runConversation function
async function runConversation() {
  const agent = await createAgent();
  console.log("Chat started! (Type 'exit' to end the conversation)");
  
  // Create recursive chat function
  const chat = async () => {
    rl.question('You: ', async (input) => {
      if (input.toLowerCase() === 'exit') { 
        rl.close();
        return;
      }

      try {
        const response = await agent.invoke({ input });
        console.log('\nBot:', response.output, '\n');
        chat(); // Continue the conversation
      } catch (error) {
        console.error('Error:', error);
        chat(); // Continue despite error
      }
    });
  };

  // Start the chat
  chat();
}

// Handle readline close
rl.on('close', () => {
  console.log('\nChat ended. Goodbye!');
  process.exit(0);
});

runConversation();