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

    // Previsão do Tempo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=-22.7469&longitude=-41.8816¤t=temperature_2m,weather_code&hourly=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&timezone=America%2FSao_Paulo`;

    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
            return response.json();
        })
        .then(data => {
            document.querySelector('.temp').textContent = `${Math.round(data.current.temperature_2m)}°C`;
            document.querySelector('.condition').textContent = weatherCodeToDescription(data.current.weather_code);
            document.querySelector('.details div:nth-child(1)').textContent = `${data.hourly.relative_humidity_2m[0]}%`;
            document.querySelector('.details div:nth-child(2)').textContent = `${data.hourly.wind_speed_10m[0]} km/h`;
            document.querySelector('.weather-icon i').className = `wi ${weatherCodeToIcon(data.current.weather_code)}`;

            const forecastContainer = document.querySelector('.forecast-container');
            forecastContainer.innerHTML = '';
            for (let i = 0; i < 6; i++) {
                const time = new Date(data.hourly.time[i]);
                const hour = time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const temp = Math.round(data.hourly.temperature_2m[i]);
                const code = data.hourly.weather_code[i];

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

    function weatherCodeToDescription(code) {
        const weatherCodes = {
            0: 'Céu limpo',
            1: 'Parcialmente nublado',
            2: 'Parcialmente nublado',
            3: 'Nublado',
            45: 'Nevoeiro',
            61: 'Chuva leve',
            63: 'Chuva moderada',
            65: 'Chuva forte',
            80: 'Pancadas de chuva',
            95: 'Tempestade'
        };
        return weatherCodes[code] || 'Desconhecido';
    }

    function weatherCodeToIcon(code) {
        const iconMap = {
            0: 'wi-day-sunny',
            1: 'wi-day-cloudy',
            2: 'wi-day-cloudy',
            3: 'wi-cloudy',
            45: 'wi-fog',
            61: 'wi-rain-mix',
            63: 'wi-rain',
            65: 'wi-rain-wind',
            80: 'wi-showers',
            95: 'wi-thunderstorm'
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
});