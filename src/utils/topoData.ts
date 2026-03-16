/**
 * Utility for fetching and simulating topographic elevation data.
 */

export interface ElevationParams {
  source: 'earth' | 'mars-olympus' | 'mars-gale' | 'mars-procedural';
  latitude?: number;
  longitude?: number;
  gridSize?: number;
  scale?: number; // Zoom level: larger = more zoomed in
}

const CACHE_KEY = 'topo_elevation_cache';

function getCachedData(key: string): number[][] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const core = JSON.parse(cached);
    return core[key] || null;
  } catch (e) {
    return null;
  }
}

function setCachedData(key: string, data: number[][]) {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const core = cached ? JSON.parse(cached) : {};
    core[key] = data;
    localStorage.setItem(CACHE_KEY, JSON.stringify(core));
  } catch (e) {}
}

/**
 * Procedural Simplex-like noise for fallback or Mars-procedural
 */
function generateProceduralGrid(size: number, frequency = 0.1, intensity = 1.0): number[][] {
  const grid: number[][] = [];
  const offset = Math.random() * 1000;
  for (let y = 0; y < size; y++) {
    const row: number[] = [];
    for (let x = 0; x < size; x++) {
      // Adjusted sine-based noise to use frequency
      const val = (Math.sin(x * frequency + offset) + Math.cos(y * frequency + offset)) * 50 * intensity;
      row.push(val);
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Fetches elevation data for a grid around a center point (Earth).
 * Scale influences how close the sample points are.
 */
export async function getElevationGrid(params: ElevationParams): Promise<number[][]> {
  const size = params.gridSize || 25;
  const zoom = params.scale || 1.0;
  // Lower the zoom value, the higher the frequency (more zoomed out features)
  // Higher the zoom value, the lower the frequency (more zoomed in features)
  const frequency = 0.2 / zoom;

  const cacheId = `${params.source}_${params.latitude}_${params.longitude}_${size}_${zoom}`;
  
  const cached = getCachedData(cacheId);
  if (cached) return cached;

  if (params.source === 'earth' && params.latitude !== undefined && params.longitude !== undefined) {
    try {
      const response = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${params.latitude},${params.longitude}`);
      const data = await response.json();
      const altitude = data.results[0].elevation;
      
      const base = generateProceduralGrid(size, frequency, 1.5 * zoom);
      const grid = base.map(row => row.map(val => val + altitude));
      setCachedData(cacheId, grid);
      return grid;
    } catch (e) {
      console.warn("Elevation API failed, falling back to procedural.", e);
    }
  }

  // Mars / Procedural / Error Fallback
  let grid: number[][];
  if (params.source === 'mars-olympus') {
    grid = generateProceduralGrid(size, frequency * 0.75, 3.0); 
  } else if (params.source === 'mars-gale') {
    grid = generateProceduralGrid(size, frequency * 1.5, 0.8);
  } else {
    grid = generateProceduralGrid(size, frequency, 1.0);
  }

  setCachedData(cacheId, grid);
  return grid;
}
