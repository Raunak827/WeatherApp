# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## Weather App with Advisory Layer

**Technology Used:** HTML, CSS, JavaScript  
**Project Type:** Frontend Web Development Project  
**Version:** 1.1  
**Prepared For:** College Academic Project

### Revision History

| Version | Change |
|---|---|
| 1.0 | Initial SRS: city search and current weather display. |
| 1.1 | Added the Advisory Layer (FR-12 to FR-14). Defined Phase 1 scope explicitly and moved forecast, geolocation, pressure and dynamic backgrounds to Phase 2 so the SRS and the synopsis agree. Added feels-like temperature to the data requirements. Updated architecture, use case, test cases, limitations and conclusion. |

---

## 1. Introduction

### 1.1 Purpose

The purpose of the **Weather App** is to give users a simple, responsive web application that shows current weather for a selected location **and turns that data into plain-language guidance** about what to do.

Most weather applications present raw numbers (temperature, humidity, wind speed) and leave the user to interpret them. This application keeps the same live data but adds an **Advisory Layer**: a set of transparent rules that convert the data into short, actionable messages such as "Feels-like temperature is very high: avoid going out between 12 and 4 PM."

The project demonstrates **HTML for structure, CSS for styling, and JavaScript for functionality, API integration and rule-based data interpretation**.

### 1.2 Scope

The Weather App is a frontend-based web application. The scope is divided into two phases.

**Phase 1 (this SRS):**

- Searching for weather information by city name.
- Displaying the current temperature and the feels-like temperature.
- Displaying weather conditions such as clear, cloudy, rain, etc.
- Displaying humidity.
- Displaying wind speed.
- Displaying minimum and maximum temperature where available.
- Displaying weather icons according to current conditions.
- **Generating and displaying advisory messages from the current weather data (Advisory Layer).**
- Handling invalid city searches, empty input and API failures.
- Providing a responsive interface for desktop and mobile devices.
- Fetching real-time weather information through a weather API.

**Phase 2 (out of scope for this SRS, planned later):**

- Multi-day and hourly forecasts.
- Current-location (geolocation) weather.
- Atmospheric pressure display.
- Dynamic background themes that change with conditions.
- Advisories based on forecast data and air quality (AQI).

### 1.3 Intended Users

The primary users are **students and daily commuters** who check the weather to decide what to wear, carry or avoid, rather than to read numbers.

Other users include:

- General users who want a quick weather check.
- Students demonstrating frontend development skills.
- Users accessing the application through desktop or mobile browsers.

### 1.4 Definitions and Abbreviations

| Term | Description |
|---|---|
| API | Application Programming Interface |
| UI | User Interface |
| UX | User Experience |
| HTML | HyperText Markup Language |
| CSS | Cascading Style Sheets |
| JS | JavaScript |
| SRS | Software Requirements Specification |
| API Key | Authentication key used to access a weather API |
| Advisory Layer | Rule-based component that converts weather data into plain-language guidance |
| Advisory Rule | A single condition-to-message mapping, e.g. feels-like temperature at or above a threshold produces a heat warning |
| Feels-like temperature | Apparent temperature that accounts for humidity and wind, as provided by the weather API |

---

# 2. Overall Description

## 2.1 Product Perspective

The Weather App is a standalone frontend web application. The user interacts with it through a web browser.

The basic working process is:

**User → Search City → JavaScript → Weather API → Weather Data → Advisory Layer → Web Interface**

HTML provides the structure, CSS provides the visual design, and JavaScript handles user interaction, API requests, data processing, advisory rule evaluation and dynamic content updates.

A graphical user flow of this process is provided in the accompanying diagram *Weather App User Flow* (`weather-app-user-flow.png`).

## 2.2 Product Functions

The system shall provide the following functions:

1. Display a weather application interface.
2. Allow users to enter a city name.
3. Provide a search button to initiate the search.
4. Send a request to the selected weather API.
5. Retrieve weather information for the requested location.
6. Display the retrieved weather information.
7. Display an appropriate weather icon.
8. **Evaluate advisory rules against the retrieved data and display the resulting advice.**
9. Display an appropriate message when the input is empty, the location is invalid, or the API is unavailable.
10. Provide a responsive layout.
11. Update the displayed information and advice whenever a new location is searched.

## 2.3 User Characteristics

The application is designed for users with basic knowledge of using a web browser. No technical knowledge is required.

