// National GIS and Hydrological Dataset for Jal Setu
// Includes coordinates for major Indian river drainage lines, macro-catchment watershed regions, and telemetry-rich inspection checkpoints.

export const majorRiverDrainageLines = [
  {
    id: "riv-ganga",
    name: "Ganga River System",
    basin: "Ganga Basin",
    lengthKm: 2525,
    color: "#0284c7",
    weight: 3.5,
    coordinates: [
      [30.98, 78.93], // Gangotri
      [30.15, 78.30], // Rishikesh
      [29.94, 78.16], // Haridwar
      [28.98, 78.23], // Bijnor
      [28.36, 78.60], // Narora
      [27.91, 79.12], // Farrukhabad
      [27.15, 79.91], // Kannauj
      [26.46, 80.34], // Kanpur
      [25.88, 80.95], // Fatehpur
      [25.43, 81.84], // Prayagraj (Sangam)
      [25.31, 82.97], // Varanasi
      [25.56, 83.98], // Buxar
      [25.61, 85.13], // Patna
      [25.28, 86.98], // Bhagalpur
      [24.81, 87.92], // Farakka Barrage
      [24.23, 88.24], // Murshidabad
      [22.57, 88.36], // Kolkata (Hooghly)
      [21.65, 88.08], // Sagar Island / Bay of Bengal
    ],
  },
  {
    id: "riv-yamuna",
    name: "Yamuna River System",
    basin: "Ganga Basin",
    lengthKm: 1376,
    color: "#0ea5e9",
    weight: 3,
    coordinates: [
      [31.01, 78.45], // Yamunotri
      [30.55, 77.62], // Dakpathar
      [30.08, 77.28], // Hathnikund
      [29.39, 76.96], // Panipat
      [28.61, 77.20], // Delhi
      [27.50, 77.67], // Mathura
      [27.17, 78.00], // Agra
      [26.76, 79.03], // Etawah
      [26.15, 80.08], // Hamirpur
      [25.43, 81.84], // Prayagraj (Confluence with Ganga)
    ],
  },
  {
    id: "riv-narmada",
    name: "Narmada River",
    basin: "Narmada-Tapi Basin",
    lengthKm: 1312,
    color: "#0284c7",
    weight: 3.2,
    coordinates: [
      [22.67, 81.75], // Amarkantak
      [22.80, 80.89], // Dindori
      [22.95, 80.37], // Mandla
      [23.18, 79.98], // Jabalpur (Bhedaghat)
      [22.90, 78.78], // Narsinghpur
      [22.75, 77.72], // Hoshangabad (Narmadapuram)
      [22.25, 76.24], // Omkareshwar
      [22.18, 75.58], // Maheshwar
      [21.83, 73.74], // Sardar Sarovar (Kevadia)
      [21.70, 72.99], // Bharuch
      [21.60, 72.58], // Gulf of Khambhat (Arabian Sea)
    ],
  },
  {
    id: "riv-tapi",
    name: "Tapi (Tapti) River",
    basin: "Narmada-Tapi Basin",
    lengthKm: 724,
    color: "#38bdf8",
    weight: 2.8,
    coordinates: [
      [21.90, 77.90], // Multai (Betul)
      [21.31, 76.22], // Burhanpur
      [21.04, 75.79], // Bhusawal
      [21.16, 75.31], // Jalgaon
      [21.32, 74.24], // Prakasha
      [21.25, 73.58], // Ukai Dam
      [21.19, 72.83], // Surat
      [21.08, 72.69], // Arabian Sea
    ],
  },
  {
    id: "riv-godavari",
    name: "Godavari River",
    basin: "Godavari Basin",
    lengthKm: 1465,
    color: "#0369a1",
    weight: 3.5,
    coordinates: [
      [19.93, 73.53], // Trimbakeshwar (Nashik)
      [19.99, 73.79], // Nashik City
      [19.85, 74.47], // Kopargaon
      [19.53, 75.24], // Paithan (Jayakwadi)
      [19.15, 77.31], // Nanded
      [18.98, 77.92], // Nizamabad
      [18.80, 79.45], // Ramagundam
      [18.71, 79.91], // Kaleshwaram
      [17.66, 80.88], // Bhadrachalam
      [17.00, 81.78], // Rajahmundry
      [16.73, 82.25], // Yanam / Delta
      [16.35, 82.35], // Bay of Bengal
    ],
  },
  {
    id: "riv-krishna",
    name: "Krishna River",
    basin: "Krishna Basin",
    lengthKm: 1400,
    color: "#0284c7",
    weight: 3.2,
    coordinates: [
      [17.92, 73.66], // Mahabaleshwar
      [17.68, 73.99], // Satara
      [16.85, 74.58], // Sangli
      [16.58, 74.83], // Miraj
      [16.35, 75.72], // Almatti Dam
      [16.20, 77.35], // Raichur
      [16.02, 78.90], // Srisailam Dam
      [16.57, 79.31], // Nagarjuna Sagar
      [16.50, 80.64], // Vijayawada (Prakasam Barrage)
      [15.80, 80.95], // Hamsaladeevi / Bay of Bengal
    ],
  },
  {
    id: "riv-cauvery",
    name: "Cauvery (Kaveri) River",
    basin: "Cauvery Basin",
    lengthKm: 805,
    color: "#0ea5e9",
    weight: 3,
    coordinates: [
      [12.38, 75.49], // Talakaveri (Kodagu)
      [12.43, 75.96], // Kushalnagar
      [12.42, 76.57], // KRS Dam / Mysuru
      [12.29, 77.16], // Shivanasamudra Falls
      [12.08, 77.72], // Hogenakkal
      [11.80, 77.80], // Mettur Dam
      [11.34, 77.72], // Erode
      [11.02, 78.18], // Karur
      [10.82, 78.68], // Tiruchirappalli (Grand Anicut)
      [10.78, 79.13], // Thanjavur
      [11.14, 79.85], // Poompuhar / Bay of Bengal
    ],
  },
  {
    id: "riv-mahanadi",
    name: "Mahanadi River",
    basin: "Mahanadi Basin",
    lengthKm: 900,
    color: "#0369a1",
    weight: 3.2,
    coordinates: [
      [20.55, 81.85], // Sihawa (Dhamtari)
      [20.71, 81.65], // Dhamtari
      [21.18, 81.82], // Rajim
      [21.43, 82.58], // Sirpur
      [21.52, 83.87], // Hirakud Dam (Sambalpur)
      [20.84, 84.32], // Sonepur
      [20.53, 84.85], // Tikarpada (Satkosia)
      [20.46, 85.88], // Cuttack
      [20.26, 86.66], // Paradeep / Bay of Bengal
    ],
  },
  {
    id: "riv-brahmaputra",
    name: "Brahmaputra River System",
    basin: "Brahmaputra Basin",
    lengthKm: 2900,
    color: "#0284c7",
    weight: 3.8,
    coordinates: [
      [28.18, 95.33], // Pasighat (Siang)
      [27.47, 94.91], // Dibrugarh
      [26.98, 94.22], // Majuli Island
      [26.65, 92.80], // Tezpur
      [26.18, 91.75], // Guwahati
      [26.17, 90.62], // Goalpara
      [26.02, 89.97], // Dhubri
      [25.32, 89.65], // Kurigram / Jamuna Confluence
    ],
  },
];

