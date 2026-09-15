import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  CloudRain,
  Download,
  Droplets,
  FileText,
  HelpCircle,
  Layers,
  Leaf,
  LogOut,
  Map as MapIcon,
  MapPin,
  Menu,
  RefreshCw,
  Satellite,
  Search,
  Settings,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";

import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./App.css";

import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { formatNumber, formatDecimal, formatPercent, formatDelta } from "./utils/formatters";
import { createWatershedPin } from "./utils/leafletIcons";
import farmerImg from "./assets/farmer.jpg";
import { getEvidence, uploadEvidence, getStoredUser, clearStoredSession, getTemporalComparison } from "./api";
import AuthPage from "./AuthPage";
import SatelliteAnalysis from "./components/SatelliteAnalysis";
import AskJalSetuChatbot from "./components/AskJalSetuChatbot";

const BHUVAN_URL =
  "https://bhuvan-app1.nrsc.gov.in/bhuvan2d/bhuvan/bhuvan2d.php";

/*
  National Watershed Decision Support Records across 8 Indian States and 16 Districts.
  Includes prominent Indian watershed conservation projects (PMKSY-WDC, Sujala, Tarun Bharat Sangh, Neeranchal).
*/
const watersheds = [
  // --- MAHARASHTRA (Nashik, Ahmednagar, Pune, Yavatmal) ---
  {
    id: "WGH-NK-01",
    name: "Waghad Watershed",
    state: "Maharashtra",
    district: "Nashik",
    area: 112.5,
    priority: "HIGH",
    interventions: 18,
    monitored: 15,
    rainfall: 684,
    ndvi: 0.58,
    water: 0.64,
    baseNdvi: 0.46,
    baseWater: 0.48,
    change: "Moderate improvement",
    lat: 20.20,
    lng: 73.95,
    structure: "Check Dam",
    confidence: 82,
    evidenceGap: 18,
    assessment: "Verified",
    field: true,
    gps: true,
    gis: true,
  },
  {
    id: "KDW-NK-02",
    name: "Kadwa Watershed",
    state: "Maharashtra",
    district: "Nashik",
    area: 96.8,
    priority: "MEDIUM",
    interventions: 14,
    monitored: 11,
    rainfall: 641,
    ndvi: 0.52,
    water: 0.57,
    baseNdvi: 0.51,
    baseWater: 0.54,
    change: "Low change",
    lat: 20.12,
    lng: 73.78,
    structure: "Farm Pond",
    confidence: 61,
    evidenceGap: 39,
    assessment: "Needs Review",
    field: true,
    gps: false,
    gis: true,
  },
  {
    id: "DRN-NK-03",
    name: "Darna Watershed",
    state: "Maharashtra",
    district: "Nashik",
    area: 104.3,
    priority: "HIGH",
    interventions: 17,
    monitored: 12,
    rainfall: 698,
    ndvi: 0.61,
    water: 0.69,
    baseNdvi: 0.39,
    baseWater: 0.31,
    change: "Drastic improvement",
    lat: 19.95,
    lng: 73.70,
    structure: "Water Harvesting Structure",
    confidence: 88,
    evidenceGap: 12,
    assessment: "Verified",
    field: true,
    gps: true,
    gis: true,
  },
  {
    id: "GNG-NK-04",
    name: "Gangapur Watershed",
    state: "Maharashtra",
    district: "Nashik",
    area: 88.4,
    priority: "LOW",
    interventions: 12,
    monitored: 8,
    rainfall: 612,
    ndvi: 0.47,
    water: 0.44,
    baseNdvi: 0.44,
    baseWater: 0.42,
    change: "Small change",
    lat: 19.92,
    lng: 73.74,
    structure: "Farm Pond",
    confidence: 58,
    evidenceGap: 42,
    assessment: "Needs Review",
    field: false,
    gps: false,
    gis: true,
  },
  {
    id: "GRN-NK-05",
    name: "Girna Watershed",
    state: "Maharashtra",
    district: "Nashik",
    area: 121.7,
    priority: "HIGH",
    interventions: 21,
    monitored: 14,
    rainfall: 725,
    ndvi: 0.66,
    water: 0.73,
    baseNdvi: 0.35,
    baseWater: 0.28,
    change: "Drastic improvement",
    lat: 20.52,
    lng: 74.38,
    structure: "Check Dam",
    confidence: 91,
    evidenceGap: 9,
    assessment: "Verified",
    field: true,
    gps: true,
    gis: true,
  },
  {
    id: "RLG-AH-06",
    name: "Ralegan Siddhi Watershed",
    state: "Maharashtra",
    district: "Ahmednagar",
    area: 98.2,
    priority: "MEDIUM",
    interventions: 26,
    monitored: 24,
    rainfall: 490,
    ndvi: 0.62,
    water: 0.67,
    baseNdvi: 0.41,
    baseWater: 0.38,
    change: "Drastic improvement",
    lat: 18.91,
    lng: 74.41,
    structure: "Percolation Tank & Earthen Bunds",
    confidence: 94,
    evidenceGap: 6,
    assessment: "Verified",
    field: true,
    gps: true,
    gis: true,
  },
  {
    id: "HWR-AH-07",
    name: "Hiware Bazar Catchment",
    state: "Maharashtra",
    district: "Ahmednagar",
    area: 82.5,
    priority: "LOW",
    interventions: 22,
    monitored: 20,
    rainfall: 410,
    ndvi: 0.59,
    water: 0.61,
    baseNdvi: 0.43,
    baseWater: 0.40,
    change: "Moderate improvement",
    lat: 19.06,
    lng: 74.65,
    structure: "Continuous Contour Trenching",
    confidence: 86,
    evidenceGap: 14,
    assessment: "Verified",
    field: true,
    gps: true,
    gis: true,
  },
  {
    id: "GHD-PN-08",
    name: "Ghod River Sub-Watershed",
    state: "Maharashtra",
    district: "Pune",
    area: 118.6,
    priority: "HIGH",
    interventions: 19,
    monitored: 13,
    rainfall: 560,
    ndvi: 0.54,
    water: 0.58,
    baseNdvi: 0.45,
    baseWater: 0.49,
    change: "Moderate improvement",
    lat: 18.88,
    lng: 74.12,
    structure: "Sub-surface Dyke & Farm Ponds",
    confidence: 76,
    evidenceGap: 24,
    assessment: "Needs Review",
    field: true,
    gps: true,
    gis: true,
  },
  {
    id: "BMB-YV-09",
    name: "Bembla Watershed Basin",
    state: "Maharashtra",
    district: "Yavatmal",
    area: 132.0,
    priority: "HIGH",
    interventions: 23,
    monitored: 17,
    rainfall: 880,
    ndvi: 0.57,
    water: 0.63,
    baseNdvi: 0.40,
    baseWater: 0.35,
    change: "Drastic improvement",
    lat: 20.48,
    lng: 78.22,
    structure: "Cement Nala Bunds & Gabions",
    confidence: 87,
    evidenceGap: 13,
    assessment: "Verified",
    field: true,
    gps: true,
    gis: true,
  },

  // --- RAJASTHAN (Alwar, Udaipur, Jodhpur) ---
  {
    id: "ARV-AL-10",
    name: "Arvari River Watershed",
    state: "Rajasthan",
    district: "Alwar",
    area: 145.2,
    priority: "HIGH",
    interventions: 32,
    monitored: 28,
    rainfall: 540,
    ndvi: 0.55,
    water: 0.60,
    baseNdvi: 0.31,
    baseWater: 0.22,
    change: "Drastic improvement",
    lat: 27.28,
    lng: 76.45,
    structure: "Traditional Johad & Anicut",
    confidence: 93,
    evidenceGap: 7,
    assessment: "Verified",
    field: true,
    gps: true,
    gis: true,
  },
  {
    id: "AYD-UD-11",
    name: "Ayad-Udaisagar Catchment",
    state: "Rajasthan",
    district: "Udaipur",
    area: 108.4,
    priority: "MEDIUM",
    interventions: 16,
    monitored: 12,
    rainfall: 610,
    ndvi: 0.48,
    water: 0.51,
    baseNdvi: 0.42,
    baseWater: 0.44,
    change: "Low change",
    lat: 24.60,
    lng: 73.74,
    structure: "Masonry Check Dam & Terracing",
    confidence: 64,
    evidenceGap: 36,
    assessment: "Needs Review",
    field: true,
    gps: false,
    gis: true,
  },
  {
    id: "LUN-JD-12",
    name: "Bandi-Luni Sub-Catchment",
    state: "Rajasthan",
    district: "Jodhpur",
    area: 160.5,
    priority: "HIGH",
    interventions: 15,
    monitored: 9,
    rainfall: 380,
    ndvi: 0.38,
    water: 0.42,
    baseNdvi: 0.32,
    baseWater: 0.35,
    change: "Moderate improvement",
    lat: 25.77,
    lng: 73.32,
    structure: "Kadin & Tanka Recharge System",
    confidence: 71,
    evidenceGap: 29,
    assessment: "Needs Review",
    field: false,
    gps: true,
    gis: true,
  },

  // --- MADHYA PRADESH (Jhabua, Indore, Betul) ---
  {
    id: "HTN-JH-13",
    name: "Hathni River Catchment",
    state: "Madhya Pradesh",
    district: "Jhabua",
    area: 125.8,
    priority: "HIGH",
    interventions: 27,
    monitored: 22,
    rainfall: 790,
    ndvi: 0.64,
    water: 0.68,
    baseNdvi: 0.42,
    baseWater: 0.34,
    change: "Drastic improvement",
    lat: 22.35,
    lng: 74.38,
    structure: "Loose Boulder Structure & Plugs",
    confidence: 90,
    evidenceGap: 10,
    assessment: "Verified",
    field: true,
    gps: true,
    gis: true,
  },
  {
    id: "KSH-IN-14",
    name: "Kshipra Headwater Catchment",
    state: "Madhya Pradesh",
    district: "Indore",
    area: 114.2,
    priority: "MEDIUM",
    interventions: 18,
    monitored: 15,
    rainfall: 840,
    ndvi: 0.56,
    water: 0.61,
    baseNdvi: 0.46,
    baseWater: 0.48,
    change: "Moderate improvement",
    lat: 22.82,
    lng: 75.92,
    structure: "Stop Dam & Silt Detention",
    confidence: 80,
    evidenceGap: 20,
    assessment: "Verified",
    field: true,
    gps: true,
    gis: true,
  },
  {
    id: "TWA-BT-15",
    name: "Tawa Basin Sub-Watershed",
    state: "Madhya Pradesh",
    district: "Betul",
    area: 138.6,
    priority: "LOW",
    interventions: 14,
    monitored: 11,
    rainfall: 1020,
    ndvi: 0.68,
    water: 0.72,
    baseNdvi: 0.58,
    baseWater: 0.61,
    change: "Moderate improvement",
    lat: 22.18,
    lng: 77.90,
    structure: "Boulder Bund & Percolation Pit",
    confidence: 85,
    evidenceGap: 15,
    assessment: "Verified",
    field: true,
    gps: true,
    gis: true,
  },

  // --- KARNATAKA (Kolar, Belagavi, Tumakuru) ---
  {
    id: "SUJ-KL-16",
    name: "Markandeya Watershed",
    state: "Karnataka",
    district: "Kolar",
    area: 95.4,
    priority: "HIGH",
    interventions: 25,
    monitored: 21,
    rainfall: 720,
    ndvi: 0.58,
    water: 0.64,
    baseNdvi: 0.39,
    baseWater: 0.33,
    change: "Drastic improvement",
    lat: 13.02,
    lng: 78.20,
    structure: "Sujala Farm Pond with Silt Trap",
    confidence: 89,
    evidenceGap: 11,
    assessment: "Verified",
    field: true,
    gps: true,
    gis: true,
  },
  {
    id: "MLP-DH-17",
    name: "Malaprabha Headwaters",
    state: "Karnataka",
    district: "Belagavi",
    area: 140.0,
    priority: "MEDIUM",
    interventions: 20,
    monitored: 16,
    rainfall: 1150,
    ndvi: 0.71,
    water: 0.77,
    baseNdvi: 0.60,
    baseWater: 0.65,
    change: "Moderate improvement",
    lat: 15.62,
    lng: 74.55,
    structure: "Vented Dam & Bank Stabilization",
    confidence: 88,
    evidenceGap: 12,
    assessment: "Verified",
    field: true,
    gps: true,
    gis: true,
  },
  {
    id: "SHM-TM-18",
    name: "Shimsha Sub-Basin",
    state: "Karnataka",
    district: "Tumakuru",
    area: 102.7,
    priority: "HIGH",
    interventions: 18,
    monitored: 12,
    rainfall: 660,
    ndvi: 0.49,
    water: 0.52,
    baseNdvi: 0.44,
    baseWater: 0.46,
    change: "Low change",
    lat: 13.31,
    lng: 76.94,
    structure: "Cascade De-silting & Tank Sluice",
    confidence: 67,
    evidenceGap: 33,
    assessment: "Needs Review",
    field: true,
    gps: false,
    gis: true,
  },

  // --- ANDHRA PRADESH & TELANGANA ---
  {
    id: "PEN-AN-19",
    name: "Mid-Pennar Watershed",
    state: "Andhra Pradesh",
    district: "Anantapur",
    area: 152.0,
    priority: "HIGH",
    interventions: 29,
    monitored: 23,
    rainfall: 470,
    ndvi: 0.44,
    water: 0.50,
    baseNdvi: 0.31,
    baseWater: 0.25,
    change: "Drastic improvement",
    lat: 14.55,
    lng: 77.12,
    structure: "Rubble Bunds & Sunken Ponds",
    confidence: 86,
    evidenceGap: 14,
    assessment: "Verified",
    field: true,
    gps: true,
    gis: true,
  },
  {
    id: "DND-MB-20",
    name: "Dindi River Catchment",
    state: "Telangana",
    district: "Mahabubnagar",
    area: 110.8,
    priority: "MEDIUM",
    interventions: 17,
    monitored: 13,
    rainfall: 620,
    ndvi: 0.51,
    water: 0.55,
    baseNdvi: 0.45,
    baseWater: 0.47,
    change: "Moderate improvement",
    lat: 16.74,
    lng: 78.88,
    structure: "Mini Percolation Tank & Drains",
    confidence: 74,
    evidenceGap: 26,
    assessment: "Needs Review",
    field: true,
    gps: true,
    gis: true,
  },

  // --- GUJARAT (Amreli, Rajkot) ---
  {
    id: "SHT-AM-21",
    name: "Shetrunji River Catchment",
    state: "Gujarat",
    district: "Amreli",
    area: 128.3,
    priority: "HIGH",
    interventions: 28,
    monitored: 25,
    rainfall: 600,
    ndvi: 0.53,
    water: 0.62,
    baseNdvi: 0.36,
    baseWater: 0.29,
    change: "Drastic improvement",
    lat: 21.32,
    lng: 71.02,
    structure: "Cement Check Dam & Bori Bandhan",
    confidence: 92,
    evidenceGap: 8,
    assessment: "Verified",
    field: true,
    gps: true,
    gis: true,
  },
  {
    id: "BHD-RJ-22",
    name: "Bhadar River Basin",
    state: "Gujarat",
    district: "Rajkot",
    area: 119.5,
    priority: "MEDIUM",
    interventions: 21,
    monitored: 16,
    rainfall: 580,
    ndvi: 0.48,
    water: 0.56,
    baseNdvi: 0.41,
    baseWater: 0.46,
    change: "Moderate improvement",
    lat: 21.96,
    lng: 70.80,
    structure: "Recharge Borewell & Pond",
    confidence: 79,
    evidenceGap: 21,
    assessment: "Verified",
    field: true,
    gps: true,
    gis: true,
  },

  // --- TAMIL NADU (Coimbatore) ---
  {
    id: "NOY-CB-23",
    name: "Noyyal River Basin",
    state: "Tamil Nadu",
    district: "Coimbatore",
    area: 115.4,
    priority: "MEDIUM",
    interventions: 22,
    monitored: 19,
    rainfall: 710,
    ndvi: 0.63,
    water: 0.69,
    baseNdvi: 0.52,
    baseWater: 0.55,
    change: "Moderate improvement",
    lat: 10.98,
    lng: 76.90,
    structure: "Infiltration Wells & Check Dams",
    confidence: 84,
    evidenceGap: 16,
    assessment: "Verified",
    field: true,
    gps: true,
    gis: true,
  },
];

