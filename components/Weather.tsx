import { useState } from "react";
import {
  Input,
  Button,
  Form,
  List,
  Typography,
  Switch,
  Row,
  Col,
  Card,
} from "antd";
const { Title } = Typography;
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
  const [city, setCity] = useState("");
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
    <Row justify="center">
      <Col span={12}>
        <Card title="Weather Forecast">
          <form onSubmit={handleSubmit}>
            <Input
              type="text"
              value={city}
              onChange={handleInputChange}
              placeholder="Enter city"
            />
            <Button type="primary" htmlType="submit">
              Search
            </Button>
            <Switch
              checked={isCelsius}
              onChange={handleUnitChange}
              checkedChildren="Celsius"
              unCheckedChildren="Fahrenheit"
            />
          </form>
          {suggestions.length > 0 && (
            <List
              bordered
              dataSource={suggestions}
              renderItem={(item) => (
                <List.Item onClick={() => handleSelectSuggestion(item)}>
                  {item.name}, {item.region}
                </List.Item>
              )}
            />
          )}
          {weatherData && weatherData.location && (
            <div>
              <Title level={3}>
                Weather Forecast for {weatherData.location.name}
              </Title>
              <div>
                Current Temperature:{" "}
                {isCelsius
                  ? weatherData.current.temp_c + " C"
                  : weatherData.current.temp_f + " F"}
              </div>
              <div>Wind Speed: {weatherData.current.wind_mph} mph</div>
              <div>Humidity: {weatherData.current.humidity}%</div>
              <Title level={4}>5-Day Forecast</Title>
              {weatherData.forecast.forecastday.map((day) => (
                <div key={day.date}>
                  <Title level={5}>{day.date}</Title>
                  <div>
                    Average Temperature:{" "}
                    {isCelsius
                      ? day.day.avgtemp_c + " C"
                      : day.day.avgtemp_f + " F"}
                  </div>
                  <div>Max Wind Speed: {day.day.maxwind_mph} mph</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};
export default Weather;
