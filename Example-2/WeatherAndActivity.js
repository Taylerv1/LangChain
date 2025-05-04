import { Tool } from "langchain/tools";
import axios from "axios";

export class WeatherTool extends Tool {
  name = "get-weather";
  description = "Provides current weather information for a specified city.";
  async _call(city) {
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      const response = await axios.get(
        "https://api.openweathermap.org/data/2.5/weather",
        {
          params: {
            q: city,
            appid: apiKey,
            units: "metric",
          },
        }
      );
      const data = response.data;
      return `The weather in ${data.name}: ${data.weather[0].description}, temperature: ${data.main.temp}°C.`;
    } catch (error) {
      return `Unable to retrieve weather data for "${city}".`;
    }
  }
}

export class ActivitySuggestionTool extends Tool {
  name = "suggest-activity";
  description = "Suggests an outdoor activity based on the current weather conditions.";
  async _call(weatherDescription) {
    try {
      // Forward the weather description to the LLM for suggestion processing
      // The LLM will determine appropriate activities based on the weather context
      // No hardcoded conditions or activities
      
      return `Request for activity suggestions based on: ${weatherDescription}`;
    } catch (error) {
      return `Unable to process activity suggestion request for: ${weatherDescription}`;
    }
  }
}