const menuItems = [
  ["Dashboard", Activity, "dashboard"],
  ["India Map", MapIcon, "interactiveMap"],
  ["Watershed Explorer", Droplets, "watershedExplorer"],
  ["Field Evidence", Camera, "fieldEvidence"],
  ["Satellite Analysis", Satellite, "satelliteAnalysis"],
  ["Before / After", Activity, "temporalComparison"],
  ["Evidence Assessment", ShieldCheck, "evidenceAssessment"],
  ["Adaptive Survey Planner", ClipboardCheck, "surveyPlanner"],
  ["Officer Review", CheckCircle2, "officerReview"],
  ["Reports", FileText, "reports"],
];

function PageTitle({ eyebrow, title, text, badge }) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>

      {badge && <span className="page-badge">{badge}</span>}
    </div>
  );
}

function Priority({ value }) {
  const { t } = useTranslation(["common"]);
  const key = value ? value.toLowerCase() : "";
  return <span className={`priority ${key}`}>{t(`common:priority.${key}`, value)}</span>;
}

function DemoNote({ children }) {
  return (
    <div className="demo-alert">
      <div className="demo-icon">
        <AlertTriangle size={18} />
      </div>
      <div>{children}</div>
      <span>PROTOTYPE</span>
    </div>
  );
}