## 2.4 Operating Environment

The application should operate on:

- Windows
- Linux
- macOS
- Android
- iOS

### Supported Browsers

- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari

The application requires an internet connection when fetching live weather data from an external API.

## 2.5 Assumptions and Dependencies

- The selected weather API provides, at minimum: temperature, feels-like (apparent) temperature, humidity, wind speed, weather condition, and city and country names.
- The API's units are known and converted to the units used by the advisory rules (for example, wind speed converted to km/h) before rules are evaluated.
- Advisory thresholds are fixed, documented values defined in Section 3 (FR-13). They are general-purpose guidance, not medical or safety advice.

---

# 3. Functional Requirements

## FR-01: Home Page

The system shall display a home page containing:

- Application name/logo
- Search input field
- Search button
- Weather information section
- Advisory section
- Appropriate background/design elements

## FR-02: City Search

The user shall be able to enter the name of a city in the search field.

Example:

**Input:** Delhi

After clicking the search button, the application shall request weather information for Delhi.

## FR-03: Weather Data Retrieval

The JavaScript application shall send a request to a weather API using the selected city.

The API response shall contain relevant weather information.

## FR-04: Current Temperature

The application shall display the current temperature and the feels-like temperature of the selected location.

Example:

**32°C (feels like 38°C)**

## FR-05: Weather Condition

The application shall display the current weather condition.

Examples:

- Clear
- Cloudy
- Rain
- Thunderstorm
- Mist
- Snow

## FR-06: Humidity

The application shall display the humidity percentage.

Example:

**Humidity: 65%**

## FR-07: Wind Speed

The application shall display the current wind speed.

Example:

**Wind Speed: 12 km/h**

## FR-08: Weather Icon

The application shall display a suitable weather icon based on the weather condition.

For example:

- ☀️ Clear
- ☁️ Cloudy
- 🌧️ Rain
- ⛈️ Thunderstorm

## FR-09: Error Handling

If the user enters an invalid or unavailable location, the system shall display an appropriate error message and return the user to the search input.

Example:

**"City not found. Please enter a valid city name."**

If the API request fails, the system shall display a suitable message instead of leaving the weather section blank.

## FR-10: Empty Input Validation

If the user clicks the search button without entering a city name, the application shall ask the user to enter a location and shall not send an API request.

Example:

**"Please enter a city name."**

## FR-11: Responsive Interface

The application shall automatically adjust its layout according to the screen size.

The application should be usable on:

- Desktop
- Laptop
- Tablet
- Smartphone

## FR-12: Advisory Generation

After weather data is successfully retrieved, the application shall evaluate every advisory rule in the rule table (FR-13) against the data and shall produce a list of the advisories whose conditions are met.

- Rules shall be evaluated using the units stated in the rule table.
- If more than one rule matches, all matching advisories shall be shown, ordered by priority (1 is highest).
- If a rule needs a data field that the API did not return, that rule shall be skipped without causing an error and without showing an incorrect advisory.

## FR-13: Advisory Rule Table

The advisory rules shall be defined in a single, separate data structure in the code (for example, an array of rule objects) rather than being scattered through the logic, so that thresholds and messages can be reviewed and changed in one place.

The Phase 1 rules are:

| ID | Priority | Condition (input data) | Advisory message |
|---|---|---|---|
| ADV-01 | 1 | Condition is thunderstorm | "Thunderstorm: stay indoors if possible." |
| ADV-02 | 2 | Feels-like temperature ≥ 40 °C | "Very high heat: avoid going out between 12 and 4 PM and drink water regularly." |
| ADV-03 | 3 | Wind speed ≥ 40 km/h | "Strong wind: take care on two-wheelers and avoid open areas." |
| ADV-04 | 4 | Condition is rain or drizzle | "Rain expected: carry an umbrella or raincoat." |
| ADV-05 | 5 | Humidity ≥ 80 % | "High humidity: clothes will not dry outdoors." |
| ADV-06 | 6 | Condition is mist or fog | "Low visibility: take extra care while travelling." |
| ADV-07 | 7 | Feels-like temperature ≤ 10 °C | "Cold: wear warm layers." |

**Note:** The thresholds above are illustrative starting values for the project. They shall be reviewed and finalized before the final demonstration, and the source or reasoning for each final threshold shall be documented.

## FR-14: Advisory Display

