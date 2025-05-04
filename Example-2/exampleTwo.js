import * as dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { WeatherTool, ActivitySuggestionTool } from "./WeatherAndActivity.js";

dotenv.config();

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  modelName: "gpt-4o",
});

// Create instances of both tools
const weatherTool = new WeatherTool();
const activitySuggestionTool = new ActivitySuggestionTool();

// Create the weather agent
export async function create_weather_agent(systemPromptText = "You are a helpful assistant that provides weather information.") {
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

// Create the activity suggestion agent
export async function create_activity_agent(systemPromptText = "You are a helpful assistant that suggests activities based on weather conditions. Analyze the weather information and suggest appropriate outdoor or indoor activities without using predefined categories. Be creative and consider the full context of the weather.") {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", systemPromptText],
            ["human", "Based on this weather information: {weather_info}, suggest some appropriate activities."],
            new MessagesPlaceholder("agent_scratchpad"),
        ]);
        
        const agent = await createOpenAIFunctionsAgent({
            llm: model,
            prompt: prompt,
            tools: [activitySuggestionTool],
        });
    
        return new AgentExecutor({
            agent,
            tools: [activitySuggestionTool],
            verbose: true,
            maxIterations: 3,
        });
}

// Run the sequence
async function runChain() {
    try {
        // Create both agents
        const weatherAgent = await create_weather_agent();
        const activityAgent = await create_activity_agent();
        
        // Get weather information first
        console.log("Getting weather for: New York");
        const weatherResult = await weatherAgent.invoke({
            input: "What is the weather in New York?",
        });
        
        const weatherInfo = weatherResult.output;
        console.log("Weather info received:", weatherInfo);
        
        // Then get activity suggestions based on the weather
        const activityResult = await activityAgent.invoke({
            weather_info: weatherInfo,
        });
        
        console.log("\nFINAL RESULT:");
        console.log(activityResult.output);
        
    } catch (error) {
        console.error("Error during chain execution:", error);
    }
}

// Execute the chain
runChain();