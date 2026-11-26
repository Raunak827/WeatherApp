/**
 * script.js  — Wheather App (Phase 1 + Phase 2 enhancements)
 * ────────────────────────────────────────────────────────────
 * Responsibilities
 * ─────────────────
 * 1. City search + geolocation (FR-02, FR-03)
 * 2. API fetch + unit normalisation (FR-03, FR-04…FR-08, TC-13)
 * 3. Advisory evaluation and display (FR-12, FR-13, FR-14)
 * 4. Error & empty-input handling (FR-09, FR-10)
 * 5. Temperature unit toggle °C ↔ °F
 * 6. Dark / light theme toggle
 * 7. Search history (last 5 cities, stored in localStorage)
 * 8. Favourite cities (stored in localStorage)
 * 9. Dynamic background themes per weather condition
 * 10. Loading skeleton & smooth transitions
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════ */

/**
 * API key is loaded from config.js (gitignored).
 * See config.example.js for setup instructions.
 */
const API_KEY = (window.APP_CONFIG && window.APP_CONFIG.API_KEY) || '';
const API_BASE = 'https://api.openweathermap.org/data/2.5/weather';
const GEO_BASE = 'https://api.openweathermap.org/geo/1.0/reverse';

/** Maximum search-history entries to store. */
const MAX_HISTORY = 5;

/* ═══════════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════════ */

/** Cached raw API data (Celsius-based) for unit conversions. */
let _rawData = null;

/** Current display unit: 'C' | 'F' */
let _unit = localStorage.getItem('unit') || 'C';

/** Current theme: 'light' | 'dark' */
let _theme = localStorage.getItem('theme') || 'light';

/* ═══════════════════════════════════════════════════════════════
   DOM REFERENCES
   ═══════════════════════════════════════════════════════════════ */

const $ = (id) => document.getElementById(id);

const cityInput      = $('city-input');
const searchBtn      = $('search-btn');
const locationBtn    = $('location-btn');
const clearBtn       = $('clear-btn');
const unitToggle     = $('unit-toggle');
const unitLabel      = $('unit-label');
const themeToggle    = $('theme-toggle');
const themeIcon      = $('theme-icon');
const errorBanner    = $('error-banner');
const errorMessage   = $('error-message');
const skeletonCard   = $('skeleton-card');
const weatherCard    = $('weather-card');
const locationEl     = $('location');
const localTimeEl    = $('local-time');
const weatherIconEl  = $('weather-icon');
const temperatureEl  = $('temperature');
const feelsLikeEl    = $('feels-like');
const conditionEl    = $('condition');
const humidityEl     = $('humidity');
const windSpeedEl    = $('wind-speed');
const tempMinMaxEl   = $('temp-min-max');
const visibilityEl   = $('visibility');
const advisoryList   = $('advisory-list');
const lastUpdatedEl  = $('last-updated');
const favBtn         = $('fav-btn');
const favouritesRow  = $('favourites-row');
const favChips       = $('fav-chips');
const bgLayer        = $('bg-layer');
const emptyState     = $('empty-state');
const menuBtn        = $('menu-btn');
const recentDrawer   = $('recent-drawer');
const drawerBackdrop = $('drawer-backdrop');
const drawerCloseBtn = $('drawer-close-btn');
const drawerList     = $('drawer-history-list');
const drawerEmpty    = $('drawer-empty');
const drawerFooter   = $('drawer-footer');
const drawerClearBtn = $('drawer-clear-btn');

/* ═══════════════════════════════════════════════════════════════
   UNIT HELPERS
   ═══════════════════════════════════════════════════════════════ */

const toF        = (c) => +(c * 9 / 5 + 32).toFixed(1);
const displayTemp= (c) => _unit === 'C' ? `${Math.round(c)}°C` : `${Math.round(toF(c))}°F`;
const speedLabel = (kmh) => _unit === 'C' ? `${Math.round(kmh)} km/h` : `${Math.round(kmh * 0.621371)} mph`;

/* ═══════════════════════════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════════════════════════ */

function applyTheme(theme) {
  _theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
}

