/**
 * Geospatial boundaries, polygon generators, and satellite observation datasets
 * for Jal Setu 23 National Watershed Units.
 * Compatible with Leaflet ([lat, lng]) and GeoJSON ([lng, lat]).
 */

export const WATERSHED_CENTROIDS = {
  // Maharashtra - Nashik
  "WGH-NK-01": { name: "Waghad Watershed", lat: 20.20, lng: 73.95, dx: 0.055, dy: 0.045, state: "Maharashtra", district: "Nashik" },
  "KDW-NK-02": { name: "Kadwa Watershed", lat: 20.12, lng: 73.78, dx: 0.048, dy: 0.042, state: "Maharashtra", district: "Nashik" },
  "DRN-NK-03": { name: "Darna Watershed", lat: 19.95, lng: 73.70, dx: 0.052, dy: 0.046, state: "Maharashtra", district: "Nashik" },
  "GNG-NK-04": { name: "Gangapur Watershed", lat: 19.92, lng: 73.74, dx: 0.045, dy: 0.038, state: "Maharashtra", district: "Nashik" },
  "GRN-NK-05": { name: "Girna Watershed", lat: 20.52, lng: 74.38, dx: 0.060, dy: 0.050, state: "Maharashtra", district: "Nashik" },

  // Maharashtra - Ahmednagar, Pune, Yavatmal
  "RLG-AH-06": { name: "Ralegan Siddhi Watershed", lat: 18.91, lng: 74.41, dx: 0.048, dy: 0.042, state: "Maharashtra", district: "Ahmednagar" },
  "HWR-AH-07": { name: "Hiware Bazar Catchment", lat: 19.06, lng: 74.65, dx: 0.042, dy: 0.038, state: "Maharashtra", district: "Ahmednagar" },
  "GHD-PN-08": { name: "Ghod River Sub-Watershed", lat: 18.88, lng: 74.12, dx: 0.058, dy: 0.048, state: "Maharashtra", district: "Pune" },
  "BMB-YV-09": { name: "Bembla Watershed Basin", lat: 20.48, lng: 78.22, dx: 0.062, dy: 0.052, state: "Maharashtra", district: "Yavatmal" },

  // Rajasthan - Alwar, Udaipur, Jodhpur
  "ARV-AL-10": { name: "Arvari River Watershed", lat: 27.28, lng: 76.45, dx: 0.065, dy: 0.055, state: "Rajasthan", district: "Alwar" },
  "AYD-UD-11": { name: "Ayad-Udaisagar Catchment", lat: 24.60, lng: 73.74, dx: 0.052, dy: 0.044, state: "Rajasthan", district: "Udaipur" },
  "LUN-JD-12": { name: "Bandi-Luni Sub-Catchment", lat: 25.77, lng: 73.32, dx: 0.070, dy: 0.060, state: "Rajasthan", district: "Jodhpur" },

  // Madhya Pradesh - Jhabua, Indore, Betul
  "HTN-JH-13": { name: "Hathni River Catchment", lat: 22.35, lng: 74.38, dx: 0.060, dy: 0.052, state: "Madhya Pradesh", district: "Jhabua" },
  "KSH-IN-14": { name: "Kshipra Headwater Catchment", lat: 22.82, lng: 75.92, dx: 0.055, dy: 0.048, state: "Madhya Pradesh", district: "Indore" },
  "TWA-BT-15": { name: "Tawa Basin Sub-Watershed", lat: 22.18, lng: 77.90, dx: 0.064, dy: 0.056, state: "Madhya Pradesh", district: "Betul" },

  // Karnataka - Kolar, Belagavi, Tumakuru
  "SUJ-KL-16": { name: "Markandeya Watershed", lat: 13.02, lng: 78.20, dx: 0.048, dy: 0.042, state: "Karnataka", district: "Kolar" },
  "MLP-DH-17": { name: "Malaprabha Headwaters", lat: 15.62, lng: 74.55, dx: 0.065, dy: 0.058, state: "Karnataka", district: "Belagavi" },
  "SHM-TM-18": { name: "Shimsha Sub-Basin", lat: 13.31, lng: 76.94, dx: 0.050, dy: 0.044, state: "Karnataka", district: "Tumakuru" },

  // Andhra Pradesh & Telangana
  "PEN-AN-19": { name: "Mid-Pennar Watershed", lat: 14.55, lng: 77.12, dx: 0.068, dy: 0.058, state: "Andhra Pradesh", district: "Anantapur" },
  "DND-MB-20": { name: "Dindi River Catchment", lat: 16.74, lng: 78.88, dx: 0.054, dy: 0.046, state: "Telangana", district: "Mahabubnagar" },

  // Gujarat - Amreli, Rajkot
  "SHT-AM-21": { name: "Shetrunji River Catchment", lat: 21.32, lng: 71.02, dx: 0.062, dy: 0.052, state: "Gujarat", district: "Amreli" },
  "BHD-RJ-22": { name: "Bhadar River Basin", lat: 21.96, lng: 70.80, dx: 0.058, dy: 0.050, state: "Gujarat", district: "Rajkot" },

  // Tamil Nadu - Coimbatore
  "NOY-CB-23": { name: "Noyyal River Basin", lat: 10.98, lng: 76.90, dx: 0.056, dy: 0.048, state: "Tamil Nadu", district: "Coimbatore" },
};

