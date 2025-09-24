// API key for OpenWeatherMap
const apiKey = '692303ec0a56d0cda37c081d8fb5e9c0';

// DOM element selections for dynamic updates
const locButton = document.querySelector('.loc-button');
const todayInfo = document.querySelector('.today-info');
const todayWeatherIcon = document.querySelector('.today-weather i');
const todayTemp = document.querySelector('.weather-temp');
const daysList = document.querySelector('.days-list');
const tempToggleBtn = document.querySelector('.temp-toggle');

// Track current temperature unit (Celsius/Fahrenheit)
let currentUnit = 'C';

// Weather icon mapping from API codes to Boxicons
const weatherIconMap = {
    '01d': 'sun',      // clear sky (day)
    '01n': 'moon',     // clear sky (night)
    '02d': 'sun',      // few clouds (day)
    '02n': 'moon',     // few clouds (night)
    '03d': 'cloud',    // scattered clouds
    '03n': 'cloud',
    '04d': 'cloud',    // broken clouds
    '04n': 'cloud',
    '09d': 'cloud-rain', // shower rain
    '09n': 'cloud-rain',
    '10d': 'cloud-rain', // rain
    '10n': 'cloud-rain',
    '11d': 'cloud-lightning', // thunderstorm
    '11n': 'cloud-lightning',
    '13d': 'cloud-snow',  // snow
    '13n': 'cloud-snow',
    '50d': 'water',    // mist
    '50n': 'water'
};

// Temperature conversion utility function
function convertTemp(temp, to) {
    if (to === 'F') {
        return (temp * 9/5) + 32;  // Celsius to Fahrenheit
    } else {
        return (temp - 32) * 5/9;  // Fahrenheit to Celsius
    }
}

// Format temperature with correct unit
function updateTempDisplay(temp, unit) {
    return `${Math.round(unit === 'F' ? convertTemp(temp, 'F') : temp)}°${unit}`;
}

