import { useState, useEffect } from 'react';

interface WeatherData {
  condition: string;
  temperature: number;
  recommendation: string;
}

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Get user's location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;

        // Fetch weather data from Open-Meteo (free, no API key needed)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`
        );
        
        const data = await response.json();
        const weatherCode = data.current.weather_code;
        const temperature = Math.round(data.current.temperature_2m);

        // Map weather codes to conditions and recommendations
        const getWeatherInfo = (code: number) => {
          if (code === 0) return { condition: 'Clear', recommendation: 'Perfect weather! Enjoy your day.' };
          if (code <= 3) return { condition: 'Partly Cloudy', recommendation: 'Nice day ahead!' };
          if (code <= 49) return { condition: 'Foggy', recommendation: 'Drive carefully in the fog.' };
          if (code <= 69) return { condition: 'Rainy', recommendation: "Don't forget your umbrella! ☔" };
          if (code <= 79) return { condition: 'Snowy', recommendation: 'Bundle up! Snow expected today. ❄️' };
          if (code <= 99) return { condition: 'Stormy', recommendation: 'Stay safe! Storms expected today. ⚡' };
          return { condition: 'Unknown', recommendation: 'Have a great day!' };
        };

        const weatherInfo = getWeatherInfo(weatherCode);
        setWeather({
          condition: weatherInfo.condition,
          temperature,
          recommendation: weatherInfo.recommendation,
        });
      } catch (error) {
        console.error('Error fetching weather:', error);
        // Set default message if weather fetch fails
        setWeather({
          condition: 'Unknown',
          temperature: 0,
          recommendation: 'Have a wonderful day!',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return { weather, loading };
};
