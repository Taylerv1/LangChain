import * as dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { WeatherTool } from "./WeatherTool.js";

dotenv.config();

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  modelName: "gpt-4o",
});

const weatherTool = new WeatherTool();

export async function create_agent(systemPromptText = "You are a helpful assistant.") {
        // Create the correct prompt template with agent_scratchpad placeholder
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", systemPromptText],
            ["human", "{input}"],
            new MessagesPlaceholder("agent_scratchpad"),
        ]);
        
        const agent = await createOpenAIFunctionsAgent({
            llm: model,
            prompt: prompt,
            tools: [weatherTool],
        });
    
        return new AgentExecutor({
            agent,
            tools: [weatherTool],
            verbose: false,
            maxIterations: 3,
        });
}

const agent = await create_agent();
try {
    const result = await agent.invoke({
        input: "What is the weather in Damascus?",
    });
    console.log(result.output);
} catch (error) {
    console.error("Error during agent execution:", error);
}