themeToggle.addEventListener('click', () => {
  applyTheme(_theme === 'dark' ? 'light' : 'dark');
});

/* ═══════════════════════════════════════════════════════════════
   UNIT TOGGLE
   ═══════════════════════════════════════════════════════════════ */

function applyUnit(unit) {
  _unit = unit;
  unitLabel.textContent = `°${unit}`;
  localStorage.setItem('unit', unit);
  if (_rawData) renderWeather(_rawData);   // re-render with new unit
  renderHistory();                         // update drawer & chip temps
}

unitToggle.addEventListener('click', () => {
  applyUnit(_unit === 'C' ? 'F' : 'C');
});

/* ═══════════════════════════════════════════════════════════════
   DYNAMIC BACKGROUND
   ═══════════════════════════════════════════════════════════════ */

const BG_THEMES = {
  thunderstorm : ['#1a1a2e', '#16213e', '#0f3460'],
  rain         : ['#2c3e50', '#34495e', '#546e7a'],
  drizzle      : ['#37474f', '#455a64', '#546e7a'],
  snow         : ['#b0bec5', '#cfd8dc', '#eceff1'],
  mist         : ['#607d8b', '#78909c', '#90a4ae'],
  fog          : ['#546e7a', '#607d8b', '#78909c'],
  atmosphere   : ['#5c6bc0', '#7986cb', '#9fa8da'],
  clear        : ['#f7971e', '#ffd200', '#56ab2f'],
  clouds       : ['#4facfe', '#00f2fe', '#a1c4fd'],
  default      : ['#74ebd5', '#acb6e5', '#c3cfe2'],
};

function applyBackground(conditionGroup) {
  const colors = BG_THEMES[conditionGroup] ?? BG_THEMES.default;
  bgLayer.style.setProperty('--orb1', colors[0]);
  bgLayer.style.setProperty('--orb2', colors[1]);
  bgLayer.style.setProperty('--orb3', colors[2]);
  bgLayer.className = `bg-layer bg-layer--${conditionGroup ?? 'default'}`;
}

/* ═══════════════════════════════════════════════════════════════
   LOCAL TIME HELPER
   ═══════════════════════════════════════════════════════════════ */

function getLocalTime(timezoneOffsetSeconds) {
  const utcMs  = Date.now() + new Date().getTimezoneOffset() * 60000;
  const localMs = utcMs + timezoneOffsetSeconds * 1000;
  const d = new Date(localMs);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
         ', ' + d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
}

/* ═══════════════════════════════════════════════════════════════
   UI STATE HELPERS
   ═══════════════════════════════════════════════════════════════ */

function showError(msg) {
  weatherCard.hidden   = true;
  skeletonCard.hidden  = true;
  if (emptyState && !_rawData) emptyState.hidden = false;
  errorMessage.textContent = msg;
  errorBanner.hidden   = false;
  errorBanner.classList.add('banner--shake');
  setTimeout(() => errorBanner.classList.remove('banner--shake'), 400);
}

function hideError() {
  errorBanner.hidden = true;
  errorMessage.textContent = '';
}

function setLoading(loading) {
  if (loading) {
    hideError();
    weatherCard.hidden  = true;
    if (emptyState) emptyState.hidden = true;
    skeletonCard.hidden = false;
    searchBtn.classList.add('loading');
    searchBtn.disabled = true;
  } else {
    skeletonCard.hidden = true;
    searchBtn.classList.remove('loading');
    searchBtn.disabled = false;
  }
}

/* ═══════════════════════════════════════════════════════════════
   CLEAR INPUT BUTTON
   ═══════════════════════════════════════════════════════════════ */

cityInput.addEventListener('input', () => {
  clearBtn.hidden = cityInput.value.length === 0;
});

clearBtn.addEventListener('click', () => {
  cityInput.value = '';
  clearBtn.hidden = true;
  cityInput.focus();
});

/* ═══════════════════════════════════════════════════════════════
   SEARCH HISTORY & RECENT SEARCHES MENU DRAWER
   ═══════════════════════════════════════════════════════════════ */

function getHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem('history') || '[]');
    // Normalise legacy string entries if any exist
    return raw.map((item) =>
      typeof item === 'string'
        ? { name: item, country: '', tempC: null, climate: '', icon: '🌍' }
        : item
    );
  } catch {
    return [];
  }
}

function saveHistory(data) {
  const conditionId    = data.weather?.[0]?.id ?? 800;
  const conditionGroup = getConditionGroup(conditionId);
  const entry = {
    name    : data.name,
    country : data.sys?.country ?? '',
    tempC   : data.main?.temp ?? null,
    climate : data.weather?.[0]?.description ?? '',
    icon    : getConditionEmoji(conditionGroup, conditionId),
  };

  let hist = getHistory().filter(
    (item) => item.name.toLowerCase() !== entry.name.toLowerCase()
  );
  hist.unshift(entry);
  if (hist.length > MAX_HISTORY) hist = hist.slice(0, MAX_HISTORY);
  localStorage.setItem('history', JSON.stringify(hist));
  renderHistory();
}

function renderHistory() {
  const hist = getHistory();

  // Top-left 3-line menu drawer list
  drawerList.innerHTML = '';
  if (hist.length === 0) {
    drawerEmpty.hidden  = false;
    drawerFooter.hidden = true;
    return;
  }

  drawerEmpty.hidden  = true;
  drawerFooter.hidden = false;

  hist.forEach((item) => {
    const li  = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'drawer-item';
    const locationLabel = item.country ? `${item.name}, ${item.country}` : item.name;
    const tempLabel     = item.tempC !== null ? displayTemp(item.tempC) : '—';
    const climateLabel  = item.climate || 'Weather saved';

    btn.setAttribute('aria-label', `Load weather for ${locationLabel}`);
    btn.innerHTML = `
      <div class="drawer-item__left">
        <span class="drawer-item__icon" aria-hidden="true">${item.icon || '🌤️'}</span>
        <div class="drawer-item__info">
          <span class="drawer-item__city">${locationLabel}</span>
          <span class="drawer-item__climate">${climateLabel}</span>
        </div>
      </div>
      <span class="drawer-item__temp">${tempLabel}</span>
    `;

    btn.addEventListener('click', () => {
      closeDrawer();
      fetchWeatherByCity(item.name);
    });

    li.appendChild(btn);
    drawerList.appendChild(li);
  });
}

function clearHistory() {
  localStorage.removeItem('history');
  renderHistory();
}

drawerClearBtn.addEventListener('click', clearHistory);

function openDrawer() {
  renderHistory();
  recentDrawer.hidden   = false;
  drawerBackdrop.hidden = false;
  // Trigger CSS transition on next frame
  requestAnimationFrame(() => {
    recentDrawer.classList.add('open');
    drawerBackdrop.classList.add('open');
  });
  menuBtn.setAttribute('aria-expanded', 'true');
  drawerCloseBtn.focus();
}

function closeDrawer() {
  recentDrawer.classList.remove('open');
  drawerBackdrop.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  setTimeout(() => {
    if (!recentDrawer.classList.contains('open')) {
      recentDrawer.hidden   = true;
      drawerBackdrop.hidden = true;
    }
  }, 280);
}

menuBtn.addEventListener('click', () => {
  const isOpen = recentDrawer.classList.contains('open');
  if (isOpen) closeDrawer();
  else openDrawer();
});

drawerCloseBtn.addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && recentDrawer.classList.contains('open')) {
    closeDrawer();
    menuBtn.focus();
  }
});

/* ═══════════════════════════════════════════════════════════════
   FAVOURITE CITIES
   ═══════════════════════════════════════════════════════════════ */

function getFavourites() {
  try { return JSON.parse(localStorage.getItem('favourites') || '[]'); }
  catch { return []; }
}

function isFavourite(city) {
  return getFavourites().some((c) => c.toLowerCase() === city.toLowerCase());
}

function toggleFavourite(city) {
  let favs = getFavourites();
  if (isFavourite(city)) {
    favs = favs.filter((c) => c.toLowerCase() !== city.toLowerCase());
  } else {
    favs.unshift(city);
  }
  localStorage.setItem('favourites', JSON.stringify(favs));
  renderFavourites();
  updateFavBtn(city);
}

