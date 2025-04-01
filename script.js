document.addEventListener('DOMContentLoaded', function() {
    // Player de Rádio
    const audioPlayer = document.getElementById('radioStream');
    const playIcon = document.getElementById('playIcon');
    const playText = document.getElementById('playText');
    const volumeSlider = document.getElementById('volumeSlider');

    audioPlayer.volume = 0.7;
    volumeSlider.value = 0.7;

    window.togglePlay = function() {
        if (audioPlayer.paused) {
            audioPlayer.play().catch(e => console.error("Erro ao reproduzir:", e));
            playIcon.className = 'fas fa-pause';
            playText.textContent = 'Pausar';
        } else {
            audioPlayer.pause();
            playIcon.className = 'fas fa-play';
            playText.textContent = 'Ouvir';
        }
    };

    window.adjustVolume = function(change) {
        let volume = audioPlayer.volume + change;
        volume = Math.max(0, Math.min(1, volume));
        audioPlayer.volume = volume;
        volumeSlider.value = volume;
    };

    volumeSlider.addEventListener('input', function() {
        audioPlayer.volume = this.value;
    });

    // Previsão do Tempo com Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=-22.7752&longitude=-41.9134&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,rain,uv_index,wind_speed_10m,wind_direction_10m&daily=sunrise,daylight_duration,wind_speed_10m_max,uv_index_max,sunshine_duration,temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo`;

    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
            return response.json();
        })
        .then(data => {
            // Dados atuais
            const temp = Math.round(data.current.temperature_2m);
            const humidity = data.current.relative_humidity_2m;
            const wind = data.current.wind_speed_10m;
            const windDir = data.current.wind_direction_10m;
            const rain = data.current.rain;
            const uvIndex = data.hourly.uv_index[0]; // Primeiro valor horário como proxy
            const weatherCode = inferWeatherCode(data.current.precipitation, data.hourly.precipitation_probability[0]);

            document.querySelector('.temp').textContent = `${temp}°C`;
            document.querySelector('.condition').textContent = weatherCodeToDescription(weatherCode);
            document.querySelector('.feels-like').textContent = `${temp}°C`; // Sem sensação térmica na API, usando temp
            document.querySelector('.humidity').textContent = `${humidity}%`;
            document.querySelector('.wind').textContent = `${wind} km/h`;
            document.querySelector('.wind-direction').textContent = `${windDir}°`;
            document.querySelector('.rain').textContent = `${rain} mm`;
            document.querySelector('.uv-index').textContent = `${uvIndex}`;
            document.querySelector('.weather-icon i').className = `wi ${weatherCodeToIcon(weatherCode)}`;

            // Fundo dinâmico baseado na temperatura
            const weatherCurrent = document.querySelector('.weather-current');
            if (temp < 20) {
                weatherCurrent.style.background = 'linear-gradient(135deg, #4682B4, #191970)'; // Frio
            } else if (temp >= 20 && temp <= 25) {
                weatherCurrent.style.background = 'linear-gradient(135deg, #87CEEB, #32CD32)'; // Moderado
            } else {
                weatherCurrent.style.background = 'linear-gradient(135deg, #FFD700, #FF4500)'; // Quente
            }

            // Dados diários
            const sunrise = new Date(data.daily.sunrise[0]).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const daylight = Math.round(data.daily.daylight_duration[0] / 3600); // Segundos para horas
            const tempMax = Math.round(data.daily.temperature_2m_max[0]);
            const tempMin = Math.round(data.daily.temperature_2m_min[0]);

            document.querySelector('.sunrise').textContent = sunrise;
            document.querySelector('.daylight').textContent = `${daylight}h`;
            document.querySelector('.temp-range').textContent = `${tempMax}°C / ${tempMin}°C`;

            // Previsão horária (próximas 6 horas)
            const forecastContainer = document.querySelector('.forecast-container');
            forecastContainer.innerHTML = '';
            for (let i = 0; i < 6; i++) {
                const time = new Date(data.hourly.time[i]);
                const hour = time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const temp = Math.round(data.hourly.temperature_2m[i]);
                const code = inferWeatherCode(data.hourly.rain[i], data.hourly.precipitation_probability[i]);

                const forecastItem = document.createElement('div');
                forecastItem.className = 'forecast-item';
                forecastItem.innerHTML = `
                    <div class="day">${hour}</div>
                    <i class="wi ${weatherCodeToIcon(code)}"></i>
                    <div class="temps">${temp}°</div>
                `;
                forecastContainer.appendChild(forecastItem);
            }
        })
        .catch(e => {
            console.error("Erro ao carregar clima:", e.message);
            document.querySelector('.temp').textContent = 'Erro';
            document.querySelector('.condition').textContent = e.message;
        });

    // Funções de conversão
    function inferWeatherCode(rain, precipProb) {
        if (rain > 5) return 65;
        if (rain > 2) return 63;
        if (rain > 0) return 61;
        if (precipProb > 70) return 80;
        if (precipProb > 30) return 3;
        return 0;
    }

    function weatherCodeToDescription(code) {
        const weatherCodes = {
            0: 'Céu limpo',
            3: 'Nublado',
            61: 'Chuva leve',
            63: 'Chuva moderada',
            65: 'Chuva forte',
            80: 'Pancadas de chuva'
        };
        return weatherCodes[code] || 'Desconhecido';
    }

    function weatherCodeToIcon(code) {
        const iconMap = {
            0: 'wi-day-sunny',
            3: 'wi-cloudy',
            61: 'wi-rain-mix',
            63: 'wi-rain',
            65: 'wi-rain-wind',
            80: 'wi-showers'
        };
        return iconMap[code] || 'wi-day-sunny';
    }

    // Carrossel de Anunciantes
    const carousel = document.querySelector('.ad-items');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const items = document.querySelectorAll('.ad-item');
    let currentIndex = 0;
    const itemWidth = items[0].offsetWidth + 16;

    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
    }

    nextBtn.addEventListener('click', () => {
        if (currentIndex < items.length - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    setInterval(() => {
        if (currentIndex < items.length - 1) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateCarousel();
    }, 5000);

    // Função Ver Mais Câmeras
    window.toggleCameras = function() {
        const hiddenCameras = document.querySelectorAll('.hidden-mobile');
        hiddenCameras.forEach(camera => {
            camera.style.display = camera.style.display === 'block' ? 'none' : 'block';
        });
        const button = document.querySelector('.see-more');
        button.textContent = button.textContent === 'Ver Mais' ? 'Ver Menos' : 'Ver Mais';
    };
});