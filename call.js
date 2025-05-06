/*
    Name: 
    Date: 1/28/2025
    Purpose: Displays the weather forecast for three days from a zip code and country code,
             including day and night weather and temperatures.
*/

// Select HTML elements
const dates = document.getElementsByClassName("date");
const dayImages = document.getElementsByClassName("dayImg");
const nightImages = document.getElementsByClassName("nightImg");
const dayTemps = document.getElementsByClassName("dayTemp");
const nightTemps = document.getElementsByClassName("nightTemp");

// Convert Kelvin to Fahrenheit
function toFahrenheit(kelvin) {
    try {
        return Math.round((kelvin - 273.15) * 1.8 + 32);
    } catch (error) {
        console.error("Error converting temperature:", error);
        return "N/A";
    }
}

// Validate zip code and country code inputs
function isValidInput(zip) {
    try {
        zip = zip.trim(); //sanitization

        if (!zip) {
            alert("Zip and Country fields cannot be empty.");
            return false;
        }

        const zipPattern = /^\d{5}$/; // Validates a 5-digit zip code
        
        if (!zipPattern.test(zip)) {
            alert("Invalid Zip Code. Please enter a 5-digit zip code.");
            return false;
        }

        return true;
    } catch (error) {
        alert("Validation error!")
        console.error("Validation error:", error);
        return false;
    }
}

// Fetch weather data from OpenWeatherMap API
function getWeatherData() {
    try {
        let zip = document.getElementById("zip").value;

        if (!isValidInput(zip)) {
            return;
        }

        zip = encodeURIComponent(zip.trim());

        //Application retrieves weather data from PHP file containing API request
        fetch(`http://178.128.148.67/lucus/Weather/weatherdata.php?zip=${zip}&country=us`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response not ok.");
                }
                console.log("success!!!!!!!")
                return response.json();
            })
            .then(data => processWeatherData(data))
            .catch(error => {
                alert("Unable to fetch weather data. Please try again later.");
                console.error("There was a problem with the fetch operation:", error);
            });
    } catch (error) {
        alert("Weather data retrieval error!")
        console.error("Unexpected error in getWeatherData:", error);
    }
}

// Process and extract weather data
function processWeatherData(data) {
    try {
        console.log(data); // Output data to console
        
        const forecastList = data.list;
        const dailyTemps = [];
        const ENTRIES_PER_DAY = 8;

        for (let i = 0; i < dates.length; i++) {
            const dayData = {
                date: forecastList[i * ENTRIES_PER_DAY].dt_txt.split(" ")[0],
                dayTemp: forecastList[i * ENTRIES_PER_DAY].main.temp,
                nightTemp: forecastList[i * ENTRIES_PER_DAY + 4].main.temp,
                dayCondition: forecastList[i * ENTRIES_PER_DAY].weather[0].main,
                nightCondition: forecastList[i * ENTRIES_PER_DAY + 4].weather[0].main
            };
            dailyTemps.push(dayData);
        }
    
        updateHTML(dailyTemps);
    } catch (error) {
        alert("Error obtaining weather data, please enter a valid zip code.");
        console.error("Error processing weather data");
    }
}

// Update HTML elements with weather data
function updateHTML(dailyTemps) {
    try {
        for (let i = 0; i < dailyTemps.length; i++) {
            dates[i].innerText = dailyTemps[i].date;
            dayImages[i].src = `img/${dailyTemps[i].dayCondition}.png`;
            nightImages[i].src = `img/${dailyTemps[i].nightCondition}.png`;
            dayTemps[i].innerText = `${toFahrenheit(dailyTemps[i].dayTemp)}°F`;
            nightTemps[i].innerText = `${toFahrenheit(dailyTemps[i].nightTemp)}°F`;
        }
    
        logWeatherData(dailyTemps);
    } catch (error) {
        console.error("Error updating HTML:", error);
    }
}

// Log weather data to console
function logWeatherData(dailyTemps) {
    try {
        dailyTemps.forEach(day => {
            console.log(`Date: ${day.date}`);
            console.log(`Day Temp: ${toFahrenheit(day.dayTemp)}°F`);
            console.log(`Night Temp: ${toFahrenheit(day.nightTemp)}°F`);
            console.log(`Day: ${day.dayCondition}`);
            console.log(`Night: ${day.nightCondition}`);
            console.log('---');
        });
    } catch (error) {
        console.error("Error logging weather data:", error);
    }
}