export const macroCatchmentBasins = [
  {
    id: "basin-ganga",
    name: "Indo-Gangetic Macro-Catchment",
    river: "Ganga-Yamuna Network",
    totalAreaSqKm: "861,452",
    states: "Uttarakhand, UP, Bihar, WB, MP, Rajasthan, Haryana, Delhi",
    status: "Active Surveillance",
    color: "#16a34a",
    fillColor: "#22c55e",
    fillOpacity: 0.12,
    coordinates: [
      [31.2, 77.5],
      [30.5, 80.2],
      [28.8, 84.5],
      [27.2, 88.1],
      [24.5, 88.5],
      [23.2, 87.2],
      [23.8, 83.5],
      [24.5, 78.5],
      [26.2, 75.5],
      [28.5, 76.2],
      [30.2, 76.8],
    ],
  },
  {
    id: "basin-godavari",
    name: "Godavari Macro-Catchment",
    river: "Godavari & Tributaries",
    totalAreaSqKm: "312,812",
    states: "Maharashtra, Telangana, Andhra Pradesh, Chhattisgarh, Odisha",
    status: "Integrated Monitoring",
    color: "#16a34a",
    fillColor: "#16a34a",
    fillOpacity: 0.12,
    coordinates: [
      [20.5, 73.4],
      [21.8, 77.2],
      [21.2, 81.1],
      [19.5, 82.4],
      [17.2, 82.2],
      [16.5, 81.5],
      [17.5, 78.2],
      [18.8, 75.1],
      [19.5, 73.6],
    ],
  },
  {
    id: "basin-krishna",
    name: "Krishna-Tungabhadra Basin",
    river: "Krishna, Bhima, Tungabhadra",
    totalAreaSqKm: "258,948",
    states: "Maharashtra, Karnataka, Telangana, Andhra Pradesh",
    status: "Multi-Tier Verification",
    color: "#15803d",
    fillColor: "#15803d",
    fillOpacity: 0.12,
    coordinates: [
      [18.2, 73.5],
      [18.5, 76.5],
      [17.5, 79.5],
      [16.2, 81.2],
      [15.2, 80.4],
      [14.5, 77.2],
      [13.8, 75.5],
      [15.5, 74.2],
      [17.0, 73.7],
    ],
  },
  {
    id: "basin-cauvery",
    name: "Cauvery River Basin",
    river: "Cauvery, Bhavani, Amaravati",
    totalAreaSqKm: "81,155",
    states: "Karnataka, Tamil Nadu, Kerala",
    status: "Soil Moisture Watch",
    color: "#16a34a",
    fillColor: "#4ade80",
    fillOpacity: 0.14,
    coordinates: [
      [13.2, 75.4],
      [13.5, 77.2],
      [12.2, 78.6],
      [11.3, 79.9],
      [10.4, 79.2],
      [10.5, 77.5],
      [11.8, 75.6],
    ],
  },
  {
    id: "basin-narmada-tapi",
    name: "Narmada-Tapi Rift Basin",
    river: "Narmada & Tapi Rivers",
    totalAreaSqKm: "163,000",
    states: "Madhya Pradesh, Maharashtra, Gujarat",
    status: "Continuous Monitoring",
    color: "#16a34a",
    fillColor: "#16a34a",
    fillOpacity: 0.12,
    coordinates: [
      [23.2, 81.8],
      [23.5, 78.5],
      [22.8, 74.5],
      [21.8, 72.6],
      [20.8, 73.2],
      [21.2, 76.5],
      [22.0, 79.2],
    ],
  },
  {
    id: "basin-mahanadi",
    name: "Mahanadi Drainage Basin",
    river: "Mahanadi & Hasdeo Network",
    totalAreaSqKm: "141,589",
    states: "Chhattisgarh, Odisha, Jharkhand, Maharashtra",
    status: "Catchment Rejuvenation",
    color: "#15803d",
    fillColor: "#22c55e",
    fillOpacity: 0.12,
    coordinates: [
      [22.8, 81.5],
      [23.2, 83.5],
      [22.0, 85.2],
      [20.4, 86.8],
      [19.5, 84.5],
      [20.0, 81.2],
      [21.5, 80.8],
    ],
  },
  {
    id: "basin-brahmaputra",
    name: "Brahmaputra Sub-Himalayan Basin",
    river: "Brahmaputra, Siang, Subansiri",
    totalAreaSqKm: "194,413",
    states: "Arunachal Pradesh, Assam, Meghalaya, Nagaland",
    status: "Satellite Early Warning",
    color: "#16a34a",
    fillColor: "#16a34a",
    fillOpacity: 0.12,
    coordinates: [
      [28.8, 94.5],
      [28.2, 96.2],
      [26.8, 95.8],
      [25.4, 92.5],
      [25.2, 89.8],
      [26.5, 90.1],
      [27.5, 92.2],
    ],
  },
];

