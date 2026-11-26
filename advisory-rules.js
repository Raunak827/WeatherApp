/**
 * advisory-rules.js
 * ─────────────────
 * Single source of truth for all advisory rules (FR-13).
 * Each rule is evaluated by evaluateAdvisories() in script.js.
 *
 * Fields
 * ──────
 * id        : Rule ID as defined in SRS §FR-13
 * priority  : Lower number = higher priority (1 is highest)
 * icon      : Emoji shown next to the advisory message in the UI
 * severity  : 'danger' | 'warning' | 'info'  — drives colour coding
 * test(d)   : Pure function that receives a normalised data object and
 *             returns true when the rule applies.
 *             d = { feelsLike, windKmh, humidity, conditionGroup, visibility }
 *             If a required field is undefined/null the function must return
 *             false safely (TC-12 / TC-13).
 * message   : Advisory text shown to the user.
 * ruleRef   : Human-readable reference kept for transparency (FR-14 / §4.7).
 */

const ADVISORY_RULES = [
  {
    id: 'ADV-01',
    priority: 1,
    icon: '⛈️',
    severity: 'danger',
    test: (d) => d.conditionGroup === 'thunderstorm',
    message: 'Thunderstorm: stay indoors if possible.',
    ruleRef: 'Condition group = thunderstorm (OWM codes 200–232).',
  },
  {
    id: 'ADV-02',
    priority: 2,
    icon: '🥵',
    severity: 'danger',
    test: (d) => typeof d.feelsLike === 'number' && d.feelsLike >= 40,
    message: 'Very high heat: avoid going out between 12 and 4 PM and drink water regularly.',
    ruleRef: 'Feels-like temperature ≥ 40 °C.',
  },
  {
    id: 'ADV-03',
    priority: 3,
    icon: '💨',
    severity: 'warning',
    test: (d) => typeof d.windKmh === 'number' && d.windKmh >= 40,
    message: 'Strong wind: take care on two-wheelers and avoid open areas.',
    ruleRef: 'Wind speed ≥ 40 km/h (converted from m/s before evaluation — TC-13).',
  },
  {
    id: 'ADV-04',
    priority: 4,
    icon: '🌧️',
    severity: 'warning',
    test: (d) => d.conditionGroup === 'rain' || d.conditionGroup === 'drizzle',
    message: 'Rain expected: carry an umbrella or raincoat.',
    ruleRef: 'Condition group = rain (OWM 500–531) or drizzle (OWM 300–321).',
  },
  {
    id: 'ADV-05',
    priority: 5,
    icon: '💧',
    severity: 'warning',
    test: (d) => typeof d.humidity === 'number' && d.humidity >= 80,
    message: 'High humidity: clothes will not dry outdoors.',
    ruleRef: 'Humidity ≥ 80%.',
  },
  {
    id: 'ADV-06',
    priority: 6,
    icon: '🌫️',
    severity: 'info',
    test: (d) => d.conditionGroup === 'mist' || d.conditionGroup === 'fog',
    message: 'Low visibility: take extra care while travelling.',
    ruleRef: 'Condition group = mist or fog (OWM 701, 741).',
  },
  {
    id: 'ADV-07',
    priority: 7,
    icon: '🥶',
    severity: 'info',
    test: (d) => typeof d.feelsLike === 'number' && d.feelsLike <= 10,
    message: 'Cold: wear warm layers.',
    ruleRef: 'Feels-like temperature ≤ 10 °C.',
  },
];

/**
 * Map an OWM weather-condition id to a simple group string.
 * @param {number} owmId  — weather.id from the API response
 * @returns {string}
 */
function getConditionGroup(owmId) {
  if (owmId >= 200 && owmId <= 232) return 'thunderstorm';
  if (owmId >= 300 && owmId <= 321) return 'drizzle';
  if (owmId >= 500 && owmId <= 531) return 'rain';
  if (owmId >= 600 && owmId <= 622) return 'snow';
  if (owmId === 701)                return 'mist';
  if (owmId === 741)                return 'fog';
  if (owmId >= 700 && owmId <= 781) return 'atmosphere';
  if (owmId === 800)                return 'clear';
  if (owmId >= 801 && owmId <= 804) return 'clouds';
  return 'unknown';
}

/**
 * Map a condition group + OWM id to a display emoji.
 * @param {string} group
 * @param {number} owmId
 * @returns {string}
 */
function getConditionEmoji(group, owmId) {
  const map = {
    thunderstorm : '⛈️',
    drizzle      : '🌦️',
    rain         : owmId >= 511 ? '🌨️' : '🌧️',
    snow         : '❄️',
    mist         : '🌫️',
    fog          : '🌫️',
    atmosphere   : '🌁',
    clear        : '☀️',
    clouds       : owmId === 801 ? '🌤️' : owmId === 802 ? '⛅' : '☁️',
  };
  return map[group] ?? '🌡️';
}

/**
 * Evaluate all advisory rules against normalised data.
 * Rules are always returned sorted by priority (ascending).
 *
 * @param {{ feelsLike?: number, windKmh?: number, humidity?: number,
 *           conditionGroup?: string, visibility?: number }} data
 * @returns {Array<{ id, priority, icon, severity, message, ruleRef }>}
 */
function evaluateAdvisories(data) {
  return ADVISORY_RULES
    .filter((rule) => {
      try { return rule.test(data); }
      catch { return false; }   // defensive — TC-12
    })
    .sort((a, b) => a.priority - b.priority);
}