function updateFavBtn(city) {
  const fav = isFavourite(city);
  favBtn.textContent = fav ? '⭐' : '☆';
  favBtn.setAttribute('aria-pressed', String(fav));
  favBtn.title = fav ? 'Remove from favourites' : 'Add to favourites';
}

function renderFavourites() {
  const favs = getFavourites();
  if (favs.length === 0) { favouritesRow.hidden = true; return; }
  favouritesRow.hidden = false;
  favChips.innerHTML = '';
  favs.forEach((city) => {
    const chip = document.createElement('button');
    chip.className = 'chip chip--fav';
    chip.textContent = `⭐ ${city}`;
    chip.setAttribute('aria-label', `Search favourite city ${city}`);
    chip.addEventListener('click', () => fetchWeatherByCity(city));
    favChips.appendChild(chip);
  });
}

favBtn.addEventListener('click', () => {
  if (!_rawData) return;
  toggleFavourite(_rawData.name);
});

/* ═══════════════════════════════════════════════════════════════
   WEATHER RENDERING
   ═══════════════════════════════════════════════════════════════ */

/**
 * Render all weather data into the DOM.
 * Called once after first fetch, and again on unit toggle.
 * @param {Object} data  — raw OWM current-weather JSON
 */
function renderWeather(data) {
  const { name, sys, main, wind, weather, visibility, timezone } = data;
  const conditionId    = weather[0]?.id ?? 800;
  const conditionGroup = getConditionGroup(conditionId);
  const conditionText  = weather[0]?.description ?? 'Unknown';

  // Location & time
  locationEl.textContent  = `${name}, ${sys.country}`;
  localTimeEl.textContent = getLocalTime(timezone);

  // Icon
  weatherIconEl.textContent  = getConditionEmoji(conditionGroup, conditionId);
  weatherIconEl.setAttribute('aria-label', conditionText);

  // Temperature
  temperatureEl.textContent = displayTemp(main.temp);
  feelsLikeEl.textContent   = `Feels like ${displayTemp(main.feels_like)}`;

  // Condition badge
  conditionEl.textContent = conditionText.charAt(0).toUpperCase() + conditionText.slice(1);

  // Stats
  humidityEl.textContent   = `${main.humidity}%`;
  const windKmh = (wind?.speed ?? 0) * 3.6;   // m/s → km/h (TC-13)
  windSpeedEl.textContent  = speedLabel(windKmh);
  tempMinMaxEl.textContent = `${displayTemp(main.temp_min)} / ${displayTemp(main.temp_max)}`;
  visibilityEl.textContent = visibility != null
    ? `${(visibility / 1000).toFixed(1)} km`
    : '—';

  // Advisory layer (FR-12, FR-13, FR-14)
  const advisoryData = {
    feelsLike      : main.feels_like,
    windKmh,
    humidity       : main.humidity,
    conditionGroup,
    visibility,
  };
  const advisories = evaluateAdvisories(advisoryData);
  renderAdvisories(advisories);

  // Footer
  lastUpdatedEl.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  // Dynamic background
  applyBackground(conditionGroup);

  // Favourite button state
  updateFavBtn(name);

  // Show card, hide empty state
  if (emptyState) emptyState.hidden = true;
  weatherCard.hidden = false;
  weatherCard.classList.remove('card--animate');
  void weatherCard.offsetWidth;        // force reflow for animation replay
  weatherCard.classList.add('card--animate');
}

/**
 * Render advisory messages (FR-14).
 * @param {Array} advisories  — sorted, filtered rules from evaluateAdvisories()
 */
function renderAdvisories(advisories) {
  advisoryList.innerHTML = '';

  if (advisories.length === 0) {
    const li = document.createElement('li');
    li.className = 'advisory-item advisory-item--ok';
    li.innerHTML = '<span class="adv-icon" aria-hidden="true">✅</span><span>No special precautions needed right now.</span>';
    advisoryList.appendChild(li);
    return;
  }

  advisories.forEach((rule) => {
    const li = document.createElement('li');
    li.className = `advisory-item advisory-item--${rule.severity}`;
    li.dataset.ruleId = rule.id;        // transparency (§4.7)
    li.setAttribute('title', `Rule ${rule.id}: ${rule.ruleRef}`);
    li.innerHTML = `<span class="adv-icon" aria-hidden="true">${rule.icon}</span><span>${rule.message}</span>`;
    advisoryList.appendChild(li);
  });
}