The application shall display the generated advisories in a dedicated section of the weather card, separate from the raw weather data.

- If at least one advisory applies, each shall be shown as a short, readable message.
- If no rule applies, the application shall show a neutral message such as "No special precautions needed right now."
- Advisories shall be cleared and recalculated whenever a new city is searched.
- If a search fails (FR-09, FR-10), no advisory from a previous search shall remain visible.

---

# 4. Non-Functional Requirements

## 4.1 Usability

The application should have a simple and intuitive interface.

Users should be able to search for weather information and understand the advice without requiring instructions.

## 4.2 Performance

The application should load quickly and should display weather information and advisories as soon as the API response is received.

Advisory evaluation shall be performed on the client and shall add no noticeable delay.

Unnecessary animations and large resources should be avoided to maintain good performance.

## 4.3 Reliability

The application should handle common errors such as:

- Invalid city name
- Empty search field
- Network failure
- API failure
- Invalid API response
- Missing data fields in an otherwise valid response

## 4.4 Security

The application should not store unnecessary personal information.

If an API key is required, it should not be unnecessarily exposed in a production application. For an academic frontend demonstration, appropriate precautions should be taken according to the API provider's requirements.

## 4.5 Maintainability

HTML, CSS, and JavaScript should preferably be maintained in separate files. The advisory rules should be kept in their own data structure or file so they can be changed without editing the display logic.

Suggested structure:

```text
weather-app/
│
├── index.html
├── style.css
├── script.js
├── advisory-rules.js
└── assets/
    └── icons/
```

The code should use meaningful variable and function names and should contain comments where necessary.

## 4.6 Compatibility

The application should work correctly on modern versions of commonly used web browsers.

## 4.7 Transparency of Advice

Every advisory shall be traceable to a specific rule (by ID) in the rule table, so that it is possible to explain why any given message was shown.

---

# 5. User Interface Requirements

The interface should contain the following major components:

### 5.1 Header

The header should contain the application name, such as:

**Weather App**

### 5.2 Search Section

The search section should contain:

- Text input
- Search button

Example:

```text
[ Enter city name        ] [ Search ]
```

### 5.3 Weather Information Card

The weather card should display:

- City name
- Country
- Temperature and feels-like temperature
- Weather condition
- Weather icon
- Humidity
- Wind speed
- Minimum and maximum temperature where available

Example:

```text
Delhi, India

       ☀️
      32°C  (feels like 38°C)
      Clear

Humidity: 45%
Wind: 14 km/h
```

### 5.4 Advisory Section

The advisory section shall appear within or directly below the weather card and shall be visually distinct from the raw data (for example, a highlighted panel).

Example:

```text
ADVICE
• Very high heat: avoid going out between 12 and 4 PM
  and drink water regularly.
• High humidity: clothes will not dry outdoors.
```

### 5.5 Error Message

Errors should be displayed clearly without disrupting the rest of the interface.

---

# 6. System Architecture

The application follows a simple frontend architecture:

```text
                ┌───────────────────┐
                │       User        │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │   HTML Interface  │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │   JavaScript      │
                │  Event Handling   │
                │  + Validation     │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │   Weather API     │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │   JSON Response   │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │ JavaScript Data   │
                │ Processing + Unit │
                │   Normalization   │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │  Advisory Layer   │
                │ (rule evaluation) │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │ Weather + Advice  │
                │      Display      │
                └───────────────────┘
```

---

# 7. External Interface Requirements

## 7.1 User Interface

The application shall provide a graphical user interface accessible through a web browser.

The design should use:

- Clear typography
- Appropriate colors
- Weather-related icons
- Responsive cards
- A visually distinct advisory panel
- Buttons and input fields
- Proper spacing and alignment

## 7.2 Software Interface

The application may communicate with a third-party weather API to retrieve live weather information.

The API response will generally be received in **JSON format** and processed using JavaScript.

## 7.3 Hardware Interface

No special hardware is required.

The application can run on any device capable of running a modern web browser.

---

# 8. Data Requirements

The application may use the following weather data:

| Data | Description |
|---|---|
| City | Name of selected location |
| Country | Country of selected location |
| Temperature | Current temperature |
| Feels-like Temperature | Apparent temperature, used by the heat and cold advisories |
| Weather Condition | Current weather status, used by the thunderstorm, rain and mist advisories |
| Humidity | Percentage of moisture in air, used by the humidity advisory |
| Wind Speed | Current wind speed (normalized to km/h), used by the wind advisory |
| Weather Icon | Visual representation of weather |
| Min Temperature | Minimum temperature |
| Max Temperature | Maximum temperature |

