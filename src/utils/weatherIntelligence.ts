import {
  ActivityScore,
  BestOutdoorWindow,
  HourlyForecastItem,
  PlanningRecommendation,
  WeatherData,
} from '../types/weather';

export function generatePlanningRecommendations(data: WeatherData): PlanningRecommendation[] {
  const { current, hourly, units } = data;
  const tempUnit = units.temperature;
  const isCelsius = tempUnit.includes('C');

  // Convert current temperature to Celsius for standardized logic
  const tempC = isCelsius ? current.temperature : ((current.temperature - 32) * 5) / 9;
  const apparentTempC = isCelsius
    ? current.apparentTemperature
    : ((current.apparentTemperature - 32) * 5) / 9;

  // Upcoming 12-hour metrics
  const next12Hours = hourly.slice(0, 12);
  const maxRainProb12h = Math.max(...next12Hours.map((h) => h.precipitationProbability), 0);
  const totalRain12h = next12Hours.reduce((sum, h) => sum + h.precipitation, 0);
  const maxUv12h = Math.max(...next12Hours.map((h) => h.uvIndex), 0);
  const maxWind12h = Math.max(...next12Hours.map((h) => h.windSpeed), current.windSpeed);

  const recs: PlanningRecommendation[] = [];

  // 1. OUTDOORS & FITNESS
  let outdoorStatus: PlanningRecommendation['status'] = 'optimal';
  let outdoorTitle = 'Ideal for Outdoor Workouts';
  let outdoorSummary = 'Comfortable temperatures, dry pavement, and manageable winds.';
  let outdoorAction = 'Great time for a run, bike ride, or park walk.';
  const outdoorHighlights: string[] = [];

  if (current.weatherCode >= 95) {
    outdoorStatus = 'unfavorable';
    outdoorTitle = 'Active Thunderstorm Alert';
    outdoorSummary = 'Lightning hazards and sudden severe gusts present in the area.';
    outdoorAction = 'Move all exercise and recreation indoors until the storm clears.';
    outdoorHighlights.push('Lightning risk', 'Postpone open-air runs', 'High storm gusts');
  } else if (maxRainProb12h > 60 || current.precipitation > 0.5) {
    outdoorStatus = 'caution';
    outdoorTitle = 'Rainy Conditions Ahead';
    outdoorSummary = `High chance of rain (${maxRainProb12h}%) within the next 12 hours.`;
    outdoorAction = 'Opt for indoor gyms or wear waterproof running shoes and a brimmed hat.';
    outdoorHighlights.push(
      `Rain chance peaks at ${maxRainProb12h}%`,
      'Slick pavement',
      'Waterproof shell needed'
    );
  } else if (tempC > 30) {
    outdoorStatus = 'caution';
    outdoorTitle = 'Elevated Heat & Solar Stress';
    outdoorSummary = `High ambient temperature (${current.temperature}${tempUnit}).`;
    outdoorAction = 'Schedule intense cardio for early morning or dusk; carry extra hydration.';
    outdoorHighlights.push('Electrolyte replenishment needed', 'Avoid peak midday solar window');
  } else if (tempC < 2) {
    outdoorStatus = 'caution';
    outdoorTitle = 'Near-Freezing Temperatures';
    outdoorSummary = `Chilly conditions (${current.temperature}${tempUnit}) with apparent wind chill.`;
    outdoorAction = 'Wear wind-blocking thermals, ear warmers, and gloves for cold air protection.';
    outdoorHighlights.push('Wind chill factor', 'Keep extremities covered', 'Watch for frost');
  } else if (current.windSpeed > 35) {
    outdoorStatus = 'moderate';
    outdoorTitle = 'Breezy to Gusty Winds';
    outdoorSummary = `Wind velocity at ${current.windSpeed} ${units.windSpeed} with gusts to ${current.windGusts}.`;
    outdoorAction = 'Cycling and open field sports will encounter noticeable headwind drag.';
    outdoorHighlights.push(`Gusts up to ${current.windGusts} ${units.windSpeed}`, 'Plan sheltered routes');
  } else {
    outdoorHighlights.push(
      `Comfortable ${current.temperature}${tempUnit}`,
      `Low rain probability (${maxRainProb12h}%)`,
      'Dry running surface'
    );
  }

  recs.push({
    id: 'outdoors',
    category: 'outdoors',
    title: outdoorTitle,
    status: outdoorStatus,
    badge: outdoorStatus === 'optimal' ? 'High Suitability' : outdoorStatus === 'caution' ? 'Caution Advised' : outdoorStatus === 'unfavorable' ? 'Not Recommended' : 'Moderate',
    summary: outdoorSummary,
    action: outdoorAction,
    highlights: outdoorHighlights,
    icon: 'Activity',
  });

  // 2. COMMUTE & TRAVEL
  let commuteStatus: PlanningRecommendation['status'] = 'optimal';
  let commuteTitle = 'Clear Commuting Roads';
  let commuteSummary = 'Road surfaces are dry with good line-of-sight visibility.';
  let commuteAction = 'Standard commute timing; no weather delays anticipated.';
  const commuteHighlights: string[] = [];

  if (current.weatherCode >= 66 && current.weatherCode <= 67 || current.weatherCode === 56 || current.weatherCode === 57) {
    commuteStatus = 'unfavorable';
    commuteTitle = 'Black Ice / Freezing Rain Hazard';
    commuteSummary = 'Precipitation is freezing on road and sidewalk surfaces.';
    commuteAction = 'Avoid non-essential driving; allow double stopping distance.';
    commuteHighlights.push('Treacherous road glaze', 'Bridges freeze first', 'Severe delay risk');
  } else if (current.weatherCode === 45 || current.weatherCode === 48) {
    commuteStatus = 'caution';
    commuteTitle = 'Dense Fog — Reduced Visibility';
    commuteSummary = 'Low-lying ground fog limiting visual distance significantly.';
    commuteAction = 'Engage low-beam headlights or fog lamps; decrease highway speed.';
    commuteHighlights.push('Reduced horizon sight', 'Use low beams', 'Increase following distance');
  } else if (maxRainProb12h >= 50 || current.precipitation > 0) {
    commuteStatus = 'moderate';
    commuteTitle = 'Wet Roads & Umbrella Essential';
    commuteSummary = `Rain anticipated (${maxRainProb12h}% chance) during travel windows.`;
    commuteAction = 'Pack a portable umbrella and anticipate spray from wet roadway traffic.';
    commuteHighlights.push(
      'Carry rain umbrella',
      'Watch hydroplaning in puddles',
      'Allow extra 10-15 mins'
    );
  } else if (current.windGusts > 45) {
    commuteStatus = 'caution';
    commuteTitle = 'Crosswind Buffeting on Bridges';
    commuteSummary = `Heavy gusts reaching ${current.windGusts} ${units.windSpeed}.`;
    commuteAction = 'Keep firm two-handed steering, especially in high-profile vehicles.';
    commuteHighlights.push('Crosswind instability', 'Hold umbrella firmly', 'Watch falling branches');
  } else {
    commuteHighlights.push('Clear road conditions', 'No umbrella required currently', 'Optimum transit times');
  }

  recs.push({
    id: 'commute',
    category: 'commute',
    title: commuteTitle,
    status: commuteStatus,
    badge: commuteStatus === 'optimal' ? 'Smooth Travel' : commuteStatus === 'moderate' ? 'Umbrella Needed' : 'Delay Risk',
    summary: commuteSummary,
    action: commuteAction,
    highlights: commuteHighlights,
    icon: 'Car',
  });

  // 3. WARDROBE & GEAR
  let clothingStatus: PlanningRecommendation['status'] = 'optimal';
  let clothingTitle = 'Comfortable Mid-Weight Layers';
  let clothingSummary = 'Standard daily attire with a light top layer for transition periods.';
  let clothingAction = 'Long trousers or jeans paired with a cotton shirt and optional cardigan.';
  const clothingHighlights: string[] = [];

  if (apparentTempC < 0) {
    clothingStatus = 'caution';
    clothingTitle = 'Heavy Winter Insulation';
    clothingSummary = `Feels like ${current.apparentTemperature}${tempUnit} due to sub-zero freeze.`;
    clothingAction = 'Down jacket or heavy overcoat, thermal base layer, wool socks, and insulated gloves.';
    clothingHighlights.push('Heavy winter coat', 'Insulated gloves & beanie', 'Thermal undershirt');
  } else if (apparentTempC < 10) {
    clothingStatus = 'moderate';
    clothingTitle = 'Cold Day Layering';
    clothingSummary = `Chilly ${current.apparentTemperature}${tempUnit} apparent temperature.`;
    clothingAction = 'Fleece jacket, wool sweater, trench coat, or insulated softshell over full-length pants.';
    clothingHighlights.push('Warm jacket or coat', 'Knit sweater', 'Scarf for neck draft');
  } else if (apparentTempC < 18) {
    clothingStatus = 'optimal';
    clothingTitle = 'Light Spring/Autumn Layer';
    clothingSummary = `Pleasant but brisk (${current.temperature}${tempUnit}).`;
    clothingAction = 'Long-sleeve shirt or hoodie with light denim jacket or windbreaker.';
    clothingHighlights.push('Light jacket or hoodie', 'Breathable long sleeves', 'Comfortable sneakers');
  } else if (apparentTempC < 26) {
    clothingStatus = 'optimal';
    clothingTitle = 'Breathable Warm-Weather Wear';
    clothingSummary = `Warm and comfortable (${current.temperature}${tempUnit}).`;
    clothingAction = 'Short-sleeve tee, breathable linen or cotton shorts/chinos.';
    clothingHighlights.push('Breathable cotton / linen', 'Comfortable footwear', 'Sunglasses');
  } else {
    clothingStatus = 'caution';
    clothingTitle = 'Ultra-Light Cooling Attire';
    clothingSummary = `Hot conditions (${current.temperature}${tempUnit}), feels like ${current.apparentTemperature}${tempUnit}.`;
    clothingAction = 'Loose, light-colored clothing, wide-brim hat, UV sunglasses, and minimum layers.';
    clothingHighlights.push('Moisture-wicking fabrics', 'Wide-brim hat', 'UV-rated sunglasses');
  }

  // Check if rain gear is mandatory
  if (maxRainProb12h > 40 || totalRain12h > 0.5) {
    clothingHighlights.push('Water-resistant shell', 'Compact umbrella');
  }

  recs.push({
    id: 'clothing',
    category: 'clothing',
    title: clothingTitle,
    status: clothingStatus,
    badge: 'Wardrobe Guide',
    summary: clothingSummary,
    action: clothingAction,
    highlights: clothingHighlights,
    icon: 'Shirt',
  });

  // 4. HEALTH & COMFORT INDEX
  let comfortStatus: PlanningRecommendation['status'] = 'optimal';
  let comfortTitle = 'Favorable Environmental Comfort';
  let comfortSummary = 'Balanced relative humidity and mild UV radiation levels.';
  let comfortAction = 'Safe, comfortable indoor and outdoor breathing environment.';
  const comfortHighlights: string[] = [];

  if (maxUv12h >= 8) {
    comfortStatus = 'caution';
    comfortTitle = 'Very High UV Radiation';
    comfortSummary = `Peak UV index reaching ${maxUv12h}. Unprotected skin burns rapidly.`;
    comfortAction = 'Apply SPF 50+ sunscreen, wear protective eyewear, and seek shade 11 AM - 3 PM.';
    comfortHighlights.push(`Peak UV: ${maxUv12h}`, 'SPF 50+ reapply every 2h', 'Avoid peak sun exposure');
  } else if (maxUv12h >= 5) {
    comfortStatus = 'moderate';
    comfortTitle = 'Moderate UV Exposure';
    comfortSummary = `UV index around ${maxUv12h}. Modest sun exposure can cause skin irritation.`;
    comfortAction = 'Wear sunglasses and apply SPF 30+ if staying outdoors longer than 30 minutes.';
    comfortHighlights.push(`Peak UV: ${maxUv12h}`, 'SPF 30+ recommended', 'Wear sunglasses');
  } else {
    comfortHighlights.push(`Low UV exposure (${maxUv12h})`, 'Minimal sunburn risk');
  }

  if (current.relativeHumidity > 80) {
    comfortHighlights.push(`High humidity (${current.relativeHumidity}%)`, 'Air feels heavy / muggy');
  } else if (current.relativeHumidity < 30) {
    comfortHighlights.push(`Dry ambient air (${current.relativeHumidity}%)`, 'Stay hydrated; lip balm helps');
  } else {
    comfortHighlights.push(`Comfortable humidity (${current.relativeHumidity}%)`);
  }

  comfortHighlights.push(`Barometer: ${current.pressureMsl} hPa`);

  recs.push({
    id: 'comfort',
    category: 'comfort',
    title: comfortTitle,
    status: comfortStatus,
    badge: 'Wellness Index',
    summary: comfortSummary,
    action: comfortAction,
    highlights: comfortHighlights,
    icon: 'HeartPulse',
  });

  return recs;
}

