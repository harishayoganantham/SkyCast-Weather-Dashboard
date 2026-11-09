const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const statusMessage = document.getElementById("statusMessage");
const weatherContent = document.getElementById("weatherContent");

const weatherDescriptions = {
  0: ["Clear sky", "☀️"], 1: ["Mainly clear", "🌤️"], 2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"], 45: ["Foggy", "🌫️"], 48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"], 53: ["Moderate drizzle", "🌦️"], 55: ["Dense drizzle", "🌧️"],
  56: ["Light freezing drizzle", "🌧️"], 57: ["Dense freezing drizzle", "🌧️"],
  61: ["Slight rain", "🌦️"], 63: ["Moderate rain", "🌧️"], 65: ["Heavy rain", "🌧️"],
  66: ["Light freezing rain", "🌧️"], 67: ["Heavy freezing rain", "🌧️"],
  71: ["Slight snow", "🌨️"], 73: ["Moderate snow", "🌨️"], 75: ["Heavy snow", "❄️"],
  77: ["Snow grains", "❄️"], 80: ["Slight rain showers", "🌦️"],
  81: ["Moderate rain showers", "🌧️"], 82: ["Violent rain showers", "⛈️"],
  85: ["Slight snow showers", "🌨️"], 86: ["Heavy snow showers", "❄️"],
  95: ["Thunderstorm", "⛈️"], 96: ["Thunderstorm with hail", "⛈️"], 99: ["Thunderstorm with heavy hail", "⛈️"]
};

function describeWeather(code) {
  return weatherDescriptions[code] || ["Conditions unavailable", "🌡️"];
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
  statusMessage.hidden = false;
}

