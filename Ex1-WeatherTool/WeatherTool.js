// WeatherTool.js
import { Tool } from "langchain/tools";
import axios from "axios";

export class WeatherTool extends Tool {
  name = "get-weather";
  description = "Provides current weather information for a specified city.";

  async _call(city) {
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
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

