import { useState } from "react";

interface WeatherData {
  location: {
    name: string;
  };
  current: {
    temp_f: number;
    temp_c: number;
    wind_mph: number;
    wind_kph: number;
    humidity: number;
  };
  forecast: {
    forecastday: {
      date: string;
      day: {
        avgtemp_f: number;
        avgtemp_c: number;
        maxwind_mph: number;
        maxwind_kph: number;
        avghumidity: number;
      };
    }[];
  };
}

interface AutocompleteItem {
  name: string;
  region: string;
}

const Weather = (): JSX.Element => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [city, setCity] = useState("New York");
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [error, setError] = useState("");
  const [isCelsius, setIsCelsius] = useState(false); // Add state for temperature units

  const fetchWeather = () => {
    fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=dc5066251d864a49af1145603231602&q=${city}&days=5&aqi=no&alerts=no`
    )
      .then((response) => response.json())
      .then((data) => setWeatherData(data))
      .catch((error) => setError(error.message));
  };

  const fetchAutocomplete = (query: string) => {
    fetch(
      `https://api.weatherapi.com/v1/search.json?key=dc5066251d864a49af1145603231602&q=${query}`
    )
      .then((response) => response.json())
      .then((data) => setSuggestions(data))
      .catch((error) => console.error(error));
  };

  const handleSelectSuggestion = (suggestion: AutocompleteItem) => {
    setCity(suggestion.name);
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchWeather();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
    if (e.target.value.length >= 3) {
      fetchAutocomplete(e.target.value);
    } else {
      setSuggestions([]);
    }
  };

  const handleUnitChange = () => {
    setIsCelsius((prev) => !prev); // Toggle the temperature units
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div>
        <button onClick={handleUnitChange}>
          {isCelsius ? "Switch to Fahrenheit" : "Switch to Celsius"}
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          onChange={handleInputChange}
          placeholder="Enter city"
        />
        <button type="submit">Search</button>
      </form>
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((item) => (
            <li key={item.name} onClick={() => handleSelectSuggestion(item)}>
              {item.name}, {item.region}
            </li>
          ))}
        </ul>
      )}
      {weatherData && weatherData.location && (
        <div>
          <h1>Weather Forecast for {weatherData.location.name}</h1>
          <div>Current Temperature: {weatherData.current.temp_f} F</div>
          <div>Wind Speed: {weatherData.current.wind_mph} mph</div>
          <div>Humidity: {weatherData.current.humidity}%</div>
          <h2>5-Day Forecast</h2>
          {weatherData.forecast.forecastday.map((day) => (
            <div key={day.date}>
              <h3>{day.date}</h3>
              <div>Average Temperature: {day.day.avgtemp_f} F</div>
              <div>Max Wind Speed: {day.day.maxwind_mph} mph</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Weather;
