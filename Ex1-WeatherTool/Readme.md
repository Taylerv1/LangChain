# Building a Weather Assistant with LangChain

## Learning Objectives
- Build an AI agent that can understand natural language
- Connect to external APIs (OpenWeatherMap)
- Use LangChain's tools and agents
- Handle errors gracefully in AI applications

## Core Concepts Explained

### 1. The Weather Tool (WeatherTool.js)
This is our custom tool that fetches weather data. Let's break it down:

```javascript
// Example of how the WeatherTool works
export class WeatherTool extends Tool {
  name = "get-weather";  // Name that the AI uses to identify this tool
  description = "...";   // Helps AI understand when to use this tool

  async _call(city) {
    // Makes API call and formats weather data
    // Returns: "The weather in London: cloudy, temperature: 18°C"
  }
}
```

Key Learning Points:
- Tool extends LangChain's base Tool class
- Async operations handle API calls
- Error handling protects against API failures

### 2. The AI Agent (exampleOne.js)
The agent is the brain of our application. Here's how it works:

```javascript
// Step 1: Set up the AI model
const model = new ChatOpenAI({
  temperature: 0,      // 0 means more focused, factual responses
  modelName: "gpt-4"   // Using GPT-4 for better understanding
});

// Step 2: Create the agent
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a weather expert"],  // Role definition
  ["human", "{input}"],                    // User's question
  new MessagesPlaceholder("agent_scratchpad") // AI's thinking space
]);

// Step 3: Set up the executor
const executor = new AgentExecutor({
  agent,
  tools: [weatherTool],
  verbose: true,       // See the AI's thinking process
  maxIterations: 3     // Maximum attempts to solve a problem
});
```

## How Information Flows

1. **User Input** → `"What's the weather in Paris?"`
2. **Agent Processing**:
   ```javascript
   const result = await agent.invoke({
       input: "What's the weather in Paris?"
   });
   ```
   - Agent recognizes this needs weather information
   - Decides to use WeatherTool
   - Calls OpenWeatherMap API
   - Formats response for user

## Practical Examples

### Basic Weather Query
```javascript
// Example 1: Simple weather check
const result = await agent.invoke({
    input: "What's the weather in Tokyo?"
});
// Output: "The weather in Tokyo: clear sky, temperature: 22°C"

// Example 2: Complex query
const result = await agent.invoke({
    input: "Should I wear a jacket in London today?"
});
// Agent will:
// 1. Check London temperature
// 2. Make a recommendation based on temperature
```

### Error Handling Examples
```javascript
try {
    const result = await agent.invoke({
        input: "What's the weather in NonExistentCity?"
    });
} catch (error) {
    // Handles API errors or invalid cities
    console.error("Error:", error.message);
}
```

## Step-by-Step Setup Guide

1. **Environment Setup**
   ```bash
   # First, create your project directory
   mkdir weather-assistant
   cd weather-assistant

   # Initialize npm project
   npm init -y

   # Install dependencies
   npm install dotenv @langchain/openai langchain axios
   ```

2. **Configuration**
   ```javascript
   // .env file structure
   OPENAI_API_KEY=sk-your-key-here
   OPENWEATHER_API_KEY=your-key-here
   ```

3. **File Structure**
   ```
   weather-assistant/
   ├── exampleOne.js     # Main application logic
   ├── WeatherTool.js    # Weather API integration
   ├── .env              # API keys
   └── README.md         # Documentation
   ```

## Common Patterns and Best Practices

1. **API Key Management**
   - Always use environment variables
   - Never commit API keys to git

2. **Error Handling**
   - Always wrap API calls in try-catch
   - Provide meaningful error messages
   - Handle network failures gracefully

3. **Agent Configuration**
   - Keep temperature low for factual responses
   - Use verbose mode during development
   - Limit maxIterations to prevent infinite loops

## Debugging Tips

1. **Enable Verbose Mode**
   ```javascript
   const executor = new AgentExecutor({
       verbose: true  // See what the agent is thinking
   });
   ```

2. **Check API Responses**
   ```javascript
   // Add logging to WeatherTool
   console.log('API Response:', response.data);
   ```

## Exercises for Learning

1. **Basic**: Modify the weather response format
2. **Intermediate**: Add temperature unit conversion
3. **Advanced**: Add historical weather data support

## Need Help?

1. Check the common error messages:
   - "Invalid API key" → Verify your .env file
   - "City not found" → Check city name spelling
   - "Rate limit exceeded" → Wait and try again

2. Debugging steps:
   - Enable verbose mode
   - Check API responses
   - Verify environment variables

## License

MIT License - Feel free to use and modify!
