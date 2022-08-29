window.addEventListener("load", function () {
    let windowHeight = window.screen.availHeight;
    let windowWidth = window.screen.availWidth;

    //components and event listeners
    let pageBody = document.querySelector("body");
    pageBody.style.backgroundImage = `url(https://source.unsplash.com/${windowWidth}x${windowHeight}?Waterfall)`;
    let searchBtn = document.getElementById("search-button");
    let searchInput = document.getElementById("search");
    let locationInput = searchInput.value;
    let forecastContainer = document.querySelector(".forecast-container");
    searchBtn.addEventListener("pointerdown", getWeather);
    searchInput.addEventListener("keyup", function (event) {
        if (event.key == "Enter") {
            getWeather();
        }
    });

    let changeSlider = document.querySelector("input[type=checkbox]");
    let weatherDisplayed = true;
    changeSlider.addEventListener("change", function () {
        let heading = document.querySelector(".location-heading");
        let wholeContainer = document.querySelector("#whole-container");
        let weatherContainer = document.querySelector(".weather-container");
        let weatherForecastLabel = document.querySelector(".weather-forecast-label");
        if (weatherDisplayed == true) {
            weatherDisplayed = false;
            weatherForecastLabel.innerText = "Forecast";
            wholeContainer.classList.remove("weather-width");
            wholeContainer.classList.add("forecast-width");
            weatherContainer.classList.add("hidden");
            forecastContainer.classList.remove("hidden");
            heading.innerText = "Forecast " + heading.innerText.slice(7, heading.innerText.length);
        } else {
            weatherDisplayed = true;
            weatherForecastLabel.innerText = "Weather";
            wholeContainer.classList.remove("forecast-width");
            wholeContainer.classList.add("weather-width");
            forecastContainer.classList.add("hidden");
            weatherContainer.classList.remove("hidden");
            heading.innerText = "Weather " + heading.innerText.slice(8, heading.innerText.length);
        }
    });

    //changes the background image if screen is resized (might be weird and delete later)
    window.addEventListener("resize", function () {
        windowHeight = window.screen.availHeight;
        windowWidth = window.screen.availWidth;
        pageBody.style.backgroundImage = `url(https://source.unsplash.com/${windowWidth}x${windowHeight}?${locationInput})`;
    });

    //two fetch requests happening... first takes the location input and returns the exact
    //longitude and latitude and the second takes that return and fetches weather data
    //based on the data from the first and then runs the data thru the displayweather funciton
    function getWeather(e) {
        let weatherForecastSwitch = document.getElementById("switch");
        weatherForecastSwitch.classList.remove("loading");
        let apiKey = "f52c1374387de22f10d8d388a56713d6";
        locationInput = searchInput.value;
        windowHeight = window.screen.availHeight;
        windowWidth = window.screen.availWidth;
        let geoApiURL = `https://api.openweathermap.org/geo/1.0/direct?q=${locationInput}&appid=${apiKey}`;
        pageBody.style.backgroundImage = `url(https://source.unsplash.com/${windowWidth}x${windowHeight}?${locationInput})`;
        fetch(geoApiURL)
            .then((response) => response.json())
            .then((gdata) => {
                console.log(1, gdata);
                let lon = gdata[0].lon;
                let lat = gdata[0].lat;
                let currentWeatherApiURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&lang=en&appid=${apiKey}`;
                let forecastApiURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

                fetch(currentWeatherApiURL)
                    .then((response) => response.json())
                    .then((wdata) => {
                        console.log(2, wdata);
                        displayWeather(gdata, wdata);
                    });
                fetch(forecastApiURL)
                    .then((res) => res.json())
                    .then((fdata) => {
                        console.log(3, fdata);
                        displayForecast(fdata);
                    });
            });
    }
    //takes the geo data and the weather data and filters and formats it and then pushes the HTMl onto the page
    function displayWeather(gdata, wdata) {
        //assigning variables to imported data points
        let city = gdata[0].name;
        let state = gdata[0].state;
        let country = gdata[0].country;
        let clouds = wdata.clouds.all;
        let { feels_like, humidity, pressure, temp, temp_max, temp_min } = wdata.main;
        let visibility = wdata.visibility;
        let { description, icon } = wdata.weather[0];
        let wind = wdata.wind.speed;
        let visPercent = (visibility / 10000) * 100;

        //displaying to the HTML for weather
        if (weatherDisplayed === true) {
            if (state != undefined) {
                document.querySelector(".location-heading").innerText = `Weather in ${city}, ${state} ${country}`;
            } else if (state == undefined) {
                document.querySelector(".location-heading").innerText = `Weather in ${city} ${country}`;
            }
        } else if (weatherDisplayed === false) {
            if (state != undefined) {
                document.querySelector(".location-heading").innerText = `Forecast in ${city}, ${state} ${country}`;
            } else if (state == undefined) {
                document.querySelector(".location-heading").innerText = `Forecast in ${city} ${country}`;
            }
        }
        document.querySelector(".curr-temp").innerText = "Current Temperature: " + temp + " " + String.fromCharCode(176) + "F";
        document.querySelector(".feels-like").innerText = "Feels Like: " + feels_like + " " + String.fromCharCode(176) + "F";
        document.querySelector(".max-temp").innerText = "Today's High: " + temp_max + " " + String.fromCharCode(176) + "F";
        document.querySelector(".min-temp").innerText = "Today's Low: " + temp_min + " " + String.fromCharCode(176) + "F";
        document.querySelector(".description").innerText = "Current Description: " + description;
        document.querySelector(".icon").src = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
        document.querySelector(".pressure").innerText = "Current Air Pressure: " + pressure + " hPa";
        document.querySelector(".wind-speed").innerText = "Current Wind Speed: " + wind + " MPH";
        document.querySelector(".humidity-progress-fill").style.width = `${humidity}%`;
        document.querySelector(".humidity-progress-text").innerText = `Humidity: ${humidity}%`;
        document.querySelector(".clouds-progress-fill").style.width = `${clouds}%`;
        document.querySelector(".clouds-progress-text").innerText = `Clouds: ${clouds}%`;
        document.querySelector(".visibility-progress-fill").style.width = `${visPercent}%`;
        document.querySelector(".visibility-progress-text").innerText = `Visibility: ${visPercent}%`;
        document.querySelector(".search-returns").classList.remove("loading");
        document.querySelector(".switch").classList.remove("loading");
    }
    //takes forecast data and filters and formats it as well by reducing it to every 6 hours instead of 3 and pushes it into the cards
    function displayForecast(fdata) {
        forecastContainer.innerHTML = "";
        let unfilteredArr = fdata.list;
        let filteredArr = [];
        let degsFar = String.fromCharCode(176) + "F";
        for (let i = 0; i < unfilteredArr.length; i++) {
            let dateText = unfilteredArr[i].dt_txt;
            if (dateText.includes("00:00:00") || dateText.includes("06:00:00") || dateText.includes("12:00:00") || dateText.includes("18:00:00")) {
                filteredArr.push(unfilteredArr[i]);
            }
        }
        console.log(filteredArr);
        for (let j = 0; j < 12; j++) {
            let icon = filteredArr[j].weather[0].icon;
            let des = filteredArr[j].weather[0].description;
            let temp = filteredArr[j].main.temp;
            let hum = filteredArr[j].main.humidity;
            let dateTime = filteredArr[j].dt_txt.slice(5, 16);
            if (dateTime[7] == "0") {
                dateTime = dateTime.slice(0, 6) + "Midnight";
            }
            if (dateTime[7] == "6") {
                dateTime = dateTime.slice(0, 6) + "6:00 a.m";
            }
            if (dateTime[7] == "2") {
                dateTime = dateTime.slice(0, 6) + "Noon";
            }
            if (dateTime[7] == "8") {
                dateTime = dateTime.slice(0, 6) + "6:00 p.m";
            }
            let date = dateTime.slice(0, 6);
            let time = dateTime.slice(6, dateTime.length);
            console.log(date, time);
            let forecastCardContents = `
            <img class="forecast-icon small-screen-hidden" src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="Image of weather conditions" />
            <h2 class="forecast-description">${des}</h2>
            <h2 class="forecast-temp">${temp}${degsFar}</h2>
            <p class="forecast-time-date">${date}<br>${time}</p>
            <p class="forecast-humidity">Humidity: ${hum}%</p>`;
            let forecastCard = document.createElement("div");
            forecastCard.classList.add("forecast-card");
            forecastCard.innerHTML = forecastCardContents;
            forecastContainer.append(forecastCard);
        }
    }
});
