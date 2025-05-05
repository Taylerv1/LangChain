// 1. Import libraries
import * as dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { Calculator } from "@langchain/community/tools/calculator";
import { BufferMemory } from "langchain/memory";

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

// Turn on the conversation
async function runConversation() {
  const agent = await createAgent();
  
  // First conversation
  const response1 = await agent.invoke({
    input: "My name is tayler, can you calculate 7 * 10",
  });
  console.log("First reply", response1.output);
  
  // Second conversation - the bot will remember your name
  const response2 = await agent.invoke({
    input: "What's my name?",
  });
  console.log("Second reply", response2.output);
}

runConversation();