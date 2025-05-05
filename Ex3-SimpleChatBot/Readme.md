# Simple ChatBot with Memory

This project creates a chatbot you can talk to in your command line. It uses LangChain and OpenAI's GPT-4o model. The bot can remember what you talked about earlier in your conversation.

## What This Bot Can Do

This chatbot:
- Uses GPT-4o to understand and respond to you
- Remembers your conversation so you don't need to repeat yourself
- Can do math calculations
- Works in your terminal/command line

## Code Explained

### 1. Loading Libraries
```javascript
import * as dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { Calculator } from "@langchain/community/tools/calculator";
import { BufferMemory } from "langchain/memory";
import * as readline from 'readline';
```
- **dotenv**: Loads your API key from a file
- **ChatOpenAI**: Connects to OpenAI
- **AgentExecutor, createOpenAIFunctionsAgent**: Creates the AI helper
- **ChatPromptTemplate, MessagesPlaceholder**: Helps format messages
- **Calculator**: Lets the bot do math
- **BufferMemory**: Stores your conversation history
- **readline**: Gets input from your keyboard

### 2. Loading Your API Key
```javascript
dotenv.config();
```
Gets your OpenAI API key from a file called .env.

### 3. Setting Up the AI Model
```javascript
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  modelName: "gpt-4o",
});
```
- Sets up GPT-4o with your API key
- Temperature 0 means answers will be consistent
- Uses the GPT-4o model

### 4. Adding a Calculator
```javascript
const calculator = new Calculator();
```
Creates a tool that helps the bot solve math problems.

### 5. Setting Up Memory
```javascript
const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "chat_history",
  inputKey: "input",
  outputKey: "output",
});
```
- Creates memory so the bot remembers your conversation
- Keeps track of what you both say

### 6. Creating the AI Helper
```javascript
async function createAgent() {
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
```
- Clears old memory
- Tells the bot to be helpful and remember past messages
- Connects the AI, memory, and calculator together

### 7. Setting Up User Input
```javascript
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
```
Creates a way for you to type messages and see responses.

### 8. Running the Conversation
```javascript
async function runConversation() {
  const agent = await createAgent();
  console.log("Chat started! (Type 'exit' to end the conversation)");
  
  const chat = async () => {
    rl.question('You: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
         rl.close();
        return;
      }
      
      try {
        const response = await agent.invoke({ input });
        console.log('\nBot:', response.output, '\n');
        chat();
      } catch (error) {
        console.error('Error:', error);
        chat();
      }
    });
  };
  
  chat();
}
```
- Creates the bot
- Shows a welcome message
- Asks for your input
- Sends your message to the bot
- Shows the bot's response
- Repeats until you type "exit"

### 9. Ending the Chat
```javascript
rl.on('close', () => {
  console.log('\nChat ended. Goodbye!');
  process.exit(0);
});
```
Says goodbye when you end the chat.

### 10. Starting Everything
```javascript
runConversation();
```
Starts the chatbot.

## How to Set Up This Project

1. **Create a new folder for your project**:
   ```bash
   mkdir chatbot
   cd chatbot
   ```

2. **Start a new project**:
   ```bash
   npm init -y
   ```

3. **Install needed packages**:
   ```bash
   npm install dotenv @langchain/openai langchain @langchain/core
   ```

4. **Create a .env file with your API key**:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

5. **Create a file called index.js with the code above**

6. **Add "type": "module" to your package.json file**:
   ```json
   {
     "type": "module",
     // other settings...
   }
   ```

7. **Run your chatbot**:
   ```bash
   node index.js
   ```

## How to Use the Chatbot

When you run the program:
1. You'll see "Chat started! (Type 'exit' to end the conversation)"
2. Type your message after "You: "
3. The bot will respond with "Bot: [its answer]"
4. You can keep chatting until you type "exit"

The bot will remember what you talked about earlier in your conversation.

## Ways to Change the Bot

- **Add more tools**: Give the bot more abilities
- **Change the intro message**: Edit what the bot knows about itself
- **Change how the bot thinks**: Adjust temperature for more creative or more precise answers
- **Make the bot handle specific types of questions**: Add special rules for certain topics

## Fixing Problems

- Make sure your OpenAI API key is correct in the .env file
- Check that you installed all the packages
- If the bot forgets things, you might need to adjust the memory settings
- If you get errors about the model, make sure your OpenAI account can use GPT-4o