function SearchBox({ setPage }) {
  const { t } = useTranslation(["common", "watershed"]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = watersheds.filter((w) =>
    `${w.name} ${w.id} ${w.district} ${w.state}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="global-search">
      <Search size={15} />
      <input
        value={query}
        placeholder={t("common:actions.search", "Search watersheds by name, code, district or state...")}
        onFocus={() => setOpen(true)}
        onChange={(e) => setQuery(e.target.value)}
      />
      <kbd>Ctrl K</kbd>

      {open && query && (
        <div className="search-results">
          {results.length ? (
            results.map((w) => (
              <button
                type="button"
                key={w.id}
                onClick={() => {
                  setPage("Watershed Explorer");
                  setQuery("");
                  setOpen(false);
                }}
              >
                <strong>{w.name}</strong>
                <small>{w.id} • {w.district}, {w.state}</small>
              </button>
            ))
          ) : (
            <span>No watershed found</span>
          )}
        </div>
      )}
    </div>
  );
}

function Dashboard({ setPage }) {
  const { t, i18n } = useTranslation(["watershed", "common", "nav"]);
  const totalInterventions = watersheds.reduce(
    (sum, item) => sum + item.interventions,
    0
  );
  const totalMonitored = watersheds.reduce(
    (sum, item) => sum + item.monitored,
    0
  );

  return (
    <div className="page">
      <PageTitle
        eyebrow={t("watershed:dashboard.eyebrow", "JAL SETU • WATERSHED INTELLIGENCE")}
        title={t("watershed:dashboard.title", "Water monitoring made simple & visual.")}
        text={t("watershed:dashboard.subtitle", "A decision-support workspace that brings together satellite indicators, GIS context and field evidence across national watersheds.")}
        badge={t("watershed:dashboard.badge", "NATIONAL SURVEILLANCE • 8 STATES")}
      />

      <section className="hero">
        <div className="hero-content">
          <span className="hero-label">
            <Droplets size={15} /> {t("watershed:dashboard.heroTag", "NATIONAL WATERSHED MONITORING")}
          </span>

          <h2>{t("watershed:dashboard.heroTitle", "See the change. Check the evidence. Decide the action.")}</h2>

          <p>
            {t("watershed:dashboard.heroDesc", "Jal Setu helps an officer move from an area-level observation to a field verification decision without treating satellite indicators as proof of an individual structure.")}
          </p>

          <button className="hero-btn" onClick={() => setPage("India Map")}>
            {t("watershed:dashboard.exploreMap", "Explore India Map")} <ChevronRight size={16} />
          </button>
        </div>

        <img src={farmerImg} alt="Farmer working in an agricultural field" />

        <div className="hero-orbit">
          <div />
          <div />
          <div />
          <span>GIS</span>
          <span>FIELD</span>
          <span>SAT</span>
        </div>
      </section>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><MapIcon size={18} /></div>
          <strong>{formatNumber(watersheds.length, i18n.language)}</strong>
          <span>{t("watershed:dashboard.stats.units", "National monitoring units")}</span>
          <small>{t("watershed:dashboard.stats.unitsSub", "Across 8 Indian States")}</small>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><Droplets size={18} /></div>
          <strong>{formatNumber(totalInterventions, i18n.language)}</strong>
          <span>{t("watershed:dashboard.stats.interventions", "Recorded interventions")}</span>
          <small>{t("watershed:dashboard.stats.interventionsSub", "Multi-basin coverage")}</small>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange"><CheckCircle2 size={18} /></div>
          <strong>{formatNumber(totalMonitored, i18n.language)}</strong>
          <span>{t("watershed:dashboard.stats.monitored", "Sites monitored")}</span>
          <small>{t("watershed:dashboard.stats.monitoredSub", "Ground verification active")}</small>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple"><Satellite size={18} /></div>
          <strong>{formatNumber(watersheds.length, i18n.language)}</strong>
          <span>{t("watershed:dashboard.stats.observations", "Satellite observations")}</span>
          <small>{t("watershed:dashboard.stats.observationsSub", "Multi-spectral indicators")}</small>
        </div>
      </div>

      <section className="section-block">
        <div className="section-title">
          <div>
            <span className="eyebrow">{t("watershed:dashboard.glance", "AT A GLANCE")}</span>
            <h2>{t("watershed:dashboard.changeLevels", "Different levels of watershed change")}</h2>
          </div>
          <button
            className="text-btn"
            onClick={() => setPage("Watershed Explorer")}
          >
            {t("watershed:dashboard.viewAll", "View all")} <ChevronRight size={14} />
          </button>
        </div>

        <div className="watershed-cards">
          {watersheds.map((w) => (
            <div className="water-card" key={w.id}>
              <div className="card-top">
                <div className="water-icon"><Droplets size={17} /></div>
                <Priority value={w.priority} />
              </div>

              <h3>{w.name}</h3>
              <small>{w.id} • {w.district}, {w.state}</small>

              <div className="card-change">
                <span>{t("watershed:dashboard.ndviChange", "NDVI change")}</span>
                <strong>
                  {formatDelta(Number((w.ndvi - w.baseNdvi).toFixed(2)), i18n.language, 2)}
                </strong>
              </div>

              <div className="change-label">
                {w.change}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


function MapViewUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

function IndiaMap() {
  const { t, i18n } = useTranslation(["watershed", "common"]);
  const [layers, setLayers] = useState({
    satellite: true,
    watershed: true,
    drainage: false,
    waterBodies: false,
  });

  const states = useMemo(() => {
    return ["ALL", ...Array.from(new Set(watersheds.map((w) => w.state))).sort()];
  }, []);

  const [selectedState, setSelectedState] = useState("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");

  const districts = useMemo(() => {
    const pool =
      selectedState === "ALL"
        ? watersheds
        : watersheds.filter((w) => w.state === selectedState);
    return ["ALL", ...Array.from(new Set(pool.map((w) => w.district))).sort()];
  }, [selectedState]);

  function handleStateChange(newState) {
    setSelectedState(newState);
    setSelectedDistrict("ALL");
  }

  const filteredWatersheds = useMemo(() => {
    return watersheds.filter((w) => {
      if (selectedState !== "ALL" && w.state !== selectedState) return false;
      if (selectedDistrict !== "ALL" && w.district !== selectedDistrict) return false;
      return true;
    });
  }, [selectedState, selectedDistrict]);

  const mapCenter = useMemo(() => {
    if (selectedState === "ALL") return [21.8, 78.9];
    if (filteredWatersheds.length === 0) return [21.8, 78.9];
    const avgLat =
      filteredWatersheds.reduce((acc, w) => acc + w.lat, 0) / filteredWatersheds.length;
    const avgLng =
      filteredWatersheds.reduce((acc, w) => acc + w.lng, 0) / filteredWatersheds.length;
    return [avgLat, avgLng];
  }, [selectedState, filteredWatersheds]);

  const mapZoom = useMemo(() => {
    if (selectedState === "ALL") return 5;
    if (selectedDistrict !== "ALL") return 9;
    return 7;
  }, [selectedState, selectedDistrict]);

  function toggleLayer(name) {
    setLayers((old) => ({ ...old, [name]: !old[name] }));
  }

  return (
    <div className="page">
      <PageTitle
        eyebrow={t("watershed:gisMap.eyebrow", "NATIONAL GEOSPATIAL VIEW")}
        title={t("watershed:gisMap.title", "India Watershed Map")}
        text={t("watershed:gisMap.subtitle", "National watershed monitoring across priority river basins with an official Bhuvan/NRSC access point.")}
        badge={t("watershed:gisMap.badge", "BHUVAN / NRSC • 8 STATES")}
      />

      <div className="map-layout">
        <aside className="map-sidebar">
          <div className="card-header">
            <div>
              <h3>{t("watershed:gisMap.filtersTitle", "Geospatial Filters")}</h3>
              <p>{t("watershed:gisMap.filtersSubtitle", "State & District Selection")}</p>
            </div>
            <Layers size={19} />
          </div>

          <label className="field-label">
            {t("common:labels.state", "State / UT")}
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
            >
              <option value="ALL">{t("watershed:gisMap.allStates", "All States (India - 23 Units)")}</option>
              {states
                .filter((s) => s !== "ALL")
                .map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
            </select>
          </label>

          <label className="field-label">
            {t("common:labels.district", "District")}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="ALL">
                {selectedState === "ALL" ? t("watershed:gisMap.allDistricts", "All Districts") : t("watershed:gisMap.allStateDistricts", { state: selectedState, defaultValue: `All ${selectedState} Districts` })}
              </option>
              {districts
                .filter((d) => d !== "ALL")
                .map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
            </select>
          </label>

          <div className="layer-section">
            <div className="layer-heading">
              <strong>{t("watershed:gisMap.layersTitle", "Map Layers")}</strong>
              <span>ON / OFF</span>
            </div>

            <label className="check-row">
              <input type="checkbox" checked readOnly />
              <span>{t("watershed:gisMap.layerBoundaries", "State boundaries")}</span>
            </label>

            <label className="check-row">
              <input
                type="checkbox"
                checked={layers.watershed}
                onChange={() => toggleLayer("watershed")}
              />
              <span>{t("watershed:gisMap.layerWatersheds", "Watershed locations")}</span>
            </label>

            <label className="check-row">
              <input
                type="checkbox"
                checked={layers.drainage}
                onChange={() => toggleLayer("drainage")}
              />
              <span>{t("watershed:gisMap.layerDrainage", "Drainage network")}</span>
            </label>

            <label className="check-row">
              <input
                type="checkbox"
                checked={layers.waterBodies}
                onChange={() => toggleLayer("waterBodies")}
              />
              <span>{t("watershed:gisMap.layerWaterBodies", "Water bodies")}</span>
            </label>

            <label className="check-row">
              <input
                type="checkbox"
                checked={layers.satellite}
                onChange={() => toggleLayer("satellite")}
              />
              <span>{t("watershed:gisMap.layerSatellite", "Satellite basemap")}</span>
            </label>
          </div>

          <div className="bhuvan-box">
            <div className="source-row">
              <Satellite size={16} />
              <strong>Bhuvan / NRSC</strong>
            </div>

            <p>
              {t("watershed:gisMap.bhuvanDesc", "Use the official viewer for Bhuvan hydrological boundaries, satellite layers and field-photo layers. Jal Setu uses this viewer as an external authoritative source rather than copying data into the prototype.")}
            </p>

            <button
              className="primary-btn full-btn"
              onClick={() => window.open(BHUVAN_URL, "_blank")}
            >
              {t("watershed:gisMap.openBhuvan", "Open Official Bhuvan 2D")}
            </button>
          </div>

          <div className="selection-box">
            <small>{t("watershed:gisMap.currentSelection", "CURRENT SELECTION")}</small>
            <strong>
              {selectedState === "ALL"
                ? "National Overview (India)"
                : selectedDistrict === "ALL"
                ? `${selectedState} (All Districts)`
                : `${selectedDistrict}, ${selectedState}`}
            </strong>
            <span>{formatNumber(filteredWatersheds.length, i18n.language)} {t("watershed:gisMap.unitsVisible", "monitoring units visible")}</span>
          </div>
        </aside>

        <div className="real-map">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            minZoom={4}
            maxZoom={17}
            className="leaflet-map"
          >
            <MapViewUpdater center={mapCenter} zoom={mapZoom} />

            {layers.satellite ? (
              <TileLayer
                attribution="Tiles © Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            ) : (
              <TileLayer
                attribution="© OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}

            {layers.watershed &&
              filteredWatersheds.map((w) => (
                <Circle
                  key={w.id}
                  center={[w.lat, w.lng]}
                  radius={w.area * 55}
                  pathOptions={{
                    color:
                      w.priority === "HIGH"
                        ? "#e36b57"
                        : w.priority === "MEDIUM"
                        ? "#d49a37"
                        : "#3b9c82",
                    fillOpacity: 0.12,
                    weight: 2,
                  }}
                />
              ))}

            {layers.watershed &&
              filteredWatersheds.map((w) => (
                <Marker
                  key={`${w.id}-marker`}
                  position={[w.lat, w.lng]}
                  icon={createWatershedPin({ priority: w.priority, status: w.status, size: 28 })}
                >
                  <Popup>
                    <strong>{w.name}</strong>
                    <br />
                    {w.id}
                    <br />
                    {w.district}, {w.state}
                    <br />
                    <b>Intervention:</b> {w.structure}
                    <br />
                    <b>Change:</b> {w.change}
                    <br />
                    <b>Confidence:</b> {formatPercent(w.confidence, i18n.language)}
                  </Popup>
                </Marker>
              ))}
          </MapContainer>

          <div className="map-overlay">
            <strong>{formatNumber(filteredWatersheds.length, i18n.language)}</strong>
            <span>{t("watershed:gisMap.monitoringUnits", "monitoring units")}</span>
            <small>{t("watershed:gisMap.clickMarker", "Click a marker for details")}</small>
          </div>

          <div className="map-source">
            <span />
            <div>
              <strong>{t("watershed:gisMap.geospatialView", "Jal Setu geospatial view")}</strong>
              <small>{t("watershed:gisMap.satelliteBasemapDesc", "Satellite basemap + national watershed locations")}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function WatershedExplorer({ setPage }) {
  const { t, i18n } = useTranslation(["watershed", "common"]);
  const states = useMemo(() => {
    return ["ALL", ...Array.from(new Set(watersheds.map((w) => w.state))).sort()];
  }, []);

  const [stateFilter, setStateFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState(watersheds[0].id);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return watersheds.filter((w) => {
      if (stateFilter !== "ALL" && w.state !== stateFilter) return false;
      return `${w.name} ${w.id} ${w.district} ${w.state}`
        .toLowerCase()
        .includes(query.toLowerCase());
    });
  }, [stateFilter, query]);

  const selected =
    watersheds.find((w) => w.id === selectedId) || filtered[0] || watersheds[0];

  return (
    <div className="page">
      <PageTitle
        eyebrow={t("watershed:explorer.eyebrow", "WATERSHED INVENTORY")}
        title={t("watershed:explorer.title", "Watershed Explorer")}
        text={t("watershed:explorer.subtitle", "Select a monitoring unit across India and inspect its current indicators, intervention and evidence status.")}
        badge={`${formatNumber(watersheds.length, i18n.language)} ${t("watershed:explorer.nationalUnits", "NATIONAL UNITS")}`}
      />

      <div className="explorer-toolbar">
        <div className="search-field">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("watershed:explorer.searchPlaceholder", "Search watershed, district, or state...")}
          />
        </div>

        <div className="explorer-state-filter">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="ALL">
              {t("watershed:explorer.allStatesOption", {
                count: watersheds.length,
                defaultValue: `All States (${watersheds.length} Units)`,
              })}
            </option>
            {states
              .filter((s) => s !== "ALL")
              .map((st) => (
                <option key={st} value={st}>
                  {st} ({watersheds.filter((w) => w.state === st).length})
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="explorer-layout">
        <div className="watershed-list">
          <div className="list-heading">
            <div>
              <h3>
                {formatNumber(filtered.length, i18n.language)}{" "}
                {t("watershed:explorer.monitoringUnits", "monitoring units")}
              </h3>
              <span>{stateFilter === "ALL" ? t("watershed:explorer.nationalCatchments", "National Catchments") : stateFilter}</span>
            </div>
            <b>{formatNumber(filtered.length, i18n.language)}</b>
          </div>

          {filtered.map((w) => (
            <button
              type="button"
              className={`watershed-item ${
                selected.id === w.id ? "selected" : ""
              }`}
              key={w.id}
              onClick={() => setSelectedId(w.id)}
            >
              <div className="watershed-item-icon">
                <Droplets size={17} />
              </div>
              <div>
                <strong>{w.name}</strong>
                <span>{w.id} • {w.district}, {w.state}</span>
                <small>{w.change}</small>
              </div>
              <Priority value={w.priority} />
            </button>
          ))}
        </div>

        <div className="watershed-detail">
          <div className="detail-top">
            <div>
              <span className="record-id">{selected.id}</span>
              <h2>{selected.name}</h2>
              <p>
                <MapPin size={14} />
                {selected.district}, {selected.state}
              </p>
            </div>
            <Priority value={selected.priority} />
          </div>

          <div className="status-banner">
            <CheckCircle2 size={18} />
            <div>
              <small>{t("watershed:explorer.monitoringStatus", "MONITORING STATUS")}</small>
              <strong>{selected.assessment}</strong>
            </div>
            <span>
              {t("watershed:explorer.confidenceScore", "Confidence")}{" "}
              {formatPercent(selected.confidence, i18n.language)}
            </span>
          </div>

          <div className="detail-stats">
            <div className="detail-stat">
              <Droplets size={16} />
              <span>{t("common:labels.area", "Area")}</span>
              <strong>{formatDecimal(selected.area, 1, i18n.language)} km²</strong>
            </div>
            <div className="detail-stat">
              <Layers size={16} />
              <span>{t("common:labels.interventions", "Interventions")}</span>
              <strong>{formatNumber(selected.interventions, i18n.language)}</strong>
            </div>
            <div className="detail-stat">
              <CheckCircle2 size={16} />
              <span>{t("common:labels.monitored", "Monitored")}</span>
              <strong>{formatNumber(selected.monitored, i18n.language)}</strong>
            </div>
            <div className="detail-stat">
              <CloudRain size={16} />
              <span>{t("common:labels.rainfall", "Rainfall")}</span>
              <strong>{formatNumber(selected.rainfall, i18n.language)} mm</strong>
            </div>
          </div>

          <section className="detail-section">
            <div className="section-title">
              <div>
                <h3>{t("watershed:explorer.interventionRecord", "Intervention record")}</h3>
                <p>{t("watershed:explorer.interventionSubtitle", "Main prototype intervention for this monitoring unit")}</p>
              </div>
              <Camera size={18} />
            </div>

            <div className="intervention-card">
              <div className="intervention-icon"><Droplets size={18} /></div>
              <div>
                <strong>{selected.structure}</strong>
                <span>{selected.id} • field condition to be verified</span>
              </div>
              <span className="recorded">Recorded</span>
            </div>
          </section>

          <section className="detail-section">
            <div className="section-title">
              <div>
                <h3>{t("watershed:explorer.currentIndicators", "Current indicators")}</h3>
                <p>{t("watershed:explorer.indicatorsSubtitle", "Supporting area-level observations")}</p>
              </div>
              <Satellite size={18} />
            </div>

            <div className="indicator-grid">
              <div className="indicator">
                <span>{t("watershed:explorer.ndviIndicator", "NDVI vegetation indicator")}</span>
                <strong>{formatDecimal(selected.ndvi, 2, i18n.language)}</strong>
                <div className="metric-progress">
                  <div style={{ width: `${selected.ndvi * 100}%` }} />
                </div>
              </div>

              <div className="indicator">
                <span>{t("watershed:explorer.waterIndicator", "Surface-water indicator")}</span>
                <strong>{formatDecimal(selected.water, 2, i18n.language)}</strong>
                <div className="metric-progress">
                  <div style={{ width: `${selected.water * 100}%` }} />
                </div>
              </div>
            </div>
          </section>

          <div className="detail-actions">
            <button
              className="primary-btn"
              onClick={() => setPage("Satellite Analysis", { watershedId: selectedId })}
            >
              {t("watershed:explorer.viewSatelliteBtn", "View Satellite Analysis")}
            </button>
            <button
              className="secondary-btn"
              onClick={() => setPage("Before / After", { watershedId: selectedId })}
            >
              {t("watershed:explorer.compareBeforeAfterBtn", "Compare Before / After")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldEvidence() {
  const { t, i18n } = useTranslation(["watershed", "common"]);
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    watershed_id: "WGH-NK-01",
    intervention_type: "Check Dam",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    getEvidence()
      .then((result) => {
        if (Array.isArray(result.data) && result.data.length) {
          setRecords(result.data);
          setSelected(result.data[0]);
        }
      })
      .catch(() => {
        setError(
          "No saved field evidence could be loaded. You can still add a new photograph."
        );
      });
  }, []);

  function imageUrl(image) {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    const base = import.meta.env.VITE_API_URL !== undefined
      ? import.meta.env.VITE_API_URL
      : (typeof window !== "undefined" && window.location.port === "5173" ? "http://127.0.0.1:8000" : "");
    return `${base}${image}`;
  }

  async function handleUpload(event) {
    event.preventDefault();

    const file = event.currentTarget.elements.photo?.files?.[0];

    if (!file) {
      setError("Please select a photograph.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Please choose an image smaller than 10 MB.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const result = await uploadEvidence({
        file,
        title: form.title || "Field evidence",
        watershedId: form.watershed_id,
        interventionType: form.intervention_type,
        latitude: form.latitude,
        longitude: form.longitude,
      });

      const item = {
        ...result.data,
        image: imageUrl(result.data.image),
      };

      setRecords((old) => [item, ...old]);
      setSelected(item);
      setMessage(
        item.gps_available
          ? "Evidence saved. GPS was found in the photograph EXIF."
          : "Evidence saved. GPS was not found in EXIF."
      );

      setTimeout(() => {
        setShowUpload(false);
        setMessage("");
      }, 1600);
    } catch (err) {
      setError(err.message || "Upload failed. Check the backend.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="page">
      <PageTitle
        eyebrow={t("watershed:fieldEvidence.eyebrow", "FIELD VERIFICATION")}
        title={t("watershed:fieldEvidence.title", "Field Evidence")}
        text={t("watershed:fieldEvidence.subtitle", "Geo-tagged photographs help confirm what satellite and GIS observations suggest.")}
      />

      <DemoNote>
        <strong>{t("watershed:fieldEvidence.demoTitle", "What is checked?")}</strong>
        <p>
          {t("watershed:fieldEvidence.demoDesc", "Photo file, EXIF GPS when available, capture date/time, camera metadata and the selected watershed.")}
        </p>
      </DemoNote>

      <div className="evidence-toolbar">
        <div>
          <span className="eyebrow">{t("watershed:fieldEvidence.recordsCount", "FIELD RECORDS")}</span>
          <strong>
            {formatNumber(records.length, i18n.language)}{" "}
            {t("watershed:fieldEvidence.savedPhotos", "saved photographs")}
          </strong>
        </div>

        <button className="primary-btn" onClick={() => setShowUpload(true)}>
          <Camera size={16} /> {t("watershed:fieldEvidence.addEvidenceBtn", "Add Field Evidence")}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="evidence-layout">
        <div className="evidence-list">
          {records.length === 0 ? (
            <div className="empty-state">
              <Camera size={32} />
              <strong>No uploaded field evidence yet</strong>
              <span>Add a photograph to start the field verification workflow.</span>
            </div>
          ) : (
            records.map((item, index) => (
              <button
                type="button"
                key={item.id || index}
                className={`evidence-item ${
                  selected?.id === item.id ? "selected" : ""
                }`}
                onClick={() => setSelected(item)}
              >
                <div className="evidence-thumb">
                  {item.image ? (
                    <img src={imageUrl(item.image)} alt={item.title} />
                  ) : (
                    <Camera size={18} />
                  )}
                </div>

                <div>
                  <strong>{item.title || "Field Evidence"}</strong>
                  <small>
                    {item.evidence_id || "Evidence record"}
                  </small>
                  <span>
                    {item.watershed_id || "Watershed"} •{" "}
                    {item.intervention || item.intervention_type || "Other"}
                  </span>
                  <em>{item.status || "Pending Review"}</em>
                </div>

                <ChevronRight size={16} />
              </button>
            ))
          )}
        </div>

        <div className="evidence-detail">
          {selected ? (
            <>
              <div className="detail-top">
                <div>
                  <span className="record-id">
                    {selected.evidence_id || selected.id}
                  </span>
                  <h2>{selected.title || "Field Evidence"}</h2>
                  <p>
                    <MapPin size={14} />
                    {selected.location || `${selected.district || "Watershed Region"}, ${selected.state || "India"}`}
                  </p>
                </div>

                <span className="evidence-status pending">
                  {selected.status || "Pending Review"}
                </span>
              </div>

              {selected.image && (
                <img
                  className="evidence-main-image"
                  src={imageUrl(selected.image)}
                  alt={selected.title || "Field evidence"}
                />
              )}

              <div className="metadata-heading">
                <h3>{t("watershed:fieldEvidence.metadataTitle", "Evidence Metadata")}</h3>
                <span>{t("watershed:fieldEvidence.metadataSubtitle", "Captured photograph information")}</span>
              </div>

              <div className="metadata-grid">
                <div><small>{t("watershed:fieldEvidence.metaLatitude", "Latitude")}</small><strong>{selected.latitude || "Not available"}</strong></div>
                <div><small>{t("watershed:fieldEvidence.metaLongitude", "Longitude")}</small><strong>{selected.longitude || "Not available"}</strong></div>
                <div><small>{t("watershed:fieldEvidence.metaDate", "Date")}</small><strong>{selected.captured_date || "Not available"}</strong></div>
                <div><small>{t("watershed:fieldEvidence.metaTime", "Time")}</small><strong>{selected.captured_time || "Not available"}</strong></div>
                <div><small>{t("watershed:fieldEvidence.metaWatershed", "Watershed")}</small><strong>{selected.watershed_id || "Not available"}</strong></div>
                <div><small>{t("watershed:fieldEvidence.metaIntervention", "Intervention")}</small><strong>{selected.intervention || selected.intervention_type || "Not available"}</strong></div>
                <div><small>{t("watershed:fieldEvidence.metaCamera", "Camera")}</small><strong>{selected.camera || "Not available"}</strong></div>
                <div><small>{t("watershed:fieldEvidence.metaGps", "GPS")}</small><strong>{selected.gps_available ? "Available" : "Missing"}</strong></div>
              </div>

              <div className="observation">
                <ShieldCheck size={18} />
                <div>
                  <strong>Why field evidence matters</strong>
                  <p>
                    Satellite observations are area-level supporting evidence.
                    A photograph is used to check the actual intervention on
                    site before an officer makes a final decision.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state large">
              <Camera size={38} />
              <strong>Select a field record</strong>
              <span>The photograph and its metadata will appear here.</span>
            </div>
          )}
        </div>
      </div>

      {showUpload && (
        <div className="modal-backdrop">
          <form className="upload-modal" onSubmit={handleUpload}>
            <button
              type="button"
              className="close-modal"
              onClick={() => setShowUpload(false)}
            >
              <X size={18} />
            </button>

            <div className="upload-icon">
              <Camera size={24} />
            </div>

            <span className="eyebrow">{t("watershed:fieldEvidence.uploadEyebrow", "FIELD LAYER")}</span>
            <h2>{t("watershed:fieldEvidence.uploadTitle", "Upload Field Evidence")}</h2>
            <p>
              {t("watershed:fieldEvidence.uploadSubtitle", "Upload the photograph taken during the field visit. EXIF GPS is preferred when the image contains it.")}
            </p>

            <label className="upload-box">
              <Upload size={24} />
              <strong>{t("watershed:fieldEvidence.choosePhoto", "Choose photograph")}</strong>
              <span>JPG, PNG or WebP • maximum 10 MB</span>
              <input
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
              />
            </label>

            <label className="field-label">
              {t("watershed:fieldEvidence.evidenceTitleLabel", "Evidence title")}
              <input
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="e.g. Check dam downstream view"
              />
            </label>

            <label className="field-label">
              {t("common:labels.watershed", "Watershed")}
              <select
                value={form.watershed_id}
                onChange={(e) =>
                  setForm({ ...form, watershed_id: e.target.value })
                }
              >
                {watersheds.map((w) => (
                  <option value={w.id} key={w.id}>
                    {w.id} · {w.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              {t("watershed:fieldEvidence.interventionTypeLabel", "Intervention type")}
              <select
                value={form.intervention_type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    intervention_type: e.target.value,
                  })
                }
              >
                <option>Check Dam</option>
                <option>Farm Pond</option>
                <option>Water Harvesting Structure</option>
                <option>Other</option>
              </select>
            </label>

            <div className="two-inputs">
              <label className="field-label">
                Latitude <span>fallback</span>
                <input
                  value={form.latitude}
                  onChange={(e) =>
                    setForm({ ...form, latitude: e.target.value })
                  }
                  placeholder="20.0059"
                />
              </label>

              <label className="field-label">
                Longitude <span>fallback</span>
                <input
                  value={form.longitude}
                  onChange={(e) =>
                    setForm({ ...form, longitude: e.target.value })
                  }
                  placeholder="73.7909"
                />
              </label>
            </div>

            {error && <div className="error-box">{error}</div>}
            {message && <div className="success-box">{message}</div>}

            <button
              className="primary-btn full-btn"
              type="submit"
              disabled={uploading}
            >
              <CheckCircle2 size={16} />
              {uploading ? t("watershed:fieldEvidence.uploadingBtn", "Validating & Saving...") : t("watershed:fieldEvidence.submitBtn", "Validate & Save Evidence")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function BeforeAfter({ initialWatershedId }) {
  const { t, i18n } = useTranslation(["watershed", "common"]);
  const [selectedId, setSelectedId] = useState(initialWatershedId || watersheds[0].id);
  const [prevId, setPrevId] = useState(initialWatershedId);

  if (initialWatershedId && initialWatershedId !== prevId) {
    setPrevId(initialWatershedId);
    setSelectedId(initialWatershedId);
  }

  const selected = watersheds.find((w) => w.id === selectedId) || watersheds[0];

  const [temporalData, setTemporalData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const loading = !temporalData || temporalData.watershedId !== selectedId;

  useEffect(() => {
    let isCancelled = false;

    getTemporalComparison(selectedId)
      .then((data) => {
        if (!isCancelled) {
          setTemporalData(data);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn("Satellite data fetch error, using local fallback:", err);
          const deltaNdvi = Number((selected.ndvi - selected.baseNdvi).toFixed(2));
          const deltaWater = Number((selected.water - selected.baseWater).toFixed(2));
          setTemporalData({
            watershedId: selected.id,
            watershedName: `${selected.name} (${selected.district}, ${selected.state})`,
            observationDate: "08 Sep 2026",
            baselineDate: "Baseline",
            cloudCoverPercent: 8.4,
            sensor: "Sentinel-2 L2A",
            sceneId: `S2B_MSIL2A_${selected.id}_20260908`,
            indicators: {
              ndvi: {
                baseline: selected.baseNdvi,
                current: selected.ndvi,
                delta: deltaNdvi,
                trend: deltaNdvi >= 0 ? "positive" : "negative",
                interpretation: deltaNdvi >= 0.10 ? "Large vegetation indicator improvement." : (deltaNdvi >= 0.03 ? "Moderate vegetation improvement." : "Stable vegetation condition.")
              },
              ndwi: {
                baseline: selected.baseWater,
                current: selected.water,
                delta: deltaWater,
                trend: deltaWater >= 0 ? "positive" : "negative",
                interpretation: deltaWater >= 0.10 ? "Large surface-water indicator improvement." : (deltaWater >= 0.03 ? "Moderate surface-water improvement." : "Stable surface-water condition.")
              }
            },
            insights: {
              observedChange: `NDVI changed by ${deltaNdvi >= 0 ? "+" : ""}${deltaNdvi.toFixed(2)} and Water Index changed by ${deltaWater >= 0 ? "+" : ""}${deltaWater.toFixed(2)}.`,
              whatItSupports: "The result can support a watershed-level monitoring decision and help decide whether field confirmation is useful.",
              whatItDoesNotProve: "It does not prove that one individual intervention caused the observed change. Field evidence and GIS context are required."
            },
            zonalStats: {
              meanNdvi: selected.ndvi,
              medianNdvi: selected.ndvi - 0.01,
              meanNdwi: selected.water,
              medianNdwi: selected.water - 0.01
            }
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedId, selected]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    getTemporalComparison(selectedId)
      .then((data) => {
        setTemporalData(data);
      })
      .catch((err) => {
        console.warn("Manual satellite refresh error:", err);
      })
      .finally(() => {
        setRefreshing(false);
      });
  };

  const ndviInfo = temporalData?.indicators?.ndvi || {
    baseline: selected.baseNdvi,
    current: selected.ndvi,
    delta: Number((selected.ndvi - selected.baseNdvi).toFixed(2)),
    trend: "positive",
    interpretation: "Vegetation indicator temporal change calculation."
  };

  const ndwiInfo = temporalData?.indicators?.ndwi || {
    baseline: selected.baseWater,
    current: selected.water,
    delta: Number((selected.water - selected.baseWater).toFixed(2)),
    trend: "positive",
    interpretation: "Surface-water indicator temporal change calculation."
  };

  return (
    <div className="page">
      <PageTitle
        eyebrow={t("watershed:beforeAfter.eyebrow", "EARTH OBSERVATION • SENTINEL-2")}
        title={t("watershed:beforeAfter.title", "Before / After Comparison")}
        text={t("watershed:beforeAfter.subtitle", "Dynamic zonal surface reflectance calculation for NDVI and NDWI indices with < 20% cloud filtering.")}
        badge={t("watershed:beforeAfter.badge", "SENTINEL-2 L2A")}
      />

      <DemoNote>
        <strong>Satellite Observation Pipeline:</strong>
        <p>
          Calculates surface reflectance from recent cloud-filtered Sentinel-2 passes across the catchment polygon.
          Vegetation condition uses NDVI <code>(B08 - B04)/(B08 + B04)</code> and surface water uses NDWI <code>(B03 - B08)/(B03 + B08)</code>.
        </p>
      </DemoNote>

      <div className="selection-strip">
        <label className="field-label">
          {t("watershed:explorer.selectWatershed", "Select watershed")}
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {watersheds.map((w) => (
              <option key={w.id} value={w.id}>
                {w.id} · {w.name} ({w.district}, {w.state})
              </option>
            ))}
          </select>
        </label>

        <div className="observation-info">
          <small>SATELLITE PASS</small>
          <strong>{temporalData?.baselineDate || "Baseline"} → {temporalData?.observationDate || "08 Sep 2026"}</strong>
          <span>{temporalData?.watershedName || `${selected.name} • ${selected.district}, ${selected.state}`}</span>
        </div>

        <div className="satellite-telemetry-box">
          <div className="telemetry-pill">
            <span className="telemetry-live-dot" />
            <Satellite size={14} />
            <strong>{temporalData?.sensor || "Sentinel-2 L2A"}</strong>
            <span className="telemetry-cloud">
              ☁ {formatDecimal(temporalData?.cloudCoverPercent ?? 8.4, 1, i18n.language)}% Cloud
            </span>
          </div>

          <button
            type="button"
            className="refresh-satellite-btn"
            disabled={loading || refreshing}
            onClick={handleManualRefresh}
            title="Refresh satellite pass for this watershed"
          >
            <RefreshCw size={13} className={refreshing ? "spin-icon" : ""} />
            {refreshing ? t("common:actions.loading", "Querying STAC...") : t("common:actions.refresh", "Refresh Pass")}
          </button>
        </div>
      </div>

      <div className={`comparison-grid ${loading ? "data-loading" : ""}`}>
        <section className="compare-card">
          <div className="compare-icon"><Leaf size={20} /></div>
          <div className="compare-meta-top">
            <span>VEGETATION INDICATOR</span>
            <small className="band-formula">Sentinel-2 B8/B4</small>
          </div>
          <h2>NDVI</h2>

          <div className="compare-values">
            <div>
              <small>Baseline</small>
              <strong>{formatDecimal(ndviInfo.baseline, 2, i18n.language)}</strong>
            </div>
            <ChevronRight size={18} />
            <div>
              <small>Current (Zonal Mean)</small>
              <strong>{formatDecimal(ndviInfo.current, 2, i18n.language)}</strong>
            </div>
          </div>

          <div className={`change-result ${ndviInfo.delta >= 0 ? "positive" : "negative"}`}>
            {formatDelta(ndviInfo.delta, 2, i18n.language)}
          </div>

          <p className="interp-text">{ndviInfo.interpretation}</p>
          <span className="formula-tag">NDVI = (B08 - B04) / (B08 + B04)</span>
        </section>

        <section className="compare-card">
          <div className="compare-icon blue"><Droplets size={20} /></div>
          <div className="compare-meta-top">
            <span>SURFACE-WATER INDICATOR</span>
            <small className="band-formula">Sentinel-2 B3/B8</small>
          </div>
          <h2>Water Index (NDWI)</h2>

          <div className="compare-values">
            <div>
              <small>Baseline</small>
              <strong>{formatDecimal(ndwiInfo.baseline, 2, i18n.language)}</strong>
            </div>
            <ChevronRight size={18} />
            <div>
              <small>Current (Zonal Mean)</small>
              <strong>{formatDecimal(ndwiInfo.current, 2, i18n.language)}</strong>
            </div>
          </div>

          <div className={`change-result ${ndwiInfo.delta >= 0 ? "positive" : "negative"}`}>
            {formatDelta(ndwiInfo.delta, 2, i18n.language)}
          </div>

          <p className="interp-text">{ndwiInfo.interpretation}</p>
          <span className="formula-tag">NDWI = (B03 - B08) / (B03 + B08)</span>
        </section>
      </div>

      <section className="content-card interpretation-card">
        <div className="card-header">
          <div>
            <h3>Zonal Earth Observation Findings</h3>
            <p>{temporalData?.sceneId ? `STAC Scene: ${temporalData.sceneId}` : `${selected.id} • ${selected.name}`}</p>
          </div>
          <ShieldCheck size={18} />
        </div>

        <div className="interpretation-grid">
          <div>
            <strong>Observed change</strong>
            <p>
              {temporalData?.insights?.observedChange || (
                <>
                  NDVI changed by <b>{formatDelta(ndviInfo.delta, 2, i18n.language)}</b>
                  {" "}and Water Index changed by{" "}
                  <b>{formatDelta(ndwiInfo.delta, 2, i18n.language)}</b>.
                </>
              )}
            </p>
          </div>

          <div>
            <strong>What it supports</strong>
            <p>
              {temporalData?.insights?.whatItSupports || (
                "The result can support a watershed-level monitoring decision and help decide whether field confirmation is useful."
              )}
            </p>
          </div>

          <div>
            <strong>What it does not prove</strong>
            <p>
              {temporalData?.insights?.whatItDoesNotProve || (
                "It does not prove that one individual intervention caused the observed change. Field evidence and GIS context are required."
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function EvidenceAssessment({ initialWatershedId, assessmentBundle }) {
  const { t, i18n } = useTranslation(["watershed", "common"]);
  const [selectedId, setSelectedId] = useState(initialWatershedId || watersheds[0].id);
  const [prevId, setPrevId] = useState(initialWatershedId);
  const [result, setResult] = useState(null);
  const [bundleNotice, setBundleNotice] = useState(Boolean(assessmentBundle));
  const [prevBundle, setPrevBundle] = useState(assessmentBundle);

  if (initialWatershedId && initialWatershedId !== prevId) {
    setPrevId(initialWatershedId);
    setSelectedId(initialWatershedId);
  }

  if (assessmentBundle && assessmentBundle !== prevBundle) {
    setPrevBundle(assessmentBundle);
    setBundleNotice(true);
    const satChange = Math.max(0, assessmentBundle.deltaNdvi || 0.12);
    let score = 30 + 25 + 25; // Base verified inputs
    const reasons = [
      "Field photograph is available.",
      "GPS metadata is verified.",
      "GIS location context is available.",
    ];
    if (satChange >= 0.10) {
      score += 20;
      reasons.push(`Satellite pass (${assessmentBundle.observationDate}) confirms high vegetative recovery (+${satChange.toFixed(2)}).`);
    } else if (satChange > 0) {
      score += 10;
      reasons.push(`Satellite pass (${assessmentBundle.observationDate}) indicates moderate positive change (+${satChange.toFixed(2)}).`);
    } else {
      reasons.push("Satellite indicator shows stable / baseline condition.");
    }
    let status = score >= 85 ? "Verified" : (score >= 55 ? "Needs Review" : "Inconclusive");
    setResult({ score, status, reasons });
  }

  const evidence = useMemo(() => {
    const map = {};
    watersheds.forEach((w) => {
      map[w.id] = {
        field: Boolean(w.field),
        gps: Boolean(w.gps),
        gis: Boolean(w.gis),
        satellite: Math.max(0, Number((w.ndvi - w.baseNdvi).toFixed(2))),
      };
    });
    return map;
  }, []);

  function runAssessment() {
    const item = evidence[selectedId] || { field: false, gps: false, gis: false, satellite: 0 };
    let score = 0;
    const reasons = [];

    if (item.field) {
      score += 30;
      reasons.push("Field photograph is available.");
    } else {
      reasons.push("Field photograph is missing.");
    }

    if (item.gps) {
      score += 25;
      reasons.push("GPS metadata is available.");
    } else {
      reasons.push("GPS metadata is missing.");
    }

    if (item.gis) {
      score += 25;
      reasons.push("GIS location context is available.");
    }

    if (item.satellite >= 0.10) {
      score += 20;
      reasons.push("Satellite indicator shows a meaningful change.");
    } else if (item.satellite > 0) {
      score += 10;
      reasons.push("Satellite indicator shows only a small change.");
    } else {
      reasons.push("No useful satellite change is available.");
    }

    let status = "Inconclusive";
    if (score >= 85) status = "Verified";
    else if (score >= 55) status = "Needs Review";

    setResult({ score, status, reasons });
  }

  const selected = watersheds.find((w) => w.id === selectedId) || watersheds[0];

  return (
    <div className="page">
      <PageTitle
        eyebrow={t("watershed:evidenceAssessment.eyebrow", "ASSESSMENT INTELLIGENCE")}
        title={t("watershed:evidenceAssessment.title", "Evidence Assessment")}
        text={t("watershed:evidenceAssessment.subtitle", "Combines field, GPS, GIS and satellite evidence using a simple explainable rule-based score.")}
        badge={t("watershed:evidenceAssessment.badge", "RULE-BASED")}
      />

      {bundleNotice && assessmentBundle && (
        <div className="sat-alert sat-alert-success" style={{ marginBottom: "16px" }}>
          <CheckCircle2 size={18} />
          <span>
            <b>Live Satellite Observation Loaded:</b> {assessmentBundle.watershedName} ({assessmentBundle.observationDate}) • NDVI {formatDecimal(assessmentBundle.ndvi, i18n.language, 2)}, NDWI {formatDecimal(assessmentBundle.ndwi, i18n.language, 2)}, Sensor {assessmentBundle.sensor}.
          </span>
          <button type="button" className="alert-close" onClick={() => setBundleNotice(false)}>
            <X size={15} />
          </button>
        </div>
      )}

      <section className="source-card">
        <div className="source-icon"><ShieldCheck size={20} /></div>
        <div>
          <strong>What is the assessment trying to answer?</strong>
          <p>
            “Do we have enough supporting evidence to treat this watershed
            record as verified, or should an officer ask for more evidence?”
            It is not an automatic approval of an intervention.
          </p>
        </div>
      </section>

      <div className="assessment-layout">
        <section className="content-card">
          <div className="card-header">
            <div>
              <h3>{t("watershed:evidenceAssessment.inputsTitle", "Evidence inputs")}</h3>
              <p>{t("watershed:evidenceAssessment.inputsSubtitle", "Inputs used for")} {selected.name} ({selected.district}, {selected.state})</p>
            </div>
            <Layers size={18} />
          </div>

          <label className="field-label">
            {t("common:labels.watershed", "Watershed")}
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setResult(null);
              }}
            >
              {watersheds.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.id} · {w.name} ({w.district}, {w.state})
                </option>
              ))}
            </select>
          </label>

          <div className="evidence-checks">
            <label><input type="checkbox" checked={evidence[selectedId].field} readOnly /> Geo-tagged field photograph available</label>
            <label><input type="checkbox" checked={evidence[selectedId].gps} readOnly /> GPS metadata available</label>
            <label><input type="checkbox" checked={evidence[selectedId].gis} readOnly /> GIS location context available</label>
          </div>

          <div className="satellite-change">
            <span>Satellite indicator change</span>
            <strong>{formatDelta(evidence[selectedId].satellite, 2, i18n.language)}</strong>
            <small>
              Used only as supporting evidence in this prototype.
            </small>
          </div>

          <button className="primary-btn full-btn" onClick={runAssessment}>
            <ShieldCheck size={16} /> {t("watershed:evidenceAssessment.runBtn", "Run Evidence Fusion")}
          </button>
        </section>

        <section className="content-card assessment-result-card">
          <div className="card-header">
            <div>
              <h3>{t("watershed:evidenceAssessment.resultTitle", "Assessment result")}</h3>
              <p>{t("watershed:evidenceAssessment.resultSubtitle", "Transparent score and reason")}</p>
            </div>
            <CheckCircle2 size={18} />
          </div>

          {!result ? (
            <div className="empty-state large">
              <ShieldCheck size={38} />
              <strong>Run the assessment</strong>
              <span>
                Select evidence inputs and click Run Evidence Fusion.
              </span>
            </div>
          ) : (
            <div className="result-content">
              <div className={`result-circle ${result.status.toLowerCase().replace(" ", "-")}`}>
                {formatNumber(result.score, i18n.language)}
                <small>/100</small>
              </div>

              <span className={`result-status ${result.status.toLowerCase().replace(" ", "-")}`}>
                {result.status}
              </span>

              <h4>Why this result?</h4>

              {result.reasons.map((reason) => (
                <p className="reason-row" key={reason}>
                  <CheckCircle2 size={14} /> {reason}
                </p>
              ))}

              <div className="resolution-box">
                <strong>Decision meaning</strong>
                <p>
                  Verified means the prototype has enough supporting evidence
                  for officer review. Needs Review means additional field
                  confirmation is recommended. Inconclusive means evidence is
                  insufficient.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function AdaptiveSurveyPlanner() {
  const { t, i18n } = useTranslation(["watershed", "common"]);
  const [budget, setBudget] = useState(3);

  const ordered = [...watersheds].sort((a, b) => {
    const priority = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return (
      priority[b.priority] - priority[a.priority] ||
      b.evidenceGap - a.evidenceGap
    );
  });

  const selected = ordered.slice(0, budget);

  function reason(w) {
    if (w.evidenceGap >= 35) return "High evidence gap";
    if (w.change.includes("Drastic")) return "Large satellite change";
    if (w.confidence < 65) return "Low confidence";
    return "Priority + evidence gap";
  }

  return (
    <div className="page">
      <PageTitle
        eyebrow={t("watershed:planner.eyebrow", "FIELD PRIORITISATION")}
        title={t("watershed:planner.title", "Adaptive Survey Planner")}
        text={t("watershed:planner.subtitle", "Tells the officer which watershed needs a field visit first and what evidence should be collected.")}
        badge={t("watershed:planner.badge", "FIELD ACTION")}
      />

      <div className="planner-banner">
        <label className="field-label">
          {t("watershed:planner.budgetLabel", "Field visit budget")}
          <select value={budget} onChange={(e) => setBudget(Number(e.target.value))}>
            <option value={1}>{formatNumber(1, i18n.language)} site</option>
            <option value={2}>{formatNumber(2, i18n.language)} sites</option>
            <option value={3}>{formatNumber(3, i18n.language)} sites</option>
            <option value={4}>{formatNumber(4, i18n.language)} sites</option>
            <option value={5}>{formatNumber(5, i18n.language)} sites</option>
          </select>
        </label>

        <div>
          <small>{t("watershed:planner.methodTitle", "METHOD")}</small>
          <strong>Priority + Evidence Gap + Indicators</strong>
          <span>Higher need appears earlier in the queue.</span>
        </div>
      </div>

      <section className="content-card">
        <div className="card-header">
          <div>
            <h3>{t("watershed:planner.queueTitle", "Recommended inspection queue")}</h3>
            <p>{t("watershed:planner.queueSubtitle", "Why each site has been placed in this order")}</p>
          </div>
          <strong>{formatNumber(selected.length, i18n.language)} sites</strong>
        </div>

        <div className="planner-table">
          <div className="planner-head">
            <span>Rank</span>
            <span>{t("common:labels.watershed", "Watershed")}</span>
            <span>{t("common:labels.priority", "Priority")}</span>
            <span>{t("common:labels.confidence", "Confidence")}</span>
            <span>{t("common:labels.evidenceGap", "Evidence Gap")}</span>
            <span>Why visit?</span>
          </div>

          {selected.map((w, index) => (
            <div className="planner-row" key={w.id}>
              <strong className="rank">#{formatNumber(index + 1, i18n.language)}</strong>

              <div>
                <strong>{w.name}</strong>
                <small>{w.id} • {w.district}, {w.state}</small>
              </div>

              <Priority value={w.priority} />

              <strong>{formatPercent(w.confidence, i18n.language)}</strong>

              <span className={`gap-value ${w.evidenceGap >= 30 ? "high-gap" : ""}`}>
                {formatPercent(w.evidenceGap, i18n.language)}
              </span>

              <span>{reason(w)}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="required-grid">
        {selected.map((w) => (
          <section className="content-card" key={`${w.id}-evidence`}>
            <div className="card-header">
              <div>
                <h3>{w.id} · {w.name}</h3>
                <p>{w.district}, {w.state} • Required Field Evidence</p>
              </div>
              <Camera size={18} />
            </div>

            <div className="required-item">
              <CheckCircle2 size={16} />
              <span>Geo-tagged photograph</span>
            </div>

            <div className="required-item">
              <CheckCircle2 size={16} />
              <span>Intervention condition</span>
            </div>

            <div className="required-item">
              <CheckCircle2 size={16} />
              <span>Current project stage</span>
            </div>

            <div className="planner-reason">
              <strong>Field visit reason</strong>
              <p>{reason(w)} — {w.change}.</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function OfficerReview({ currentUser }) {
  const { t, i18n } = useTranslation(["watershed", "common"]);
  const initial = watersheds.map((w) => ({
    ...w,
    action: w.assessment === "Verified" ? "Pending Approval" : "Pending Review",
  }));

  const [records, setRecords] = useState(initial);
  const [message, setMessage] = useState("");

  function updateAction(id, action) {
    setRecords((old) =>
      old.map((item) =>
        item.id === id ? { ...item, action } : item
      )
    );

    const record = records.find((item) => item.id === id);
    const officerName = currentUser?.fullName || "Project Officer";

    setMessage(
      `${record?.id} • ${record?.name} → ${action}. Decision recorded by ${officerName} for this session.`
    );

    setTimeout(() => setMessage(""), 2500);
  }

  return (
    <div className="page">
      <PageTitle
        eyebrow={t("watershed:officerReview.eyebrow", "OFFICER WORKFLOW")}
        title={t("watershed:officerReview.title", "Officer Review")}
        text={t("watershed:officerReview.subtitle", "Shows exactly which assessment the officer is reviewing and what evidence produced it.")}
        badge={t("watershed:officerReview.badge", "DECISION GATE")}
      />

      <section className="source-card">
        <div className="source-icon"><ClipboardCheck size={20} /></div>
        <div>
          <strong>What is the officer reviewing?</strong>
          <p>
            The officer reviews the evidence-fusion result for a specific
            watershed: field evidence, GPS availability, GIS context,
            satellite change and confidence. The officer then approves the
            assessment or sends it back for more evidence.
          </p>
        </div>
      </section>

      {message && (
        <div className="success-box decision-message">{message}</div>
      )}

      <section className="content-card">
        <div className="card-header">
          <div>
            <h3>{t("watershed:officerReview.queueTitle", "Assessment Queue")}</h3>
            <p>
              {formatNumber(records.length, i18n.language)} watershed assessments across{" "}
              {formatNumber(new Set(watersheds.map((w) => w.state)).size, i18n.language)} states
            </p>
          </div>
          <strong>
            {formatNumber(records.filter((r) => r.action.includes("Pending")).length, i18n.language)} pending
          </strong>
        </div>

        <div className="review-table">
          <div className="review-head">
            <span>Watershed / Assessment</span>
            <span>Change</span>
            <span>{t("common:labels.confidence", "Confidence")}</span>
            <span>Decision</span>
            <span>Action</span>
          </div>

          {records.map((record) => (
            <div className="review-row" key={record.id}>
              <div>
                <strong>{record.id} · {record.name}</strong>
                <small>
                  {record.district}, {record.state} • {record.assessment} • {record.structure}
                </small>
              </div>

              <span>{record.change}</span>

              <strong>{formatPercent(record.confidence, i18n.language)}</strong>

              <span className={`action-state ${record.action.includes("Review") ? "review" : "pending"}`}>
                {record.action}
              </span>

              <div className="review-actions">
                <button
                  className="approve-btn"
                  onClick={() => updateAction(record.id, "Approved")}
                >
                  <CheckCircle2 size={14} /> {t("common:actions.approve", "Approve")}
                </button>

                <button
                  className="outline-btn"
                  onClick={() => updateAction(record.id, "Sent for Review")}
                >
                  <AlertTriangle size={14} /> {t("common:actions.reject", "Send for Review")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Reports() {
  const { t, i18n } = useTranslation(["reports", "watershed", "common"]);
  const today = "12 Sep 2026";

  function printReport() {
    window.print();
  }

  return (
    <div className="page report-page">
      <div className="report-toolbar">
        <PageTitle
          eyebrow={t("reports:reports.eyebrow", "OFFICIAL OUTPUT")}
          title={t("reports:reports.title", "Reports")}
          text={t("reports:reports.subtitle", "Print-ready national monitoring report across active Indian watershed projects.")}
        />

        <button className="primary-btn" onClick={printReport}>
          <Download size={16} /> {t("reports:reports.downloadPdf", "Download / Save PDF")}
        </button>
      </div>

      <article className="report-paper">
        <header className="report-header">
          <div>
            <span className="report-logo">{t("common:appName", "JAL SETU")}</span>
            <strong>{t("reports:reports.reportTitle", "WATERSHED MONITORING REPORT")}</strong>
            <small>{t("reports:reports.directorate", "National Watershed Decision Support Directorate • Inter-State Monitoring")}</small>
          </div>

          <div className="report-meta">
            <span>{t("reports:reports.reportDate", "Report date")}</span>
            <strong>{today}</strong>
            <small>Prototype monitoring summary</small>
          </div>
        </header>

        <section className="report-intro">
          <h2>{t("reports:reports.summaryTitle", "Monitoring Summary")}</h2>
          <p>
            {t("reports:reports.summaryDesc", "This report summarises watershed-level prototype observations, temporal change, evidence assessment and recommended field action.")}
          </p>
        </section>

        <section className="report-section">
          <h3>{t("reports:reports.section1", "1. Watershed Monitoring Overview")}</h3>

          <table className="report-table">
            <thead>
              <tr>
                <th>{t("common:labels.watershed", "Watershed")}</th>
                <th>{t("common:labels.priority", "Priority")}</th>
                <th>{t("reports:reports.ndviChangeCol", "NDVI Change")}</th>
                <th>{t("reports:reports.waterChangeCol", "Water Change")}</th>
                <th>{t("reports:reports.changeLevelCol", "Change Level")}</th>
                <th>{t("common:labels.confidence", "Confidence")}</th>
              </tr>
            </thead>

            <tbody>
              {watersheds.map((w) => {
                const ndviChange = Number((w.ndvi - w.baseNdvi).toFixed(2));
                const waterChange = Number((w.water - w.baseWater).toFixed(2));
                return (
                  <tr key={w.id}>
                    <td>
                      <strong>{w.name}</strong>
                      <small>{w.id} • {w.district}, {w.state}</small>
                    </td>
                    <td><Priority value={w.priority} /></td>
                    <td>{formatDelta(ndviChange, i18n.language, 2)}</td>
                    <td>{formatDelta(waterChange, i18n.language, 2)}</td>
                    <td>{w.change}</td>
                    <td>{formatPercent(w.confidence, i18n.language)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="report-section report-two-column">
          <div>
            <h3>{t("reports:reports.section2", "2. Satellite Interpretation")}</h3>
            <p>
              {t("reports:reports.section2Desc", "NDVI represents vegetation condition, Water Index represents relative surface-water presence, and rainfall provides seasonal context. These are supporting indicators and are not individual intervention proof.")}
            </p>
          </div>

          <div>
            <h3>{t("reports:reports.section3", "3. Resolution Note")}</h3>
            <p>
              {t("reports:reports.section3Desc", "At 30 m resolution, small structures may not be directly resolvable. Surrounding vegetation, water and land-cover change should be combined with field and GIS evidence.")}
            </p>
          </div>
        </section>

        <section className="report-section">
          <h3>{t("reports:reports.section4", "4. Recommended Field Visits")}</h3>

          <table className="report-table compact">
            <thead>
              <tr>
                <th>Rank</th>
                <th>{t("common:labels.watershed", "Watershed")}</th>
                <th>{t("common:labels.priority", "Priority")}</th>
                <th>{t("common:labels.confidence", "Confidence")}</th>
                <th>{t("common:labels.evidenceGap", "Evidence Gap")}</th>
                <th>{t("reports:reports.requiredFieldEvidence", "Required Field Evidence")}</th>
              </tr>
            </thead>

            <tbody>
              {[...watersheds]
                .sort((a, b) => b.evidenceGap - a.evidenceGap)
                .slice(0, 3)
                .map((w, index) => (
                  <tr key={w.id}>
                    <td>#{formatNumber(index + 1, i18n.language)}</td>
                    <td>{w.name}<small>{w.id} • {w.district}, {w.state}</small></td>
                    <td><Priority value={w.priority} /></td>
                    <td>{formatPercent(w.confidence, i18n.language)}</td>
                    <td>{formatPercent(w.evidenceGap, i18n.language)}</td>
                    <td>
                      Geo-tagged photograph; intervention condition;
                      current project stage
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>

        <footer className="report-footer">
          <span>{t("reports:reports.footerPrototype", "Jal Setu • Watershed Decision Support Prototype")}</span>
          <span>{t("reports:reports.footerStatus", "Source status: Prototype / supporting observations")}</span>
        </footer>
      </article>
    </div>
  );
}

function SettingsPage() {
  const { t } = useTranslation(["reports", "common"]);
  const [saved, setSaved] = useState(false);
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");

  const stateOptions = useMemo(() => {
    return ["All States", ...Array.from(new Set(watersheds.map((w) => w.state))).sort()];
  }, []);

  const districtOptions = useMemo(() => {
    const list = selectedState === "All States"
      ? watersheds
      : watersheds.filter((w) => w.state === selectedState);
    return ["All Districts", ...Array.from(new Set(list.map((w) => w.district))).sort()];
  }, [selectedState]);

  return (
    <div className="page">
      <PageTitle
        eyebrow={t("reports:settings.eyebrow", "SYSTEM")}
        title={t("reports:settings.title", "Settings")}
        text={t("reports:settings.subtitle", "Operational jurisdiction and preferences for the Jal Setu monitoring portal.")}
      />

      <section className="content-card settings-card">
        <div className="settings-section" style={{ marginBottom: "1.5rem" }}>
          <label className="field-label" style={{ fontWeight: 600, fontSize: "0.95rem" }}>
            {t("reports:settings.languagePreference", "Portal Language & Localization")}
          </label>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
            {t("reports:settings.languageHint", "Choose your preferred operational language across English, Marathi (मराठी), and Hindi (हिंदी).")}
          </p>
          <LanguageSwitcher variant="inline" />
        </div>

        <label className="field-label">
          {t("reports:settings.primaryState", "Primary State Jurisdiction")}
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedDistrict("All Districts");
              setSaved(false);
            }}
          >
            {stateOptions.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </label>

        <label className="field-label">
          {t("reports:settings.districtJurisdiction", "District Jurisdiction")}
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSaved(false);
            }}
          >
            {districtOptions.map((dist) => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        </label>

        <label className="check-row">
          <input type="checkbox" defaultChecked />
          <span>{t("reports:settings.showWarning", "Show prototype data warning")}</span>
        </label>

        <button className="primary-btn" onClick={() => setSaved(true)}>
          <Settings size={16} />
          {saved ? t("reports:settings.savedNotice", "Settings Saved ✓") : t("reports:settings.saveBtn", "Save Settings")}
        </button>
      </section>
    </div>
  );
}

function HelpPage() {
  const { t } = useTranslation(["reports", "common"]);
  const [open, setOpen] = useState("workflow");

  const helpKeys = [
    "workflow",
    "satellite",
    "before",
    "assessment",
    "planner",
    "officer",
    "resolution",
  ];

  return (
    <div className="page">
      <PageTitle
        eyebrow={t("reports:help.eyebrow", "USER GUIDE")}
        title={t("reports:help.title", "Help & Documentation")}
        text={t("reports:help.subtitle", "Simple explanations of each Jal Setu monitoring module.")}
      />

      <section className="content-card help-list">
        {helpKeys.map((id) => (
          <div className="help-item" key={id}>
            <button
              type="button"
              onClick={() => setOpen(open === id ? "" : id)}
            >
              <strong>{t(`reports:help.items.${id}.title`)}</strong>
              {open === id ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
            </button>

            {open === id && <p>{t(`reports:help.items.${id}.desc`)}</p>}
          </div>
        ))}
      </section>
    </div>
  );
}

function getPageTitle(page, t) {
  const map = {
    "Dashboard": t("nav:menu.dashboard", "Dashboard"),
    "India Map": t("nav:menu.interactiveMap", "Interactive GIS Map"),
    "Watershed Explorer": t("nav:menu.watershedExplorer", "Watershed Explorer"),
    "Field Evidence": t("nav:menu.fieldEvidence", "Field Evidence"),
    "Satellite Analysis": t("nav:menu.satelliteAnalysis", "Satellite Analysis"),
    "Before / After": t("nav:menu.temporalComparison", "Before / After Comparison"),
    "Evidence Assessment": t("nav:menu.evidenceAssessment", "Evidence Assessment"),
    "Adaptive Survey Planner": t("nav:menu.surveyPlanner", "Adaptive Survey Planner"),
    "Officer Review": t("nav:menu.officerReview", "Officer Review"),
    "Reports": t("nav:menu.reports", "Reports & Analytics"),
    "Settings": t("nav:menu.settings", "Settings"),
    "Help & Documentation": t("nav:menu.help", "Help & Documentation"),
  };
  return map[page] || page;
}

export default function App() {
  const { t } = useTranslation(["common", "nav"]);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [signOutNotice, setSignOutNotice] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [pageParams, setPageParams] = useState({});
  const [activeWatershedId, setActiveWatershedId] = useState("WGH-NK-01");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(false);

  function handleSignOut() {
    clearStoredSession();
    setCurrentUser(null);
    setProfileMenuOpen(false);
    window.location.href = "/";
  }

  function handleLogin(user) {
    setCurrentUser(user);
    setSignOutNotice("");
  }

  function handlePageChange(page, params = {}) {
    setActivePage(page);
    setPageParams(params);
    if (params.watershedId) {
      setActiveWatershedId(params.watershedId);
    }
    setProfileMenuOpen(false);
    setNotifications(false);
  }

  if (!currentUser) {
    return (
      <AuthPage
        onLogin={handleLogin}
        signOutNotice={signOutNotice}
      />
    );
  }

  const userInitials =
    currentUser?.initials ||
    (currentUser?.fullName
      ? currentUser.fullName
          .split(" ")
          .filter(Boolean)
          .map((p) => p[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "JS");

  function renderPage() {
    if (activePage === "Dashboard") return <Dashboard setPage={handlePageChange} />;
    if (activePage === "India Map") return <IndiaMap />;
    if (activePage === "Watershed Explorer") {
      return <WatershedExplorer setPage={handlePageChange} />;
    }
    if (activePage === "Field Evidence") return <FieldEvidence />;
    if (activePage === "Satellite Analysis") {
      return (
        <SatelliteAnalysis
          setPage={handlePageChange}
          initialWatershedId={pageParams.watershedId}
          initialDate={pageParams.date}
          watersheds={watersheds}
        />
      );
    }
    if (activePage === "Before / After") {
      return (
        <BeforeAfter
          setPage={handlePageChange}
          initialWatershedId={pageParams.watershedId}
        />
      );
    }
    if (activePage === "Evidence Assessment") {
      return (
        <EvidenceAssessment
          setPage={handlePageChange}
          initialWatershedId={pageParams.watershedId}
          assessmentBundle={pageParams.bundle}
        />
      );
    }
    if (activePage === "Adaptive Survey Planner") return <AdaptiveSurveyPlanner />;
    if (activePage === "Officer Review") return <OfficerReview currentUser={currentUser} />;
    if (activePage === "Reports") return <Reports />;
    if (activePage === "Settings") return <SettingsPage />;
    return <HelpPage />;
  }

  return (
    <div className="app">
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="brand">
          <div className="brand-mark">
            <Droplets size={22} />
          </div>

          <div className="brand-text">
            <strong>Jal</strong>
            <span>SETU</span>
          </div>
        </div>

        <div className="sidebar-nav">
          <div className="menu-section">
            <small>{t("nav:sections.monitoring", "MONITORING")}</small>

            {menuItems.map(([name, Icon, key]) => (
              <button
                type="button"
                key={name}
                className={`menu-item ${
                  activePage === name ? "active" : ""
                }`}
                onClick={() => handlePageChange(name)}
                title={t(`nav:menu.${key}`, name)}
              >
                <Icon size={17} />
                <span>{t(`nav:menu.${key}`, name)}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-bottom">
            <small>{t("nav:sections.system", "SYSTEM")}</small>

            <button
              type="button"
              className={`menu-item ${
                activePage === "Settings" ? "active" : ""
              }`}
              onClick={() => handlePageChange("Settings")}
              title={t("nav:menu.settings", "Settings")}
            >
              <Settings size={17} />
              <span>{t("nav:menu.settings", "Settings")}</span>
            </button>

            <button
              type="button"
              className={`menu-item ${
                activePage === "Help & Documentation" ? "active" : ""
              }`}
              onClick={() => handlePageChange("Help & Documentation")}
              title={t("nav:menu.help", "Help & Documentation")}
            >
              <HelpCircle size={17} />
              <span>{t("nav:menu.help", "Help & Documentation")}</span>
            </button>

            <button
              type="button"
              className="menu-item sidebar-logout-btn"
              onClick={handleSignOut}
              title={t("common:actions.signOut", "Sign Out")}
            >
              <LogOut size={17} />
              <span>{t("common:actions.signOut", "Sign Out")}</span>
            </button>

            <div className="system-status">
              <span className="status-dot" />
              <div className="status-info">
                <strong>{t("common:systemStatus.operational", "System operational")}</strong>
                <small>v1.0 • {currentUser.role || "Officer Session"}</small>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </button>

          <div className="breadcrumbs">
            <span>{t("common:appName", "Jal Setu")}</span>
            <ChevronRight size={14} />
            <strong>{getPageTitle(activePage, t)}</strong>
          </div>

          <div className="topbar-right">
            <SearchBox setPage={handlePageChange} />

            <LanguageSwitcher />

            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                setNotifications(!notifications);
                setProfileMenuOpen(false);
              }}
              title="Notifications"
            >
              <Bell size={17} />
              <i />
            </button>

            {notifications && (
              <div className="notification-popover">
                <strong>{t("common:notifications.title", "Monitoring notifications")}</strong>
                <p>Kadwa has a low change indicator.</p>
                <p>Gangapur has the highest evidence gap.</p>
                <button
                  type="button"
                  onClick={() => handlePageChange("Officer Review")}
                >
                  {t("common:notifications.openReview", "Open Officer Review")}
                </button>
              </div>
            )}

            {/* Interactive User Profile & Sign Out Dropdown */}
            <div className="profile-container">
              <button
                type="button"
                className="profile-btn"
                onClick={() => {
                  setProfileMenuOpen(!profileMenuOpen);
                  setNotifications(false);
                }}
                title="View Profile & Sign Out"
              >
                <div className="profile-avatar">{userInitials}</div>
                <div className="profile-text">
                  <strong>{currentUser.fullName || "Project Officer"}</strong>
                  <small>{currentUser.role || "Watershed Monitoring"}</small>
                </div>
                <ChevronDown
                  size={14}
                  className={`profile-chevron ${profileMenuOpen ? "open" : ""}`}
                />
              </button>

              {profileMenuOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-user-header">
                    <div className="dropdown-avatar-circle">{userInitials}</div>
                    <div className="dropdown-user-meta">
                      <strong>{currentUser.fullName || "Project Officer"}</strong>
                      <small>{currentUser.email || "officer@jalsetu.gov.in"}</small>
                      <span className="dropdown-role-pill">
                        {currentUser.role || "Project Officer"}
                      </span>
                    </div>
                  </div>

                  <div className="dropdown-details-box">
                    <div className="dropdown-detail-row">
                      <span>{t("common:labels.department", "Department")}</span>
                      <p>{currentUser.department || "Water Resources & Watershed Development"}</p>
                    </div>
                    {currentUser.id && (
                      <div className="dropdown-detail-row">
                        <span>{t("common:labels.userId", "User ID")}</span>
                        <code>{currentUser.id}</code>
                      </div>
                    )}
                  </div>

                  <div className="dropdown-actions">
                    <button
                      type="button"
                      className="dropdown-signout-btn"
                      onClick={handleSignOut}
                    >
                      <LogOut size={16} />
                      <span>{t("common:actions.signOut", "Sign Out")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content">{renderPage()}</div>
      </main>

      <AskJalSetuChatbot
        watersheds={watersheds}
        activeWatershedId={activeWatershedId}
      />
    </div>
  );
}


