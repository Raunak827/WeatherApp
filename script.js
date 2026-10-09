const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherCard = document.getElementById('weather-card');
const errorMessage = document.getElementById('error-message');

function handleSearch() {
    const cityName = cityInput.value.trim().toLowerCase();

    if (cityName === '') {
        weatherCard.style.display = 'none';
        errorMessage.textContent = 'Please enter a city name.';
        errorMessage.style.display = 'block';
        return;
    }

    if (cityName === 'delhi') {
        errorMessage.style.display = 'none';
        weatherCard.style.display = 'block'; 
    } else {
        weatherCard.style.display = 'none';
        errorMessage.textContent = 'City not found! Please search for "Delhi".';
        errorMessage.style.display = 'block';
    }
}

searchBtn.addEventListener('click', handleSearch);

cityInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        handleSearch();
    }
});