// Main function to fetch and display weather data
function fetchWeatherData(location) {
    // Construct API URL with metric units
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

    fetch(apiUrl).then(response => response.json()).then(data => {
        // Extract current weather information
        const todayWeather = data.list[0].weather[0].description;
        const todayTemperature = Math.round(data.list[0].main.temp);
        const feelsLike = Math.round(data.list[0].main.feels_like);
        const todayWeatherIconCode = data.list[0].weather[0].icon;

        // Update today's date and location information
        todayInfo.querySelector('h2').textContent = new Date().toLocaleDateString('en', { weekday: 'long' });
        todayInfo.querySelector('span').textContent = new Date().toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' });
        todayWeatherIcon.className = `bx bx-${weatherIconMap[todayWeatherIconCode]}`;
        todayTemp.textContent = updateTempDisplay(todayTemperature, currentUnit);
        
        // Update feels like temperature
        document.querySelector('.feels-like .value').textContent = 
            updateTempDisplay(feelsLike, currentUnit);

        // Update location display
        const locationElement = document.querySelector('.today-info > div > span');
        locationElement.textContent = `${data.city.name}, ${data.city.country}`;

        // Update weather description
        const weatherDescriptionElement = document.querySelector('.today-weather > h3');
        weatherDescriptionElement.textContent = todayWeather;

        // Update current conditions (precipitation, humidity, wind)
        const todayPrecipitation = `${data.list[0].pop}%`;
        const todayHumidity = `${data.list[0].main.humidity}%`;
        const todayWindSpeed = `${data.list[0].wind.speed} km/h`;

        // Update the day info container with current conditions
        const dayInfoContainer = document.querySelector('.day-info');
        dayInfoContainer.innerHTML = `
            <div>
                <span class="title">PRECIPITATION</span>
                <span class="value">${todayPrecipitation}</span>
            </div>
            <div>
                <span class="title">HUMIDITY</span>
                <span class="value">${todayHumidity}</span>
            </div>
            <div>
                <span class="title">WIND SPEED</span>
                <span class="value">${todayWindSpeed}</span>
            </div>
        `;

        // Calculate and display air quality
        const airQualityValue = document.querySelector('.air-quality .value');
        const humidity = data.list[0].main.humidity;
        const windSpeed = data.list[0].wind.speed;
        
        // Set air quality status based on humidity and wind conditions
        if (humidity < 60 && windSpeed > 5) {
            airQualityValue.textContent = 'Excellent';
            airQualityValue.style.background = '#4CAF50';
        } else if (humidity < 80 && windSpeed > 3) {
            airQualityValue.textContent = 'Good';
            airQualityValue.style.background = '#303f9f';
        } else {
            airQualityValue.textContent = 'Moderate';
            airQualityValue.style.background = '#ff9800';
        }

        // Process and display 4-day forecast
        const today = new Date();
        const nextDaysData = data.list.slice(1);
        const uniqueDays = new Set();
        let count = 0;
        daysList.innerHTML = '';
        
        // Loop through forecast data to create next 4 days
        for (const dayData of nextDaysData) {
            const forecastDate = new Date(dayData.dt_txt);
            const dayAbbreviation = forecastDate.toLocaleDateString('en', { weekday: 'short' });
            const dayTemp = `${Math.round(dayData.main.temp)}°C`;
            const iconCode = dayData.weather[0].icon;

            // Only add unique days to forecast
            if (!uniqueDays.has(dayAbbreviation) && forecastDate.getDate() !== today.getDate()) {
                uniqueDays.add(dayAbbreviation);
                daysList.innerHTML += `
                    <li>
                        <i class='bx bx-${weatherIconMap[iconCode]}'></i>
                        <span>${dayAbbreviation}</span>
                        <span class="day-temp">${dayTemp}</span>
                    </li>
                `;
                count++;
            }

            if (count === 4) break;  // Stop after 4 days
        }

        // Update forecast temperatures with correct unit
        const dayTemps = document.querySelectorAll('.day-temp');
        dayTemps.forEach(dayTemp => {
            const tempValue = parseInt(dayTemp.textContent);
            dayTemp.textContent = updateTempDisplay(tempValue, currentUnit);
        });
        
        // Update recommendation based on weather conditions
        const recommendationContainer = document.querySelector('.recommendation-info');
        let recommendation = "-------";
        const container2 = document.querySelector('.container2');
        
        // Set weather-based recommendations and corresponding images
        if (todayWeather.toLowerCase().includes("rain") || todayWeather.toLowerCase().includes("cloud")) {
            recommendation = "Bring Umbrella";
            container2.style.background = "url('Umbrella.png')";
        } else if (todayWeather.toLowerCase().includes("clear") || todayWeather.toLowerCase().includes("sunny")) {
            recommendation = "Bring Sunglasses";
            container2.style.background = "url('Sunglasses.png')";
        } else if (todayWeather.toLowerCase().includes("shower") || todayWeather.toLowerCase().includes("storm") ){
            recommendation = "Bring Raincoat";
            container2.style.background = "url('Raincoat.png')";
        }
        
        // Apply common styles to recommendation container
        container2.style.backgroundSize = "290px";
        container2.style.backgroundRepeat = "no-repeat";
        container2.style.backgroundPosition = "center";
        container2.style.backgroundColor = "#232931"
        
        // Update recommendation text
        recommendationContainer.innerHTML = `
            <div>
                <span class="title">
                <h2>${recommendation}</h2>
                </span>
            </div>
        `;

    }).catch(error => {
        alert(`Error fetching weather data: ${error} (Api Error)`);
    });
}

// Initialize weather data on page load
document.addEventListener('DOMContentLoaded', () => {
    const defaultLocation = 'Indonesia';
    fetchWeatherData(defaultLocation);
});

// Handle location search button click
locButton.addEventListener('click', () => {
    const location = prompt('Enter a location :');
    if (!location) return;
    fetchWeatherData(location);
});

// Handle temperature unit toggle
tempToggleBtn.addEventListener('click', () => {
    currentUnit = currentUnit === 'C' ? 'F' : 'C';
    tempToggleBtn.textContent = `Switch to °${currentUnit === 'C' ? 'F' : 'C'}`;
    
    // Refresh weather data with new unit
    const location = document.querySelector('.today-info > div > span').textContent.split(',')[0];
    fetchWeatherData(location);
});