/**
 * Creates natural 8-point hydrological ridge polygon coordinates.
 * Returns array of [lat, lng] pairs for Leaflet.
 */
export function getWatershedLeafletPolygon(watershedId) {
  const info = WATERSHED_CENTROIDS[watershedId] || WATERSHED_CENTROIDS["WGH-NK-01"];
  const { lat, lng, dx, dy } = info;

  const offsets = [
    [-0.30 * dy, -0.85 * dx],
    [ 0.75 * dy, -0.50 * dx],
    [ 1.00 * dy,  0.10 * dx],
    [ 0.80 * dy,  0.70 * dx],
    [ 0.10 * dy,  1.00 * dx],
    [-0.70 * dy,  0.80 * dx],
    [-1.00 * dy,  0.20 * dx],
    [-0.80 * dy, -0.60 * dx],
  ];

  const coords = offsets.map(([oy, ox]) => [
    Number((lat + oy).toFixed(6)),
    Number((lng + ox).toFixed(6)),
  ]);

  // Close ring
  coords.push(coords[0]);
  return coords;
}

/**
 * Returns bounds [[minLat, minLng], [maxLat, maxLng]] for Leaflet fitBounds.
 */
export function getWatershedBounds(watershedId) {
  const info = WATERSHED_CENTROIDS[watershedId] || WATERSHED_CENTROIDS["WGH-NK-01"];
  const { lat, lng, dx, dy } = info;
  return [
    [lat - dy * 1.15, lng - dx * 1.15],
    [lat + dy * 1.15, lng + dx * 1.15],
  ];
}

/**
 * Returns sub-zone polygons for GIS layers (NDVI, NDWI, LULC) inside the watershed.
 */
export function getWatershedGISSubZones(watershedId, baseNdvi = 0.58, baseWater = 0.64) {
  const info = WATERSHED_CENTROIDS[watershedId] || WATERSHED_CENTROIDS["WGH-NK-01"];
  const { lat, lng, dx, dy } = info;

  // 1. Riparian Valley / Stream Corridor (High NDVI & High NDWI)
  const valleyZone = [
    [lat - 0.2 * dy, lng - 0.5 * dx],
    [lat + 0.1 * dy, lng - 0.2 * dx],
    [lat + 0.5 * dy, lng + 0.1 * dx],
    [lat + 0.3 * dy, lng + 0.4 * dx],
    [lat - 0.1 * dy, lng + 0.1 * dx],
    [lat - 0.4 * dy, lng - 0.3 * dx],
  ];

  // 2. Primary Water Retention Reservoir / Check Dam Pond
  const reservoirZone = [
    [lat + 0.05 * dy, lng - 0.08 * dx],
    [lat + 0.22 * dy, lng - 0.05 * dx],
    [lat + 0.25 * dy, lng + 0.12 * dx],
    [lat + 0.10 * dy, lng + 0.15 * dx],
    [lat + 0.02 * dy, lng + 0.05 * dx],
  ];

  // 3. Middle Agricultural Cropland Zone (Moderate-High NDVI)
  const agriZone = [
    [lat - 0.6 * dy, lng - 0.4 * dx],
    [lat - 0.2 * dy, lng - 0.6 * dx],
    [lat + 0.2 * dy, lng - 0.4 * dx],
    [lat, lng + 0.2 * dx],
    [lat - 0.5 * dy, lng + 0.3 * dx],
  ];

  // 4. Upper Ridge / Shrubland Zone (Moderate-Low NDVI)
  const ridgeZone = [
    [lat + 0.3 * dy, lng - 0.4 * dx],
    [lat + 0.7 * dy, lng - 0.2 * dx],
    [lat + 0.8 * dy, lng + 0.3 * dx],
    [lat + 0.4 * dy, lng + 0.5 * dx],
    [lat + 0.2 * dy, lng + 0.1 * dx],
  ];

  // 5. Drainage channel lines (for water layer)
  const streamChannel = [
    [lat - 0.65 * dy, lng - 0.55 * dx],
    [lat - 0.35 * dy, lng - 0.30 * dx],
    [lat + 0.05 * dy, lng - 0.08 * dx],
    [lat + 0.22 * dy, lng + 0.12 * dx],
    [lat + 0.60 * dy, lng + 0.35 * dx],
  ];

  return {
    valleyZone,
    reservoirZone,
    agriZone,
    ridgeZone,
    streamChannel,
    metrics: {
      valleyNdvi: Math.min(0.85, Number((baseNdvi + 0.14).toFixed(2))),
      agriNdvi: Number(baseNdvi.toFixed(2)),
      ridgeNdvi: Math.max(0.22, Number((baseNdvi - 0.20).toFixed(2))),
      reservoirNdwi: Math.min(0.88, Number((baseWater + 0.15).toFixed(2))),
      valleyNdwi: Number(baseWater.toFixed(2)),
    }
  };
}

