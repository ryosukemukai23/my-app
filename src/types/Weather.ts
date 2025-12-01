// types/Weather.ts
export interface CurrentWeather {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  timezone: number; // ← ここを追加
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  name: string;
}

export interface ForecastDay {
  dt: number;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  speed: number;
  deg: number;
  clouds: number;
  pop: number;
}

export interface WeatherForecast {
  city: {
    name: string;
    country: string;
    coord: {
      lat: number;
      lon: number;
    };
  };
  list: ForecastDay[];
}

export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}
