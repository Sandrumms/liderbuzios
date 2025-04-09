document.addEventListener('DOMContentLoaded', () => {
    // Header
    const header = document.getElementById('header');
    const hour = new Date().getHours();
    let imageUrl = '';
    if (hour >= 6 && hour < 12) imageUrl = 'https://images.unsplash.com/photo-1502082553048-f009c37129b9'; // manhã
    else if (hour >= 12 && hour < 18) imageUrl = 'https://images.unsplash.com/photo-1501973801540-537f08ccae7b'; // tarde
    else if (hour >= 18 && hour < 21) imageUrl = 'https://images.unsplash.com/photo-1501975558161-83d33ff0b4b4'; // pôr do sol
    else imageUrl = 'https://images.unsplash.com/photo-1503437313881-503a91226422'; // noite
    header.style.backgroundImage = `url(${imageUrl})`;

    // Menu Hambúrguer
    const hamburger = document.querySelector('.hamburger');
    const navContainer = document.querySelector('.nav-container');
    hamburger.addEventListener('click', () => {
        navContainer.classList.toggle('active');
        hamburger.querySelector('i').classList.toggle('fa-bars');
        hamburger.querySelector('i').classList.toggle('fa-times');
    });

    // Player
    const audio = document.getElementById('radioStream');
    const playIcon = document.getElementById('playIcon');
    const volumeSlider = document.getElementById('volumeSlider');
    const currentSong = document.getElementById('current-song');
    const currentArtist = document.getElementById('current-artist');
    const equalizerBars = document.querySelectorAll('.equalizer span');

    audio.volume = 0.5;
    const songs = [
        { title: "Verão em Búzios", artist: "Banda Sol e Mar" },
        { title: "Mar de Búzios", artist: "João da Viola" },
        { title: "Rua das Pedras", artist: "DJ Búzios" }
    ];
    const programs = [
        { name: "Manhã Líder", host: "Edson Ramos", time: "6h-12h" },
        { name: "Tarde Total", host: "Rodrigo Tardelli", time: "12h-18h" },
        { name: "Noite Vibrante", host: "Fábio Macedo", time: "18h-0h" }
    ];

    function updateNowPlaying() {
        const now = new Date();
        const hours = now.getHours();
        let currentProgram = programs[hours >= 6 && hours < 12 ? 0 : hours >= 12 && hours < 18 ? 1 : 2];
        const randomSong = songs[Math.floor(Math.random() * songs.length)];
        currentSong.textContent = randomSong.title;
        currentArtist.textContent = `${randomSong.artist} • ${currentProgram.name}`;
    }

    window.togglePlay = () => {
        if (audio.paused) {
            audio.play().then(() => {
                playIcon.classList.replace('fa-play', 'fa-pause');
                equalizerBars.forEach(bar => bar.style.animationPlayState = 'running');
            }).catch(err => console.log('Erro ao tocar:', err));
        } else {
            audio.pause();
            playIcon.classList.replace('fa-pause', 'fa-play');
            equalizerBars.forEach(bar => bar.style.animationPlayState = 'paused');
        }
    };

    volumeSlider.addEventListener('input', () => audio.volume = volumeSlider.value);
    updateNowPlaying();
    setInterval(updateNowPlaying, 30000);

    // Previsão do Tempo com Open-Meteo (Corrigido)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=-22.7752&longitude=-41.9134&daily=sunrise,temperature_2m_max,temperature_2m_min,daylight_duration,wind_speed_10m_max&hourly=temperature_2m,relative_humidity_2m,rain,precipitation_probability,apparent_temperature,wind_speed_10m&current=temperature_2m,precipitation,rain,relative_humidity_2m,is_day,apparent_temperature`;

    fetch(weatherUrl)
        .then(response => {
            console.log('Resposta da API:', response);
            if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Dados recebidos:', data);

            // Dados atuais
            const temp = Math.round(data.current.temperature_2m);
            const feelsLike = Math.round(data.current.apparent_temperature);
            const humidity = data.current.relative_humidity_2m;
            const wind = Math.round(data.hourly.wind_speed_10m[0]);
            const windDir = data.hourly.wind_speed_10m[0] ? 'N/A' : 'N/A'; // Placeholder
            const rain = data.current.rain;
            const precipProb = data.hourly.precipitation_probability[0];
            const isDay = data.current.is_day === 1 ? 'Dia' : 'Noite';
            const weatherCode = inferWeatherCode(rain, precipProb);

            const setText = (selector, text) => {
                const element = document.querySelector(selector);
                if (element) element.textContent = text;
            };

            setText('.temp', `${temp}°C`);
            setText('.condition', `${weatherCodeToDescription(weatherCode)} (${isDay})`);
            setText('.feels-like', `${feelsLike}°C`);
            setText('.humidity', `${humidity}%`);
            setText('.wind', `${wind} km/h`);
            setText('.wind-direction', `${windDir}`);
            setText('.rain', `${rain} mm`);
            setText('.uv-index', `${precipProb}%`);
            const weatherIcon = document.querySelector('.weather-icon i');
            if (weatherIcon) weatherIcon.className = `wi ${weatherCodeToIcon(weatherCode)}`;

            // Fundo dinâmico
            const weatherCurrent = document.querySelector('.weather-current');
            if (rain > 0) {
                weatherCurrent.style.backgroundImage = `url('https://images.unsplash.com/photo-1519692933481-e162a57d6721')`;
            } else if (temp < 20) {
                weatherCurrent.style.backgroundImage = `url('https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0')`;
            } else if (temp >= 20 && temp <= 25) {
                weatherCurrent.style.backgroundImage = `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e')`;
            } else {
                weatherCurrent.style.backgroundImage = `url('https://images.unsplash.com/photo-1498550744921-75f79806b8a7')`;
            }

            // Dados diários
            const sunrise = new Date(data.daily.sunrise[0]).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const daylight = Math.round(data.daily.daylight_duration[0] / 3600);
            const tempMax = Math.round(data.daily.temperature_2m_max[0]);
            const tempMin = Math.round(data.daily.temperature_2m_min[0]);
            const windMax = Math.round(data.daily.wind_speed_10m_max[0]);

            setText('.sunrise', sunrise);
            setText('.daylight', `${daylight}h`);
            setText('.temp-range', `${tempMax}° / ${tempMin}° (Vento máx: ${windMax} km/h)`);

            // Previsão horária (8 horas)
            const forecastContainer = document.querySelector('.forecast-container');
            forecastContainer.innerHTML = '';
            for (let i = 0; i < 8; i++) {
                const time = new Date(data.hourly.time[i]);
                const hour = time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const temp = Math.round(data.hourly.temperature_2m[i]);
                const feelsLikeHour = Math.round(data.hourly.apparent_temperature[i]);
                const precipProbHour = data.hourly.precipitation_probability[i];
                const code = inferWeatherCode(data.hourly.rain[i], precipProbHour);

                const forecastItem = document.createElement('div');
                forecastItem.className = 'forecast-item';
                forecastItem.innerHTML = `
                    <div class="day">${hour}</div>
                    <i class="wi ${weatherCodeToIcon(code)}"></i>
                    <div class="temps">${temp}° (${feelsLikeHour}°)</div>
                    <div class="precip-prob">${precipProbHour}% chuva</div>
                `;
                forecastContainer.appendChild(forecastItem);
            }
        })
        .catch(e => {
            console.error("Erro ao carregar clima:", e.message);
            const setText = (selector, text) => {
                const element = document.querySelector(selector);
                if (element) element.textContent = text;
            };
            setText('.temp', 'Erro');
            setText('.condition', e.message);
            setText('.feels-like', 'N/A');
            setText('.humidity', 'N/A');
            setText('.wind', 'N/A');
            setText('.wind-direction', 'N/A');
            setText('.rain', 'N/A');
            setText('.uv-index', 'N/A');
            setText('.sunrise', 'N/A');
            setText('.daylight', 'N/A');
            setText('.temp-range', 'N/A');
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

    // Ads Carousel
    const carousel = document.getElementById('adCarousel');
    Array.from(carousel.children).forEach(ad => carousel.appendChild(ad.cloneNode(true)));

    // Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({ top: targetElement.offsetTop - 100, behavior: 'smooth' });
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                this.classList.add('active');
                navContainer.classList.remove('active'); // Fecha o menu ao clicar
                hamburger.querySelector('i').classList.replace('fa-times', 'fa-bars');
            }
        });
    });

    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        document.querySelectorAll('.tile').forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) link.classList.add('active');
                });
            }
        });
    });
});