/**
 * Returns available cloud-filtered Sentinel-2 passes (< 20% cloud) for the watershed.
 */
export function getWatershedSatellitePasses(watershedId) {
  const seed = (watershedId || "WGH").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const cloud1 = Number((4.2 + (seed % 50) / 10).toFixed(1));
  const cloud2 = Number((8.1 + ((seed * 3) % 80) / 10).toFixed(1));
  const cloud3 = Number((5.5 + ((seed * 7) % 60) / 10).toFixed(1));
  const cloud4 = Number((12.4 + ((seed * 11) % 50) / 10).toFixed(1));

  return [
    {
      date: "08 Sep 2026",
      isoDate: "2026-09-08",
      sceneId: `S2B_MSIL2A_20260908_${watershedId}`,
      sensor: "Sentinel-2 L2A / 10m",
      cloudCover: cloud1,
      validPixels: Number((100 - cloud1).toFixed(1)),
      sunElevation: "58.4°",
      solarAzimuth: "132.8°",
      quality: "Optimal",
      isRecent: true,
      timeIST: "10:42 AM IST"
    },
    {
      date: "29 Aug 2026",
      isoDate: "2026-08-29",
      sceneId: `S2A_MSIL2A_20260829_${watershedId}`,
      sensor: "Sentinel-2 L2A / 10m",
      cloudCover: cloud2,
      validPixels: Number((100 - cloud2).toFixed(1)),
      sunElevation: "61.2°",
      solarAzimuth: "128.5°",
      quality: "Good",
      isRecent: false,
      timeIST: "10:39 AM IST"
    },
    {
      date: "19 Aug 2026",
      isoDate: "2026-08-19",
      sceneId: `S2B_MSIL2A_20260819_${watershedId}`,
      sensor: "Sentinel-2 L2A / 10m",
      cloudCover: cloud3,
      validPixels: Number((100 - cloud3).toFixed(1)),
      sunElevation: "63.7°",
      solarAzimuth: "124.9°",
      quality: "Optimal",
      isRecent: false,
      timeIST: "10:45 AM IST"
    },
    {
      date: "04 Aug 2026",
      isoDate: "2026-08-04",
      sceneId: `S2A_MSIL2A_20260804_${watershedId}`,
      sensor: "Sentinel-2 L2A / 10m",
      cloudCover: cloud4,
      validPixels: Number((100 - cloud4).toFixed(1)),
      sunElevation: "65.1°",
      solarAzimuth: "119.2°",
      quality: "Usable",
      isRecent: false,
      timeIST: "10:40 AM IST"
    },
  ];
}

/**
 * Returns seasonal simulation variations for a watershed.
 */
export const SEASONAL_FACTORS = {
  Kharif: {
    name: "Kharif (Monsoon)",
    period: "Jun – Oct 2026",
    ndviMultiplier: 1.0,
    waterMultiplier: 1.0,
    rainfallMultiplier: 1.0,
    cloudAvg: 6.2,
    passDate: "08 Sep 2026",
    statusNote: "Peak monsoon vegetative vigor & active surface ponding",
  },
  Rabi: {
    name: "Rabi (Winter)",
    period: "Nov 2025 – Mar 2026",
    ndviMultiplier: 0.88,
    waterMultiplier: 0.72,
    rainfallMultiplier: 0.15,
    cloudAvg: 2.1,
    passDate: "14 Jan 2026",
    statusNote: "Post-monsoon winter crop growth with receding pond levels",
  },
  Zaid: {
    name: "Zaid (Summer)",
    period: "Apr – May 2026",
    ndviMultiplier: 0.65,
    waterMultiplier: 0.45,
    rainfallMultiplier: 0.05,
    cloudAvg: 1.4,
    passDate: "22 Apr 2026",
    statusNote: "Dry season minimums with localized irrigated pocket retention",
  },
};