/* ═══════════════════════════════════════════════════════════════
   API FETCH — BY CITY NAME
   ═══════════════════════════════════════════════════════════════ */

async function fetchWeatherByCity(city) {
  const trimmed = city.trim();

  // FR-10: empty input
  if (!trimmed) {
    showError('Please enter a city name.');
    return;
  }

  setLoading(true);

  // Fill the input box so the user sees what was searched
  cityInput.value = trimmed;
  clearBtn.hidden = false;

  try {
    const url = `${API_BASE}?q=${encodeURIComponent(trimmed)}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);

    if (response.status === 404) {
      setLoading(false);
      showError('City not found. Please enter a valid city name.');
      return;
    }

    if (response.status === 401) {
      setLoading(false);
      showError(
        'API key not activated yet. New OpenWeatherMap keys take up to 2 hours to activate — please wait and try again.'
      );
      return;
    }

    if (!response.ok) {
      setLoading(false);
      showError(`Weather service error (${response.status}). Please try again later.`);
      return;
    }

    const data = await response.json();

    // Validate that the response has minimum required fields (TC-12)
    if (!data?.main || !data?.weather?.[0]) {
      setLoading(false);
      showError('Unexpected response from the weather service. Please try again.');
      return;
    }

    _rawData = data;
    setLoading(false);
    hideError();
    renderWeather(data);
    saveHistory(data);                // save city, temp, climate & icon

  } catch (err) {
    setLoading(false);
    // Network / CORS / fetch failure (FR-09, TC-05)
    showError('Could not reach the weather service. Please check your internet connection.');
    console.error('[Wheather] fetch error:', err);
  }
}

/* ═══════════════════════════════════════════════════════════════
   API FETCH — BY GEOLOCATION
   ═══════════════════════════════════════════════════════════════ */

async function fetchWeatherByCoords(lat, lon) {
  setLoading(true);
  try {
    const url = `${API_BASE}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      setLoading(false);
      showError(`Weather service error (${response.status}). Please try again later.`);
      return;
    }

    const data = await response.json();
    if (!data?.main || !data?.weather?.[0]) {
      setLoading(false);
      showError('Unexpected response from the weather service. Please try again.');
      return;
    }

    _rawData = data;
    setLoading(false);
    hideError();
    renderWeather(data);
    saveHistory(data);

  } catch (err) {
    setLoading(false);
    showError('Could not reach the weather service. Please check your internet connection.');
    console.error('[Wheather] fetch error:', err);
  }
}

/* ═══════════════════════════════════════════════════════════════
   GEOLOCATION
   ═══════════════════════════════════════════════════════════════ */

locationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser.');
    return;
  }

  locationBtn.classList.add('spin');
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      locationBtn.classList.remove('spin');
      fetchWeatherByCoords(coords.latitude, coords.longitude);
    },
    (err) => {
      locationBtn.classList.remove('spin');
      const msgs = {
        1: 'Location access denied. Please allow location access and try again.',
        2: 'Location unavailable. Please search by city name instead.',
        3: 'Location request timed out. Please search by city name instead.',
      };
      showError(msgs[err.code] ?? 'Could not retrieve your location.');
    },
    { timeout: 10000 }
  );
});

/* ═══════════════════════════════════════════════════════════════
   SEARCH EVENT HANDLERS
   ═══════════════════════════════════════════════════════════════ */

function handleSearch() {
  fetchWeatherByCity(cityInput.value);
}

searchBtn.addEventListener('click', handleSearch);

cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});

/* ═══════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUT  /  → focus search
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== cityInput) {
    e.preventDefault();
    cityInput.focus();
  }
});

/* ═══════════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════════ */

(function init() {
  applyTheme(_theme);
  applyUnit(_unit);
  renderHistory();
  renderFavourites();
  applyBackground(null);       // default gradient on load
})();