function formatTime(isoString) {
  if (!isoString) return "--:--";
  return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDay(dateString, index) {
  if (index === 0) return "Today";
  return new Date(`${dateString}T12:00:00`).toLocaleDateString([], { weekday: "short" });
}

function uvDescription(value) {
  if (value < 3) return "Low UV";
  if (value < 6) return "Moderate UV";
  if (value < 8) return "High UV";
  if (value < 11) return "Very high UV";
  return "Extreme UV";
}

function outlookFor(current, daily) {
  const [description] = describeWeather(current.weather_code);
  const high = Math.round(daily.temperature_2m_max[0]);
  const low = Math.round(daily.temperature_2m_min[0]);
  const rainChance = daily.precipitation_probability_max?.[0] ?? 0;
  let advice = "A pleasant time to get outside.";
  if (rainChance >= 50) advice = "Keep an umbrella handy — rain is possible today.";
  else if (current.temperature_2m >= 32) advice = "It's warm outside. Stay hydrated and seek some shade.";
  else if (current.temperature_2m <= 12) advice = "It's chilly. A light extra layer may be useful.";
  else if (current.wind_speed_10m >= 30) advice = "It's breezy today. Be mindful of stronger winds.";
  return `${description} today, with a high of ${high}° and a low of ${low}°. ${advice}`;
}

function renderHourly(hourly, currentTime) {
  const container = document.getElementById("hourlyForecast");
  const currentHour = new Date(currentTime).getHours();
  const startIndex = hourly.time.findIndex(time => new Date(time).getHours() >= currentHour);
  const safeStart = Math.max(0, startIndex);
  const items = hourly.time.slice(safeStart, safeStart + 8);
  container.innerHTML = items.map((time, offset) => {
    const index = safeStart + offset;
    const [description, icon] = describeWeather(hourly.weather_code[index]);
    const label = offset === 0 ? "Now" : formatTime(time);
    return `<article class="hour-card" title="${description}">
      <span class="hour-time">${label}</span>
      <span class="hour-icon" aria-hidden="true">${icon}</span>
      <strong>${Math.round(hourly.temperature_2m[index])}°</strong>
      <small>${Math.round(hourly.precipitation_probability[index] ?? 0)}% rain</small>
    </article>`;
  }).join("");
}

function renderDaily(daily) {
  const container = document.getElementById("dailyForecast");
  container.innerHTML = daily.time.slice(0, 5).map((date, index) => {
    const [description, icon] = describeWeather(daily.weather_code[index]);
    return `<article class="day-card" title="${description}">
      <span class="day-name">${formatDay(date, index)}</span>
      <span class="day-icon" aria-hidden="true">${icon}</span>
      <span class="day-temps">${Math.round(daily.temperature_2m_max[index])}° <span>${Math.round(daily.temperature_2m_min[index])}°</span></span>
    </article>`;
  }).join("");
}

function renderWeather(place, data) {
  const current = data.current;
  const daily = data.daily;
  const [condition, icon] = describeWeather(current.weather_code);
  const area = [place.admin1, place.country].filter(Boolean).join(", ");

  document.getElementById("cityName").textContent = place.name;
  document.getElementById("locationMeta").textContent = area || "Selected location";
  document.getElementById("temperature").textContent = Math.round(current.temperature_2m);
  document.getElementById("condition").textContent = condition;
  document.getElementById("feelsLike").textContent = `Feels like ${Math.round(current.apparent_temperature)}°C`;
  document.getElementById("weatherArt").textContent = icon;
  document.getElementById("humidity").textContent = `${Math.round(current.relative_humidity_2m)}%`;
  document.getElementById("wind").innerHTML = `${Math.round(current.wind_speed_10m)} <small>km/h</small>`;
  document.getElementById("pressure").innerHTML = `${Math.round(current.surface_pressure)} <small>hPa</small>`;
  const uv = daily.uv_index_max?.[0];
  document.getElementById("uvIndex").textContent = Number.isFinite(uv) ? uv.toFixed(1) : "—";
  document.getElementById("uvLabel").textContent = Number.isFinite(uv) ? uvDescription(uv) : "Today's maximum";
  document.getElementById("outlookText").textContent = outlookFor(current, daily);
  document.getElementById("sunrise").textContent = formatTime(daily.sunrise?.[0]);
  document.getElementById("sunset").textContent = formatTime(daily.sunset?.[0]);
  document.getElementById("updatedAt").textContent = `Updated ${formatTime(current.time)} · Local time`;
  renderHourly(data.hourly, current.time);
  renderDaily(daily);

  weatherContent.hidden = false;
  statusMessage.hidden = true;
}

async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Unable to search for that city. Please try again.");
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`No matching city found for "${city}". Check the spelling and try again.`);
  }
  return data.results[0];
}

async function getWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude, longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,surface_pressure",
    hourly: "temperature_2m,precipitation_probability,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "5"
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error("Weather data could not be loaded. Please try again later.");
  return response.json();
}

async function searchWeather(city) {
  const trimmedCity = city.trim();
  if (!trimmedCity) {
    setStatus("Please enter a city name.", true);
    return;
  }

  searchButton.disabled = true;
  searchButton.textContent = "Loading...";
  setStatus(`Finding the latest weather for ${trimmedCity}...`);
  weatherContent.hidden = true;

  try {
    const place = await getCoordinates(trimmedCity);
    const weather = await getWeather(place.latitude, place.longitude);
    renderWeather(place, weather);
    cityInput.value = place.name;
  } catch (error) {
    setStatus(error.message || "Something went wrong. Please check your connection and try again.", true);
  } finally {
    searchButton.disabled = false;
    searchButton.innerHTML = 'Search <span aria-hidden="true">→</span>';
  }
}

searchForm.addEventListener("submit", event => {
  event.preventDefault();
  searchWeather(cityInput.value);
});

document.querySelectorAll(".city-chip").forEach(button => {
  button.addEventListener("click", () => searchWeather(button.dataset.city));
});

// Load a sample city on first visit so the dashboard is populated immediately.
searchWeather("Madurai");