The application does not need to permanently store user data for the basic version.

---

# 9. Use Case

## Use Case: Search Weather and View Advice

**Actor:** User

**Precondition:** The Weather App is open in a web browser.

**Steps:**

1. User opens the Weather App.
2. User enters a city name.
3. User clicks the Search button.
4. JavaScript validates the input.
5. The application sends a request to the weather API.
6. The API returns weather information.
7. JavaScript processes the response and normalizes units.
8. The Advisory Layer evaluates the rule table against the data.
9. Weather information and the matching advisories are displayed on the screen.
10. The user may search for another city, which restarts from step 2.

**Alternative Flow:**

If the city does not exist or the API fails, the application displays:

**"City not found. Please enter a valid city name."** (or a suitable API error message) and returns the user to the search input.

If the input is empty, the application displays:

**"Please enter a city name."** and does not send a request.

**Postcondition:** The latest available weather information and the matching advice for the requested location are displayed.

---

# 10. Testing Requirements

The following test cases should be performed:

| Test Case | Input | Expected Result |
|---|---|---|
| TC-01 | Valid city | Weather information displayed |
| TC-02 | Invalid city | Error message displayed |
| TC-03 | Empty input | Validation message displayed, no API request sent |
| TC-04 | City with spaces | Correct weather information displayed |
| TC-05 | API unavailable | Appropriate error displayed |
| TC-06 | Mobile screen | Responsive layout displayed |
| TC-07 | Desktop screen | Correct desktop layout displayed |
| TC-08 | Feels-like temperature of 41 °C | ADV-02 heat advisory displayed |
| TC-09 | Feels-like temperature of exactly 40 °C | ADV-02 displayed (boundary, "≥" is inclusive) |
| TC-10 | Data matching several rules (e.g. rain + humidity 85 %) | All matching advisories displayed, in priority order |
| TC-11 | Mild, clear weather matching no rule | Neutral "No special precautions" message displayed |
| TC-12 | API response missing the feels-like field | Heat and cold rules skipped, other rules still work, no error |
| TC-13 | Wind speed returned in m/s by the API | Value converted to km/h before ADV-03 is evaluated |
| TC-14 | Successful search followed by a failed search | Previous weather and advisories no longer shown |

---

# 11. Future Enhancements (Phase 2)

The following features are planned for later versions:

- Current location/weather detection (geolocation).
- 5-day or 7-day weather forecast.
- Hourly weather forecast and advisories based on upcoming conditions (e.g. "rain expected at 4 PM").
- Atmospheric pressure display.
- Dynamic background themes and animated weather backgrounds.
- Sunrise and sunset information.
- Air Quality Index (AQI) and AQI-based advisories.
- Temperature unit conversion between Celsius and Fahrenheit.
- Dark mode.
- Weather search history.
- Favorite locations.
- Weather alerts and notifications.
- User-adjustable advisory thresholds.

---

# 12. Limitations

The basic version of the application has the following limitations:

- Live weather data depends on the availability of the weather API.
- Internet access is required to retrieve live weather information.
- API usage may be limited according to the selected service.
- Weather information depends on the accuracy and update frequency of the API provider.
- Advisories are based on current conditions only, not on the forecast.
- Advisory thresholds are general-purpose values, are the same for every user, and do not account for individual health or circumstances. The advice is informational and is not medical or emergency guidance.
- The application does not permanently store weather data in the basic version.

---

# 13. Conclusion

The Weather App is a frontend web application that demonstrates practical knowledge of **HTML, CSS, and JavaScript**.

It lets users search for a location, view current weather conditions, and receive short, rule-based advice on what to do with that information. The Advisory Layer is the distinguishing feature: the weather data comes from a standard API, and the contribution of this project is the transparent interpretation of that data into guidance a user can act on.

The project demonstrates important frontend concepts including user input handling, API integration, JSON data processing, unit normalization, rule-based logic, dynamic DOM manipulation, error handling, responsive design and interactive user interfaces.

Phase 2 can extend it with forecasts, geolocation, AQI, dynamic backgrounds and user-adjustable thresholds.
