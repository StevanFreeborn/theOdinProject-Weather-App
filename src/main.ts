import './reset.css';
import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  if (createApp()) {
    retrieveForecast(
      (position) => forecastSuccessHandler(position, weatherService, displayForecast),
      (error) => forecastErrorHandler(error, weatherService, displayForecast)
    );
  }
});

export function createApp() {
  const app = document.querySelector<HTMLDivElement>('#app');

  if (app === null) {
    console.error('Unable to find app element');
    return false;
  }

  app.innerHTML = /*html*/`
    <div class="spinner"></div>
    <pre id="display" class="hidden"><pre>
  `;

  return true;
}

export function retrieveForecast(successHandler: PositionCallback, errorHandler: PositionErrorCallback) {
  navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
}

export async function forecastSuccessHandler(position: GeolocationPosition, weatherService: WeatherService, displayForecast: (forecast: Forecast) => void) {
  const forecast = await weatherService.getWeather({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude
  });

  displayForecast(forecast);
}

export async function forecastErrorHandler(error: GeolocationPositionError, weatherService: WeatherService, displayForecast: (forecast: Forecast) => void) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      console.warn('User denied the request for Geolocation.');
      break;
    case error.POSITION_UNAVAILABLE:
      console.warn('Location information is unavailable.');
      break;
    case error.TIMEOUT:
      console.error('The request to get user location timed out.');
      break;
    default:
      console.error('An unknown error occurred.');
      break;
  }

  alert('Unable to determine your location. Using default location.');
  const forecast = await weatherService.getWeather({});
  displayForecast(forecast);
}

type Forecast = {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    is_day: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    is_day: number;
  };
  daily_units: {
    time: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

type WeatherService = {
  getWeather: (options: { latitude?: number, longitude?: number }) => Promise<Forecast>;
};

export const weatherService: WeatherService = Object.freeze({
  async getWeather({ latitude = 38.8814, longitude = -94.8191 }) {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.append('latitude', latitude.toString());
    url.searchParams.append('longitude', longitude.toString());
    url.searchParams.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
    url.searchParams.append('current', 'temperature_2m,is_day');
    url.searchParams.append('daily', 'temperature_2m_max,temperature_2m_min');
    url.searchParams.append('forecast_days', '1');

    const response = await fetch(url);

    if (response.ok === false) {
      throw new Error('Failed to fetch weather data');
    }

    return response.json();
  }
});

export function displayForecast(forecast: Forecast) {
  document.getElementById('display')!.innerText = JSON.stringify(forecast, null, 2);
  document.getElementById('display')!.classList.add('visible');
  document.querySelector('.spinner')!.remove();
}
