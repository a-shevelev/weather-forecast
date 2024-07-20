import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// Описание типов погоды и соответствующие иконки
const weatherDescriptions = {
  0: "Чистое небо 🌞",
  1: "Преимущественно ясно 🌤️",
  2: "Переменная облачность 🌥️",
  3: "Пасмурно ☁️",
  45: "Туман 🌫️",
  48: "Осадочный туман 🌫️",
  51: "Моросящий дождь (легкий) 🌦️",
  53: "Моросящий дождь (умеренный) 🌦️",
  55: "Моросящий дождь (плотный) 🌧️",
  56: "Ледяной дождь (легкая интенсивность) 🌨️",
  57: "Ледяной дождь (плотная интенсивность) 🌨️",
  61: "Дождь (легкий) 🌦️",
  63: "Дождь (умеренный) 🌧️",
  65: "Дождь (сильный) 🌧️",
  66: "Ледяной дождь (легкая интенсивность) 🌨️",
  67: "Ледяной дождь (сильная интенсивность) 🌨️",
  71: "Снегопад (легкий) 🌨️",
  73: "Снегопад (умеренный) 🌨️",
  75: "Снегопад (сильный) 🌨️",
  77: "Снежные зерна 🌨️",
  80: "Ливневые дожди (слабые) 🌦️",
  81: "Ливневые дожди (умеренные) 🌧️",
  82: "Ливневые дожди (сильные) 🌧️",
  85: "Небольшие снегопады 🌨️",
  86: "Сильные снегопады 🌨️",
  95: "Гроза (слабая или умеренная) ⛈️",
  96: "Гроза с мелким градом ⛈️",
  99: "Гроза с сильным градом ⛈️",
};

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(false);

  const geoNamesApiKey = process.env.REACT_APP_GEONAMES_API_KEY; // Замените на ваш API-ключ GeoNames

  const getWeather = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/api/weather?city=${city}`
      );
      setWeather(response.data);
      setError(null);
    } catch (err) {
      setWeather(null);
      setError(err.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `http://api.geonames.org/searchJSON?name=${query}&maxRows=3&lang=ru&featureClass=P&username=${geoNamesApiKey}`
      );
      const data = await response.json();
      console.log(data);
      setSuggestions(
        data.geonames.map((city) => ({
          name: city.name,
          country: city.countryName,
          id: city.geonameId,
        }))
      );
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    if (city.length > 1) {
      fetchSuggestions(city);
    } else {
      setSuggestions([]);
    }
  }, [city]);

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion.name);
    setSelectedCity(suggestion.id);
    setSuggestions([]);
    getWeather(); // Получаем погоду для выбранного города
  };

  return (
    <div className="App">
      <h1>Прогноз погоды</h1>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Название города"
        />

        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                {suggestion.name}, {suggestion.country}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p>{error}</p>}

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        weather && (
          <div>
            <h2>{city}</h2>

            <div className="card">
              <h3>Сейчас</h3>
              <p>{weather.current.temperature_2m}°C</p>
              <p>{weatherDescriptions[weather.current.weathercode]}</p>
            </div>

            <h3>Прогноз на ближайшие 24 часа</h3>
            <div className="card-container horizontal-scroll">
              {weather.hourly.time.map((time, index) => (
                <div className="card" key={index}>
                  <p>
                    {new Date(time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p>{weather.hourly.temperature_2m[index]}°C</p>
                  <p>
                    {weatherDescriptions[weather.hourly.weathercode[index]]}
                  </p>
                </div>
              ))}
            </div>

            <h3>Прогноз погоды на 7 дней</h3>
            <div className="card-container">
              {weather.daily.time.map((day, index) => (
                <div className="card" key={index}>
                  <p>{new Date(day).toLocaleDateString()}</p>
                  <p>Днём: {weather.daily.temperature_2m_max[index]}°C</p>
                  <p>Ночью: {weather.daily.temperature_2m_min[index]}°C</p>
                  <p>{weatherDescriptions[weather.daily.weathercode[index]]}</p>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default App;