export const watershedMarkersData = [
  {
    id: "WGH-NK-01",
    name: "Waghad Watershed",
    district: "Nashik",
    state: "Maharashtra",
    basin: "Godavari Basin",
    lat: 20.20,
    lng: 73.95,
    catchmentAreaSqKm: 112.5,
    drainagePattern: "Dendritic System",
    monitoringStatus: "Verified",
    ndviTrend: "+24.2%",
    soilMoisture: "Good (68%)",
    rainfallMm: 684,
    intervention: "Check Dam Series & Gabion",
    confidence: 88,
    priority: "HIGH",
    verifiedDate: "2026-08-12",
  },
  {
    id: "KDW-NK-02",
    name: "Kadwa Sub-Catchment",
    district: "Nashik",
    state: "Maharashtra",
    basin: "Godavari Basin",
    lat: 20.12,
    lng: 73.78,
    catchmentAreaSqKm: 96.8,
    drainagePattern: "Parallel Drainage",
    monitoringStatus: "Action Needed",
    ndviTrend: "+11.5%",
    soilMoisture: "Moderate (52%)",
    rainfallMm: 641,
    intervention: "Earthen Nala Bunds",
    confidence: 76,
    priority: "MEDIUM",
    verifiedDate: "2026-07-28",
  },
  {
    id: "GRN-NK-05",
    name: "Girna Upper Watershed",
    district: "Nashik",
    state: "Maharashtra",
    basin: "Tapi Basin",
    lat: 20.52,
    lng: 74.38,
    catchmentAreaSqKm: 121.7,
    drainagePattern: "Trellis Pattern",
    monitoringStatus: "Verified",
    ndviTrend: "+31.0%",
    soilMoisture: "High (74%)",
    rainfallMm: 725,
    intervention: "Deep CCT & Percolation Tank",
    confidence: 94,
    priority: "HIGH",
    verifiedDate: "2026-08-30",
  },
  {
    id: "RLG-AH-06",
    name: "Ralegan Siddhi Watershed",
    district: "Ahmednagar",
    state: "Maharashtra",
    basin: "Krishna Basin (Bhima)",
    lat: 18.91,
    lng: 74.41,
    catchmentAreaSqKm: 98.2,
    drainagePattern: "Radial Drainage",
    monitoringStatus: "Verified",
    ndviTrend: "+26.8%",
    soilMoisture: "Good (65%)",
    rainfallMm: 490,
    intervention: "Percolation Tank & Bunding",
    confidence: 96,
    priority: "MEDIUM",
    verifiedDate: "2026-08-19",
  },
  {
    id: "HWR-AH-07",
    name: "Hiware Bazar Micro-Catchment",
    district: "Ahmednagar",
    state: "Maharashtra",
    basin: "Krishna Basin (Bhima)",
    lat: 19.06,
    lng: 74.65,
    catchmentAreaSqKm: 82.5,
    drainagePattern: "Dendritic Sub-network",
    monitoringStatus: "Verified",
    ndviTrend: "+21.4%",
    soilMoisture: "Good (61%)",
    rainfallMm: 410,
    intervention: "Continuous Contour Trenching",
    confidence: 89,
    priority: "LOW",
    verifiedDate: "2026-07-14",
  },
  {
    id: "GHD-PN-08",
    name: "Ghod River Sub-Watershed",
    district: "Pune",
    state: "Maharashtra",
    basin: "Krishna Basin (Bhima)",
    lat: 18.88,
    lng: 74.12,
    catchmentAreaSqKm: 118.6,
    drainagePattern: "Rectangular Pattern",
    monitoringStatus: "Under Review",
    ndviTrend: "+14.6%",
    soilMoisture: "Moderate (55%)",
    rainfallMm: 560,
    intervention: "Sub-surface Dyke & Weirs",
    confidence: 79,
    priority: "HIGH",
    verifiedDate: "2026-08-05",
  },
  {
    id: "PEN-AN-19",
    name: "Mid-Pennar Catchment",
    district: "Anantapur",
    state: "Andhra Pradesh",
    basin: "Pennar Basin",
    lat: 14.55,
    lng: 77.12,
    catchmentAreaSqKm: 152.0,
    drainagePattern: "Centripetal Semi-Arid",
    monitoringStatus: "Verified",
    ndviTrend: "+28.5%",
    soilMoisture: "Moderate (58%)",
    rainfallMm: 470,
    intervention: "Sunken Farm Ponds & Desilting",
    confidence: 86,
    priority: "HIGH",
    verifiedDate: "2026-08-22",
  },
  {
    id: "DND-MB-20",
    name: "Dindi River Watershed",
    district: "Mahabubnagar",
    state: "Telangana",
    basin: "Krishna Basin",
    lat: 16.74,
    lng: 78.88,
    catchmentAreaSqKm: 110.8,
    drainagePattern: "Dendritic Network",
    monitoringStatus: "Action Needed",
    ndviTrend: "+12.2%",
    soilMoisture: "Low-Moderate (47%)",
    rainfallMm: 620,
    intervention: "Mini Percolation Tank & Graded Bunds",
    confidence: 74,
    priority: "MEDIUM",
    verifiedDate: "2026-07-31",
  },
  {
    id: "SHT-AM-21",
    name: "Shetrunji River Catchment",
    district: "Amreli",
    state: "Gujarat",
    basin: "Saurashtra Basin",
    lat: 21.60,
    lng: 71.22,
    catchmentAreaSqKm: 128.3,
    drainagePattern: "Radial Saurashtra",
    monitoringStatus: "Verified",
    ndviTrend: "+29.4%",
    soilMoisture: "Good (66%)",
    rainfallMm: 600,
    intervention: "Check Dam & Deepening",
    confidence: 91,
    priority: "HIGH",
    verifiedDate: "2026-08-16",
  },
  {
    id: "NOY-CB-23",
    name: "Noyyal River Basin Unit",
    district: "Coimbatore",
    state: "Tamil Nadu",
    basin: "Cauvery Basin",
    lat: 10.98,
    lng: 76.90,
    catchmentAreaSqKm: 115.4,
    drainagePattern: "Dendritic Fluvial",
    monitoringStatus: "Verified",
    ndviTrend: "+19.8%",
    soilMoisture: "Good (71%)",
    rainfallMm: 710,
    intervention: "Infiltration Wells & Tank Inflow Weirs",
    confidence: 84,
    priority: "MEDIUM",
    verifiedDate: "2026-08-10",
  },
  {
    id: "CHM-KT-11",
    name: "Upper Chambal Basin",
    district: "Kota",
    state: "Rajasthan",
    basin: "Ganga Basin (Yamuna)",
    lat: 25.18,
    lng: 75.84,
    catchmentAreaSqKm: 164.2,
    drainagePattern: "Trellis Ravine System",
    monitoringStatus: "Under Review",
    ndviTrend: "+18.1%",
    soilMoisture: "Moderate (54%)",
    rainfallMm: 670,
    intervention: "Anicut & Ravine Reclamation Bunds",
    confidence: 82,
    priority: "HIGH",
    verifiedDate: "2026-07-22",
  },
  {
    id: "BTW-JH-12",
    name: "Betwa Bundelkhand Unit",
    district: "Jhansi",
    state: "Uttar Pradesh",
    basin: "Ganga Basin (Yamuna)",
    lat: 25.45,
    lng: 78.58,
    catchmentAreaSqKm: 142.5,
    drainagePattern: "Dendritic Hardrock",
    monitoringStatus: "Verified",
    ndviTrend: "+22.7%",
    soilMoisture: "Moderate (56%)",
    rainfallMm: 780,
    intervention: "Haveli Cultivation Bunds & Masonry Check Dams",
    confidence: 87,
    priority: "HIGH",
    verifiedDate: "2026-08-08",
  },
  {
    id: "ALN-CH-15",
    name: "Alaknanda Headwaters",
    district: "Chamoli",
    state: "Uttarakhand",
    basin: "Ganga Basin",
    lat: 30.40,
    lng: 79.33,
    catchmentAreaSqKm: 88.6,
    drainagePattern: "Alpine Braided Glacial",
    monitoringStatus: "Verified",
    ndviTrend: "+8.9%",
    soilMoisture: "High Alpine (82%)",
    rainfallMm: 1120,
    intervention: "Slope Stabilization & Catchment Terraces",
    confidence: 92,
    priority: "LOW",
    verifiedDate: "2026-08-25",
  },
  {
    id: "DMD-HZ-16",
    name: "Damodar Upper Sub-Catchment",
    district: "Hazaribagh",
    state: "Jharkhand",
    basin: "Ganga Basin (Hooghly)",
    lat: 23.98,
    lng: 85.36,
    catchmentAreaSqKm: 134.8,
    drainagePattern: "Dendritic Plateau",
    monitoringStatus: "Verified",
    ndviTrend: "+25.3%",
    soilMoisture: "Good (64%)",
    rainfallMm: 1040,
    intervention: "Mine Spoil Reclamation & Runoff Ponds",
    confidence: 85,
    priority: "MEDIUM",
    verifiedDate: "2026-08-14",
  },
  {
    id: "SBN-RN-17",
    name: "Subarnarekha Headwaters",
    district: "Ranchi",
    state: "Jharkhand",
    basin: "Subarnarekha Basin",
    lat: 23.34,
    lng: 85.31,
    catchmentAreaSqKm: 118.0,
    drainagePattern: "Dendritic Laterite",
    monitoringStatus: "Under Review",
    ndviTrend: "+16.4%",
    soilMoisture: "Moderate (59%)",
    rainfallMm: 1180,
    intervention: "Dobhas (Farm Ponds) & Loose Boulder Structures",
    confidence: 78,
    priority: "MEDIUM",
    verifiedDate: "2026-07-19",
  },
  {
    id: "TNG-KP-18",
    name: "Tungabhadra Semi-Arid Unit",
    district: "Koppal",
    state: "Karnataka",
    basin: "Krishna Basin",
    lat: 15.35,
    lng: 76.15,
    catchmentAreaSqKm: 147.2,
    drainagePattern: "Dendritic Black Soil",
    monitoringStatus: "Action Needed",
    ndviTrend: "+13.1%",
    soilMoisture: "Low-Moderate (49%)",
    rainfallMm: 540,
    intervention: "Percolation Pit Network & Silt Trap Weirs",
    confidence: 81,
    priority: "HIGH",
    verifiedDate: "2026-08-01",
  },
];