export function computeBestOutdoorWindow(data: WeatherData): BestOutdoorWindow | null {
  const { hourly, units } = data;
  if (!hourly || hourly.length < 4) return null;

  // Evaluate candidate 3-hour windows over next 18 hours
  const candidateCount = Math.min(hourly.length - 3, 18);
  let bestScore = -Infinity;
  let bestIndex = 0;

  for (let i = 0; i < candidateCount; i++) {
    const windowHours = hourly.slice(i, i + 3);
    const avgTemp = windowHours.reduce((acc, h) => acc + h.temperature, 0) / 3;
    const maxRainProb = Math.max(...windowHours.map((h) => h.precipitationProbability));
    const avgWind = windowHours.reduce((acc, h) => acc + h.windSpeed, 0) / 3;
    const maxUv = Math.max(...windowHours.map((h) => h.uvIndex));

    // Convert to C for consistent ideal range calculation (ideal is 16-24°C)
    const isCelsius = units.temperature.includes('C');
    const tempC = isCelsius ? avgTemp : ((avgTemp - 32) * 5) / 9;

    let score = 100;
    // Penalize distance from pleasant 20°C
    score -= Math.abs(tempC - 20) * 3;
    // Heavy penalty for rain probability
    score -= maxRainProb * 1.2;
    // Penalty for high wind (> 20 kmh)
    if (avgWind > 20) score -= (avgWind - 20) * 1.5;
    // Penalty for intense UV (> 7)
    if (maxUv > 6) score -= (maxUv - 6) * 5;

    // Prefer daylight hours (between 7 AM and 8 PM)
    const startHour = new Date(windowHours[0].time).getHours();
    if (startHour < 6 || startHour > 21) {
      score -= 25; // nighttime penalty
    }

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  const selected = hourly.slice(bestIndex, bestIndex + 3);
  const startTime = new Date(selected[0].time).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  const endTime = new Date(selected[2].time).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  const avgTemp = Math.round((selected.reduce((a, b) => a + b.temperature, 0) / 3) * 10) / 10;
  const maxRain = Math.max(...selected.map((h) => h.precipitationProbability));

  let reason = 'Mildest temperature with lowest precipitation risk';
  if (maxRain === 0) reason = 'Completely dry skies with gentle breeze';
  else if (maxRain < 20) reason = 'Minimal rain chance with comfortable thermal conditions';

  return {
    startTime,
    endTime,
    summary: `${startTime} – ${endTime}`,
    avgTemp,
    rainChance: maxRain,
    reason,
  };
}

export function evaluateActivities(data: WeatherData): ActivityScore[] {
  const { current, hourly, units } = data;
  const isCelsius = units.temperature.includes('C');
  const tempC = isCelsius ? current.temperature : ((current.temperature - 32) * 5) / 9;
  const next8h = hourly.slice(0, 8);
  const maxRain8h = Math.max(...next8h.map((h) => h.precipitationProbability), 0);
  const maxWind8h = Math.max(...next8h.map((h) => h.windSpeed), current.windSpeed);
  const maxUv8h = Math.max(...next8h.map((h) => h.uvIndex), 0);

  const activities: ActivityScore[] = [];

  // Helper for status & note
  const getFactor = (
    condGood: boolean,
    condBad: boolean,
    goodNote: string,
    warnNote: string,
    badNote: string
  ): { status: 'good' | 'warning' | 'bad'; note: string } => {
    if (condBad) return { status: 'bad', note: badNote };
    if (!condGood) return { status: 'warning', note: warnNote };
    return { status: 'good', note: goodNote };
  };

  // 1. Running / Jogging
  {
    const tempFactor = getFactor(
      tempC >= 10 && tempC <= 23,
      tempC > 32 || tempC < -2,
      `Comfortable (${current.temperature}${units.temperature})`,
      tempC > 23 ? 'Warm for cardio' : 'Chilly air',
      tempC > 32 ? 'Extreme heat exhaustion risk' : 'Freezing temperatures'
    );
    const rainFactor = getFactor(
      maxRain8h < 25 && current.precipitation === 0,
      maxRain8h > 70 || current.precipitation > 2,
      'Dry running surface',
      `Passing shower risk (${maxRain8h}%)`,
      `Heavy rain expected (${maxRain8h}%)`
    );
    const windFactor = getFactor(
      current.windSpeed < 20,
      current.windSpeed > 40,
      'Light air resistance',
      `Moderate breeze (${current.windSpeed} ${units.windSpeed})`,
      'High wind drag & gusts'
    );
    const uvFactor = getFactor(
      maxUv8h <= 5,
      maxUv8h >= 9,
      'Safe solar radiation',
      `Moderate UV (${maxUv8h})`,
      'Intense UV exposure'
    );

    let score = 95;
    if (tempFactor.status === 'warning') score -= 15;
    if (tempFactor.status === 'bad') score -= 35;
    if (rainFactor.status === 'warning') score -= 20;
    if (rainFactor.status === 'bad') score -= 45;
    if (windFactor.status === 'warning') score -= 10;
    if (windFactor.status === 'bad') score -= 25;
    if (uvFactor.status === 'warning') score -= 5;
    if (uvFactor.status === 'bad') score -= 15;
    score = Math.max(10, Math.min(100, score));

    activities.push({
      id: 'running',
      name: 'Running & Cardio',
      icon: 'Footprints',
      score,
      verdict: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor',
      bestWindow: 'Early morning or late afternoon',
      advice:
        score >= 70
          ? 'Great conditions to log mileage outdoors. Standard athletic gear.'
          : 'Consider treadmill training or shorter intervals due to weather strain.',
      factors: { temp: tempFactor, rain: rainFactor, wind: windFactor, uv: uvFactor },
    });
  }

  // 2. Cycling & Commuting
  {
    const tempFactor = getFactor(
      tempC >= 12 && tempC <= 26,
      tempC > 34 || tempC < 0,
      'Pleasant riding temperature',
      'Requires thermal or breathable layer',
      'Harsh extreme temperature'
    );
    const rainFactor = getFactor(
      maxRain8h < 20 && current.precipitation === 0,
      maxRain8h > 60 || current.precipitation > 1,
      'Dry tarmac and traction',
      'Damp road; reduced braking',
      'Slick pavement & puddle spray'
    );
    const windFactor = getFactor(
      current.windSpeed < 18,
      current.windSpeed > 35,
      'Low wind resistance',
      `Noticeable crosswinds (${current.windSpeed} ${units.windSpeed})`,
      'Dangerous lateral gusts'
    );
    const uvFactor = getFactor(
      maxUv8h <= 6,
      maxUv8h >= 9,
      'Low solar stress',
      'UV sunglasses needed',
      'High sun glare and burn risk'
    );

    let score = 92;
    if (windFactor.status === 'warning') score -= 18;
    if (windFactor.status === 'bad') score -= 40;
    if (rainFactor.status === 'warning') score -= 20;
    if (rainFactor.status === 'bad') score -= 40;
    if (tempFactor.status === 'bad') score -= 25;
    score = Math.max(15, Math.min(100, score));

    activities.push({
      id: 'cycling',
      name: 'Cycling & Biking',
      icon: 'Bike',
      score,
      verdict: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor',
      bestWindow: 'Mid-morning dry hours',
      advice:
        score >= 75
          ? 'Ideal grip and wind conditions for commuting and distance routes.'
          : 'Wet surfaces reduce rim/disc braking power; ride cautiously.',
      factors: { temp: tempFactor, rain: rainFactor, wind: windFactor, uv: uvFactor },
    });
  }

  // 3. Outdoor Dining & Picnic
  {
    const tempFactor = getFactor(
      tempC >= 18 && tempC <= 26,
      tempC > 33 || tempC < 12,
      `Comfortable for sitting (${current.temperature}${units.temperature})`,
      tempC > 26 ? 'Warm in direct sunlight' : 'Chilly without heat lamp',
      'Uncomfortable temperature for lounging'
    );
    const rainFactor = getFactor(
      maxRain8h < 15 && current.precipitation === 0,
      maxRain8h > 45,
      'Zero precipitation expected',
      `Scattered shower risk (${maxRain8h}%)`,
      'Rain will disrupt outdoor tables'
    );
    const windFactor = getFactor(
      current.windSpeed < 15,
      current.windSpeed > 28,
      'Gentle calm air',
      'Breezy; napkins may blow',
      'Strong gusts disrupt umbrellas'
    );
    const uvFactor = getFactor(
      maxUv8h <= 5,
      maxUv8h >= 8,
      'Comfortable sunlight',
      'Need parasol or shade canopy',
      'Intense direct midday solar heat'
    );

    let score = 95;
    if (rainFactor.status !== 'good') score -= rainFactor.status === 'warning' ? 30 : 55;
    if (windFactor.status !== 'good') score -= windFactor.status === 'warning' ? 15 : 30;
    if (tempFactor.status !== 'good') score -= tempFactor.status === 'warning' ? 15 : 35;
    score = Math.max(10, Math.min(100, score));

    activities.push({
      id: 'dining',
      name: 'Outdoor Dining & Picnic',
      icon: 'Utensils',
      score,
      verdict: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor',
      bestWindow: 'Lunchtime or sunset patio hours',
      advice:
        score >= 75
          ? 'Terrific patio and park weather. Enjoy meals al fresco.'
          : 'Check for covered patio seating or indoor dining options.',
      factors: { temp: tempFactor, rain: rainFactor, wind: windFactor, uv: uvFactor },
    });
  }

  // 4. Car Wash & Vehicle Detailing
  {
    const rainFactor = getFactor(
      maxRain8h < 15 && current.precipitation === 0,
      maxRain8h > 40,
      'Dry stretch ensures car stays clean',
      `Spot rain showers possible (${maxRain8h}%)`,
      'Rain will immediately spot clean paint'
    );
    const tempFactor = getFactor(
      tempC >= 10 && tempC <= 28,
      tempC < 3 || tempC > 34,
      'Good drying temperature',
      'Water dries fast in sun',
      'Near freezing water or blistering heat'
    );
    const windFactor = getFactor(
      current.windSpeed < 18,
      current.windSpeed > 32,
      'Low airborne dust',
      'Dust kicked up by wind',
      'Grit and debris will coat wet panels'
    );
    const uvFactor = getFactor(
      maxUv8h <= 6,
      maxUv8h >= 9,
      'Even drying without sun spots',
      'Wash in shade to avoid water spots',
      'Direct intense sun evaporates soap'
    );

    let score = 90;
    if (rainFactor.status === 'warning') score -= 35;
    if (rainFactor.status === 'bad') score -= 60;
    if (windFactor.status === 'bad') score -= 25;
    score = Math.max(15, Math.min(100, score));

    activities.push({
      id: 'carwash',
      name: 'Car Wash & Detailing',
      icon: 'Sparkles',
      score,
      verdict: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor',
      bestWindow: 'Late afternoon in shaded area',
      advice:
        score >= 75
          ? 'Clear forecast ahead ensures your wax and wash remain pristine.'
          : 'Rain or dust in the short-term forecast will undo car washing efforts.',
      factors: { temp: tempFactor, rain: rainFactor, wind: windFactor, uv: uvFactor },
    });
  }

  // 5. Stargazing & Night Sky
  {
    const cloudCover = current.cloudCover;
    const cloudFactor = getFactor(
      cloudCover < 25,
      cloudCover > 70,
      `Clear skies (${cloudCover}% cloud cover)`,
      `Partly cloudy (${cloudCover}% clouds)`,
      `Heavy overcast (${cloudCover}% clouds)`
    );
    const rainFactor = getFactor(
      current.precipitation === 0 && maxRain8h < 20,
      maxRain8h > 50,
      'Dry atmosphere',
      'Occasional passing clouds/sprinkles',
      'Rain clouds obstructing telescope'
    );
    const tempFactor = getFactor(
      tempC >= 8,
      tempC < -5,
      'Comfortable night temperature',
      'Brisk night; dress warmly',
      'Sub-zero freeze requires heavy gear'
    );
    const windFactor = getFactor(
      current.windSpeed < 15,
      current.windSpeed > 30,
      'Steady viewing tripod',
      'Breeze causes light telescope shake',
      'Strong wind disrupts optical alignment'
    );

    let score = 95;
    score -= cloudCover * 0.7; // Cloud cover is paramount
    if (rainFactor.status === 'bad') score -= 40;
    if (windFactor.status === 'bad') score -= 20;
    score = Math.max(10, Math.min(100, Math.round(score)));

    activities.push({
      id: 'stargazing',
      name: 'Stargazing & Astronomy',
      icon: 'Sparkle',
      score,
      verdict: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor',
      bestWindow: 'After dusk (9:00 PM – 1:00 AM)',
      advice:
        score >= 75
          ? 'Minimal cloud obstruction allows great planetary and celestial visibility.'
          : 'Cloud cover will obscure constellations and deep-sky observations.',
      factors: { temp: tempFactor, rain: rainFactor, wind: windFactor, uv: { status: 'good', note: 'Nighttime' } },
    });
  }

  // 6. Outdoor Laundry Drying
  {
    const rainFactor = getFactor(
      maxRain8h < 15 && current.precipitation === 0,
      maxRain8h > 45,
      'Zero rain risk',
      `Rain shower risk (${maxRain8h}%)`,
      'Clothes line will get soaked'
    );
    const humidity = current.relativeHumidity;
    const humidityFactor = getFactor(
      humidity < 55,
      humidity > 80,
      `Dry air (${humidity}%) speeds evaporation`,
      `Moderate moisture (${humidity}%)`,
      `High humidity (${humidity}%) slows drying`
    );
    const windFactor = getFactor(
      current.windSpeed >= 10 && current.windSpeed <= 25,
      current.windSpeed > 40,
      'Ideal breeze for rapid fabric drying',
      current.windSpeed < 10 ? 'Calm air; slower drying' : 'Gusty winds',
      'Risk of garments blowing off line'
    );
    const tempFactor = getFactor(
      tempC >= 16,
      tempC < 6,
      'Warm ambient drying temperature',
      'Mild temperatures',
      'Cold air impedes moisture evaporation'
    );

    let score = 90;
    if (rainFactor.status !== 'good') score -= rainFactor.status === 'warning' ? 30 : 60;
    if (humidityFactor.status === 'bad') score -= 25;
    if (tempFactor.status === 'bad') score -= 20;
    score = Math.max(10, Math.min(100, score));

    activities.push({
      id: 'laundry',
      name: 'Line-Drying Clothes',
      icon: 'Sun',
      score,
      verdict: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor',
      bestWindow: 'Midday solar peak (11:00 AM – 3:00 PM)',
      advice:
        score >= 75
          ? 'Fast natural drying with fresh solar scent. Line dry with confidence.'
          : 'High humidity or rain risk makes indoor air-drying or machine dryer safer.',
      factors: { temp: tempFactor, rain: rainFactor, wind: windFactor, uv: { status: 'good', note: 'Solar UV sanitizes' } },
    });
  }

  return activities;
}
