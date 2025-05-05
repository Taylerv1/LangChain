# Quick Guide: Short-Term Memory Chatbot (LangChain.js)

A tiny JavaScript chatbot that “remembers” your last message using LangChain.js and OpenAI.

---

## 1. Setup

```bash
npm install langchain dotenv @langchain/openai @langchain/community/tools/calculator

Create a .env file:

OPENAI_API_KEY=your_key_here


---

2. Import Libraries

import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { Calculator } from "@langchain/community/tools/calculator";
import { BufferMemory } from "langchain/memory";


---

3. Initialize the Model

dotenv.config();
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0
});


---

4. Configure Memory

const memory = new BufferMemory({
  memoryKey: "history",
  returnMessages: true
});


---

5. Build the Agent

import { createOpenAIFunctionsAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

async function makeAgent() {
  await memory.clear();

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You remember past messages."],
    new MessagesPlaceholder("history"),
    ["human", "{input}"]
  ]);

  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    prompt,
    tools: [ new Calculator() ]
  });

  return new AgentExecutor({
    agent,
    memory,
    tools: [ new Calculator() ]
  });
}


---

6. Run the Bot

async function demo() {
  const bot = await makeAgent();

  // 1️⃣ Store “Sam” in memory
  console.log((await bot.invoke({ input: "My name is Sam." })).output);

  // 2️⃣ Retrieve it on the next call
  console.log((await bot.invoke({ input: "What's my name?" })).output);
}

demo();


---

## Code Example: Chat Loop Implementation

Here's a key part of our chatbot that handles the conversation flow:

```javascript
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
      chat();
    }
  });
};
```

### How It Works:

1. The bot shows a "You: " prompt and waits for your input
2. If you type "exit", the chat ends
3. Your message is sent to the AI agent
4. The bot prints the AI's response
5. The process repeats (thanks to `chat()` calling itself)

Example conversation:
```
You: Hello!
Bot: Hi! How can I help you today?

You: What's 2 + 2?
Bot: Let me calculate that for you. 2 + 2 = 4

You: exit
Chat ended. Goodbye!
```

---

What Happens?

First call saves “Sam” to short-term memory.

Second call reads from memory and replies “Your name is Sam.”


Enjoy experimenting with your mini chatbot!