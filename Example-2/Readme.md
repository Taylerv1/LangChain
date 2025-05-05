# Weather-Activity Assistant

A chained LangChain agent application that fetches weather information for a location and then suggests appropriate activities based on the current conditions.

## How It Works

### 1. Import All Tools

Import all necessary libraries and tools needed for the project:

```javascript
import * as dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { WeatherTool, ActivitySuggestionTool } from "./WeatherTool.js";
```

### 2. Run Dotenv Configuration

Load environment variables from your .env file:

```javascript
dotenv.config();
```

This ensures your API keys and other sensitive information are loaded from your environment variables.

### 3. Create Your Model

Set up your AI model (in this case OpenAI's GPT-4o):

```javascript
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  modelName: "gpt-4o",
});
```

This model will power both of our agents.

### 4. Create Instances of All Tools

Instantiate the tools your agents will use:

```javascript
const weatherTool = new WeatherTool();
const activitySuggestionTool = new ActivitySuggestionTool();
```

The `WeatherTool` fetches current weather data for a specified city.
The `ActivitySuggestionTool` helps suggest activities based on the weather conditions.

### 5. Create Your Agents

Build your two specialized agents:

#### Weather Agent
```javascript
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
        verbose: true,
        maxIterations: 3,
    });
}
```

#### Activity Suggestion Agent
```javascript
export async function create_activity_agent(systemPromptText = "You are a helpful assistant that suggests activities based on weather conditions.") {
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
```

### 6. Create and Run the Chain

Connect the two agents in sequence and execute the chain:

```javascript
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
```

## Setting Up

1. Create a `.env` file with your API keys:
   ```
   OPENWEATHER_API_KEY=your_openweather_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```

2. Install dependencies:
   ```
   npm install @langchain/openai langchain dotenv axios
   ```

3. Run the application:
   ```
   node index.js
   ```

## Architecture

This project demonstrates tool chaining in LangChain where:
1. The first agent uses the WeatherTool to get current weather data
2. The output from the first agent is passed as input to the second agent
3. The second agent suggests activities based on the weather conditions

By separating these concerns, each agent can specialize in a specific task while still working together to provide a comprehensive response.