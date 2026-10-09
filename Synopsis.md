# Synopsis: Weather App with Advisory Layer

The Weather App is a user-friendly web application that provides real-time weather information for any city and converts it into plain-language guidance. Most weather applications display raw numbers such as temperature, humidity and wind speed, and leave users to work out what those numbers mean for their day. This project keeps the standard live data and adds an **Advisory Layer**: a set of transparent rules that turn the data into short, actionable messages, for example "Very high heat: avoid going out between 12 and 4 PM" or "Rain expected: carry an umbrella."

The application retrieves current weather data from a weather API and displays temperature, feels-like temperature, weather condition, humidity and wind speed, along with a matching weather icon. The Advisory Layer then evaluates the data against a documented rule table and shows the relevant advice in a dedicated section. Users search by entering a city name, and the interface handles empty input, invalid cities and API failures with clear messages.

The system is built as a frontend web application using HTML, CSS and JavaScript, and integrates an external weather API to ensure up-to-date information. It emphasizes responsiveness, simplicity and ease of use, and is intended mainly for students and daily commuters who check the weather to decide what to wear, carry or avoid.

## Problem Statement

Weather apps present data, but users need decisions. Reading "32°C, 80% humidity, 14 km/h wind" requires the user to interpret it, and critical conditions such as high feels-like temperature are easy to overlook. This project addresses that gap by interpreting the data for the user.

## Objectives

- To provide real-time weather information for any searched city.
- To display current conditions: temperature, feels-like temperature, humidity, wind speed and weather condition.
- To convert weather data into clear, rule-based advice that helps users make everyday decisions.
- To keep every piece of advice traceable to a specific, documented rule.
- To offer a simple, responsive interface that works on desktop and mobile devices.
- To handle errors gracefully (empty input, invalid city, network or API failure).

## Key Features (Phase 1)

- Real-time weather updates by city name
- Temperature and feels-like temperature, humidity, wind speed and condition
- Weather icons matched to current conditions
- **Advisory Layer:** rule-based advice for heat, cold, wind, rain, humidity, thunderstorm and low visibility
- Input validation and clear error messages
- Responsive design for desktop and mobile devices

## Planned Enhancements (Phase 2)

- Multi-day and hourly forecasts, with advisories based on upcoming conditions
- Current-location (geolocation) weather
- Atmospheric pressure display
- Dynamic background themes that change with weather conditions
- Air Quality Index (AQI) and AQI-based advisories
- Dark mode, temperature unit conversion, search history and favorite locations

## Technology Used

HTML, CSS and JavaScript, with a third-party weather API for live data.

## Expected Outcome

A working frontend application in which a user can search for a city and immediately see both the current weather and clear guidance on what to do about it. The project demonstrates API integration, JSON processing, rule-based logic, DOM manipulation, error handling and responsive design.
