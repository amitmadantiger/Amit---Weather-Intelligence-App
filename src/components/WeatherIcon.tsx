import React from 'react';
import {
  Sun,
  Moon,
  SunDim,
  MoonStar,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  Snowflake,
  CloudLightning,
  Wind,
  Droplets,
  Eye,
  Compass,
  Gauge,
  Thermometer,
  Umbrella,
  Shirt,
  Car,
  HeartPulse,
  Activity,
  Footprints,
  Bike,
  Utensils,
  Sparkles,
  Sparkle,
} from 'lucide-react';

interface WeatherIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ name, className = '', size = 20 }) => {
  switch (name) {
    case 'Sun':
      return <Sun size={size} className={className} />;
    case 'Moon':
      return <Moon size={size} className={className} />;
    case 'SunDim':
      return <SunDim size={size} className={className} />;
    case 'MoonStar':
      return <MoonStar size={size} className={className} />;
    case 'CloudSun':
      return <CloudSun size={size} className={className} />;
    case 'CloudMoon':
      return <CloudMoon size={size} className={className} />;
    case 'Cloud':
      return <Cloud size={size} className={className} />;
    case 'CloudFog':
      return <CloudFog size={size} className={className} />;
    case 'CloudDrizzle':
      return <CloudDrizzle size={size} className={className} />;
    case 'CloudRain':
      return <CloudRain size={size} className={className} />;
    case 'CloudSnow':
      return <CloudSnow size={size} className={className} />;
    case 'Snowflake':
      return <Snowflake size={size} className={className} />;
    case 'CloudLightning':
      return <CloudLightning size={size} className={className} />;
    case 'Wind':
      return <Wind size={size} className={className} />;
    case 'Droplets':
      return <Droplets size={size} className={className} />;
    case 'Eye':
      return <Eye size={size} className={className} />;
    case 'Compass':
      return <Compass size={size} className={className} />;
    case 'Gauge':
      return <Gauge size={size} className={className} />;
    case 'Thermometer':
      return <Thermometer size={size} className={className} />;
    case 'Umbrella':
      return <Umbrella size={size} className={className} />;
    case 'Shirt':
      return <Shirt size={size} className={className} />;
    case 'Car':
      return <Car size={size} className={className} />;
    case 'HeartPulse':
      return <HeartPulse size={size} className={className} />;
    case 'Activity':
      return <Activity size={size} className={className} />;
    case 'Footprints':
      return <Footprints size={size} className={className} />;
    case 'Bike':
      return <Bike size={size} className={className} />;
    case 'Utensils':
      return <Utensils size={size} className={className} />;
    case 'Sparkles':
      return <Sparkles size={size} className={className} />;
    case 'Sparkle':
      return <Sparkle size={size} className={className} />;
    default:
      return <Cloud size={size} className={className} />;
  }
};
