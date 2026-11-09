# SkyCast — Weather Dashboard

A responsive weather dashboard built with **HTML5, CSS3, and vanilla JavaScript**. It uses the Fetch API and `async/await` to retrieve live weather information from Open-Meteo.

## Features
- Search weather by city name
- Current temperature, feels-like temperature, humidity, wind speed, and pressure
- Weather condition and icon
- Today's sunrise, sunset, UV index, and a short outlook
- Eight-hour forecast and five-day forecast
- Loading states and clear error messages for invalid cities/network/API errors
- Responsive layout for desktop, tablet, and mobile
- No API key required for non-commercial use

## Project files
- `index.html` — semantic page structure
- `style.css` — responsive dashboard styling
- `script.js` — geocoding, Fetch API calls, async/await, JSON processing, and rendering

## How to run
1. Extract the ZIP file.
2. Open the `weather-dashboard` folder.
3. Double-click `index.html` to open it in a browser.
4. Make sure you have an internet connection because weather data is fetched from the public API.

If your browser blocks requests when opening the file directly, open the folder in Visual Studio Code and use the **Live Server** extension.

## APIs used
- Open-Meteo Geocoding API: `https://geocoding-api.open-meteo.com/v1/search`
- Open-Meteo Forecast API: `https://api.open-meteo.com/v1/forecast`

The app first converts the city name into latitude/longitude using geocoding, then requests weather data for those coordinates. It reads nested JSON objects such as `current`, `hourly`, and `daily`.

## Concepts demonstrated
- `fetch()` and `response.json()`
- `async` / `await`
- `try` / `catch` / `finally`
- HTTP response validation with `response.ok`
- DOM selection and dynamic rendering
- Event listeners and form submission
- URLSearchParams and encodeURIComponent
- Array methods (`map`, `slice`, `find`)
