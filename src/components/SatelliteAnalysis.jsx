import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Satellite,
  Layers,
  Calendar,
  CloudRain,
  Leaf,
  Droplets,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  Info,
  CheckCircle2,
  Compass,
  ArrowUpRight,
  Send,
  Sparkles,
  Eye,
  SearchCheck,
  AlertOctagon,
  X
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Circle,
  Marker,
  Popup,
  Tooltip,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { createWatershedPin } from "../utils/leafletIcons";

import {
  WATERSHED_CENTROIDS,
  getWatershedLeafletPolygon,
  getWatershedBounds,
  getWatershedGISSubZones,
  getWatershedSatellitePasses,
  SEASONAL_FACTORS
} from "../utils/watershedBoundaries";
import { formatNumber, formatDecimal, formatDelta } from "../utils/formatters";

const BHUVAN_URL = "https://bhuvan-app1.nrsc.gov.in/bhuvan2d/bhuvan/bhuvan2d.php";

/**
 * Helper to smoothly pan and fit map view to the selected watershed polygon.
 */
function MapViewUpdater({ bounds, isFullscreen }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && map) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14, animate: true });
    }
  }, [bounds, map, isFullscreen]);
  return null;
}

export default function SatelliteAnalysis({
  setPage,
  initialWatershedId,
  initialDate,
  watersheds = []
}) {
  const { t, i18n } = useTranslation(["watershed", "common"]);

  // 1. Watershed selection state
  const availableWatersheds = useMemo(() => {
    if (watersheds && watersheds.length > 0) return watersheds;
    // Fallback list of watersheds
    return Object.entries(WATERSHED_CENTROIDS).map(([id, info]) => ({
      id,
      name: info.name,
      district: info.district,
      state: info.state,
      lat: info.lat,
      lng: info.lng,
      ndvi: 0.58,
      water: 0.64,
      baseNdvi: 0.46,
      baseWater: 0.48,
      rainfall: 684,
      confidence: 82,
      structure: "Check Dam",
    }));
  }, [watersheds]);

  const [selectedId, setSelectedId] = useState(
    initialWatershedId || availableWatersheds[0]?.id || "WGH-NK-01"
  );

  const selectedWatershed = useMemo(() => {
    return (
      availableWatersheds.find((w) => w.id === selectedId) ||
      availableWatersheds[0]
    );
  }, [availableWatersheds, selectedId]);

  // 2. Time filtering: "date" vs "season"
  const [timeMode, setTimeMode] = useState("date"); // 'date' | 'season'
  const satellitePasses = useMemo(
    () => getWatershedSatellitePasses(selectedId),
    [selectedId]
  );
  const [selectedPassIndex, setSelectedPassIndex] = useState(() => {
    if (initialDate) {
      const passes = getWatershedSatellitePasses(initialWatershedId || "WGH-NK-01");
      const idx = passes.findIndex((p) => p.date === initialDate);
      if (idx !== -1) return idx;
    }
    return 0;
  });
  const [selectedSeason, setSelectedSeason] = useState("Kharif");

  const currentPass = satellitePasses[selectedPassIndex] || satellitePasses[0];
  const seasonFactor = SEASONAL_FACTORS[selectedSeason] || SEASONAL_FACTORS.Kharif;

  // 3. Sensor selector
  const [sensor, setSensor] = useState("Sentinel-2 L2A"); // 'Sentinel-2 L2A' | 'Resourcesat-2A LISS-III'

  // 4. GIS Layers & Map Controls
  const [activeLayer, setActiveLayer] = useState("ndvi"); // 'ndvi' | 'ndwi' | 'lulc'
  const [showBoundary, setShowBoundary] = useState(true);
  const [basemap, setBasemap] = useState("satellite"); // 'satellite' | 'street'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [bundleSent, setBundleSent] = useState(false);

  // Dynamic calculated metrics based on date or season
  const calculatedMetrics = useMemo(() => {
    const baseNdvi = selectedWatershed.baseNdvi || 0.46;
    const baseWater = selectedWatershed.baseWater || 0.48;
    const currentNdviRaw = selectedWatershed.ndvi || 0.58;
    const currentWaterRaw = selectedWatershed.water || 0.64;
    const rainfallRaw = selectedWatershed.rainfall || 684;

    let ndvi = currentNdviRaw;
    let water = currentWaterRaw;
    let rainfall = rainfallRaw;
    let cloudCover = currentPass.cloudCover;
    let validPixels = currentPass.validPixels;
    let observationDateStr = currentPass.date;

    if (timeMode === "season") {
      ndvi = Number((currentNdviRaw * seasonFactor.ndviMultiplier).toFixed(2));
      water = Number((currentWaterRaw * seasonFactor.waterMultiplier).toFixed(2));
      rainfall = Math.round(rainfallRaw * seasonFactor.rainfallMultiplier);
      cloudCover = seasonFactor.cloudAvg;
      validPixels = Number((100 - cloudCover).toFixed(1));
      observationDateStr = `${seasonFactor.name} (${seasonFactor.period})`;
    } else {
      // Date pass variations
      if (selectedPassIndex === 1) {
        ndvi = Number((currentNdviRaw - 0.02).toFixed(2));
        water = Number((currentWaterRaw - 0.03).toFixed(2));
      } else if (selectedPassIndex === 2) {
        ndvi = Number((currentNdviRaw + 0.03).toFixed(2));
        water = Number((currentWaterRaw + 0.02).toFixed(2));
      } else if (selectedPassIndex === 3) {
        ndvi = Number((currentNdviRaw - 0.05).toFixed(2));
        water = Number((currentWaterRaw - 0.06).toFixed(2));
      }
    }

    const deltaNdvi = Number((ndvi - baseNdvi).toFixed(2));
    const deltaWater = Number((water - baseWater).toFixed(2));

    return {
      ndvi,
      water,
      rainfall,
      baseNdvi,
      baseWater,
      deltaNdvi,
      deltaWater,
      cloudCover,
      validPixels,
      observationDateStr,
      sensor: sensor === "Sentinel-2 L2A" ? "Sentinel-2 L2A / 10m" : "Resourcesat-2A LISS-III / 23.5m",
      resolution: sensor === "Sentinel-2 L2A" ? "10m GSD" : "23.5m GSD",
      sceneId: currentPass.sceneId,
      timeIST: currentPass.timeIST,
      sunElevation: currentPass.sunElevation,
      solarAzimuth: currentPass.solarAzimuth,
    };
  }, [selectedWatershed, timeMode, currentPass, selectedPassIndex, seasonFactor, sensor]);

  // Geospatial polygon coordinates and bounds
  const watershedPolygon = useMemo(
    () => getWatershedLeafletPolygon(selectedId),
    [selectedId]
  );
  const mapBounds = useMemo(
    () => getWatershedBounds(selectedId),
    [selectedId]
  );
  const gisSubZones = useMemo(
    () => getWatershedGISSubZones(selectedId, calculatedMetrics.ndvi, calculatedMetrics.water),
    [selectedId, calculatedMetrics.ndvi, calculatedMetrics.water]
  );

  // Status tag categorizations
  const ndviStatusTag = useMemo(() => {
    if (calculatedMetrics.ndvi >= 0.55) return t("watershed:satellite.denseCanopy", "Dense Canopy Vigor");
    if (calculatedMetrics.ndvi >= 0.35) return t("watershed:satellite.moderateCanopy", "Moderate Crop Canopy");
    return t("watershed:satellite.sparseCanopy", "Sparse / Stressed Canopy");
  }, [calculatedMetrics.ndvi, t]);

  const waterStatusTag = useMemo(() => {
    if (calculatedMetrics.water >= 0.55) return t("watershed:satellite.highWater", "Active Reservoir Storage");
    if (calculatedMetrics.water >= 0.35) return t("watershed:satellite.moderateWater", "Moderate Retention");
    return t("watershed:satellite.lowWater", "Dry / Seasonal Low");
  }, [calculatedMetrics.water, t]);

  // Action Triggers
  const handleOpenBeforeAfter = () => {
    if (setPage) {
      setPage("Before / After", {
        watershedId: selectedId,
        date: calculatedMetrics.observationDateStr,
      });
    }
  };

  const handleSendToEvidenceAssessment = () => {
    setShowBundleModal(true);
  };

  const handleConfirmEvidenceBundle = () => {
    const bundlePayload = {
      watershedId: selectedId,
      watershedName: selectedWatershed.name,
      district: selectedWatershed.district,
      state: selectedWatershed.state,
      observationDate: calculatedMetrics.observationDateStr,
      ndvi: calculatedMetrics.ndvi,
      ndwi: calculatedMetrics.water,
      deltaNdvi: calculatedMetrics.deltaNdvi,
      deltaWater: calculatedMetrics.deltaWater,
      rainfall: calculatedMetrics.rainfall,
      cloudCover: calculatedMetrics.cloudCover,
      sensor: calculatedMetrics.sensor,
      satelliteEvidenceScore: calculatedMetrics.deltaNdvi >= 0.10 ? 20 : (calculatedMetrics.deltaNdvi > 0 ? 10 : 0),
      timestamp: new Date().toISOString(),
    };

    setShowBundleModal(false);
    setBundleSent(true);

    if (setPage) {
      setPage("Evidence Assessment", {
        watershedId: selectedId,
        bundle: bundlePayload,
      });
    }
  };

  return (
    <div className={`page satellite-analysis-page ${isFullscreen ? "page-fullscreen-active" : ""}`}>
      {/* Top Header Bar */}
      <div className="sat-page-header">
        <div>
          <div className="sat-header-badge">
            <span className="live-ping-dot" />
            <span>{t("watershed:satellite.liveBadge", "Near Real-Time")}</span>
            <span className="badge-separator">•</span>
            <span>{calculatedMetrics.sensor}</span>
          </div>
          <h1 className="sat-page-title">
            {t("watershed:satellite.title", "Satellite Analysis")}
          </h1>
          <p className="sat-page-subtitle">
            {t(
              "watershed:satellite.subtitle",
              "Analysis of vegetation, surface-water, and land-cover indicators for watershed verification."
            )}
          </p>
        </div>

        <div className="sat-header-actions">
          <button
            type="button"
            className="sat-btn sat-btn-secondary"
            onClick={() => setShowMetadataModal(true)}
            title={t("watershed:satellite.metadataBtn", "Sensor & STAC Metadata")}
          >
            <Info size={16} />
            <span>{t("watershed:satellite.metadataBtn", "Sensor & STAC Metadata")}</span>
          </button>

          <button
            type="button"
            className="sat-btn sat-btn-outline"
            onClick={() => window.open(BHUVAN_URL, "_blank")}
            title={t("watershed:satellite.openBhuvan", "Open Bhuvan 2D Portal")}
          >
            <ExternalLink size={15} />
            <span>{t("watershed:satellite.openBhuvan", "Open Bhuvan 2D")}</span>
          </button>
        </div>
      </div>

      {/* Success banner if evidence bundle was dispatched */}
      {bundleSent && (
        <div className="sat-alert sat-alert-success">
          <CheckCircle2 size={18} />
          <span>
            {t(
              "watershed:satellite.bundleSuccessNotice",
              "Satellite evidence bundle successfully transferred to Evidence Assessment!"
            )}
          </span>
          <button type="button" className="alert-close" onClick={() => setBundleSent(false)}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* Primary Selection & Filter Control Bar */}
      <section className="sat-control-card">
        <div className="sat-control-grid">
          {/* 1. Watershed Selector */}
          <div className="sat-control-group">
            <label className="sat-control-label">
              <Compass size={15} className="text-emerald" />
              <span>{t("watershed:satellite.selectWatershed", "Select Watershed")}</span>
            </label>
            <select
              className="sat-select"
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setBundleSent(false);
              }}
            >
              {availableWatersheds.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.id} · {w.name} ({w.district}, {w.state})
                </option>
              ))}
            </select>
            <small className="sat-control-hint">
              {selectedWatershed.district}, {selectedWatershed.state} • {selectedWatershed.structure || "Check Dam"}
            </small>
          </div>

          {/* 2. Time Filter Mode & Options */}
          <div className="sat-control-group">
            <div className="sat-control-label-row">
              <label className="sat-control-label">
                <Calendar size={15} className="text-teal" />
                <span>{t("watershed:satellite.timeFilter", "Time Filter")}</span>
              </label>

              <div className="sat-pill-toggle">
                <button
                  type="button"
                  className={`sat-pill-btn ${timeMode === "date" ? "active" : ""}`}
                  onClick={() => setTimeMode("date")}
                >
                  {t("watershed:satellite.singleDate", "Single Date")}
                </button>
                <button
                  type="button"
                  className={`sat-pill-btn ${timeMode === "season" ? "active" : ""}`}
                  onClick={() => setTimeMode("season")}
                >
                  {t("watershed:satellite.seasonSelector", "Season")}
                </button>
              </div>
            </div>

            {timeMode === "date" ? (
              <select
                className="sat-select"
                value={selectedPassIndex}
                onChange={(e) => setSelectedPassIndex(Number(e.target.value))}
              >
                {satellitePasses.map((pass, index) => (
                  <option key={pass.isoDate} value={index}>
                    {pass.date} — {pass.cloudCover}% cloud • {pass.quality} pass
                  </option>
                ))}
              </select>
            ) : (
              <select
                className="sat-select"
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
              >
                <option value="Kharif">{t("watershed:satellite.kharif", "Kharif (Monsoon: Jun – Oct)")}</option>
                <option value="Rabi">{t("watershed:satellite.rabi", "Rabi (Winter: Nov – Mar)")}</option>
                <option value="Zaid">{t("watershed:satellite.zaid", "Zaid (Summer: Apr – May)")}</option>
              </select>
            )}

            <small className="sat-control-hint">
              {timeMode === "date"
                ? `${satellitePasses.length} cloud-filtered passes (< 20% cloud)`
                : seasonFactor.statusNote}
            </small>
          </div>

          {/* 3. Sensor Selector & Overpass Status */}
          <div className="sat-control-group">
            <label className="sat-control-label">
              <Satellite size={15} className="text-emerald" />
              <span>{t("watershed:satellite.sensor", "Sensor / Constellation")}</span>
            </label>
            <div className="sat-sensor-box">
              <select
                className="sat-select"
                value={sensor}
                onChange={(e) => setSensor(e.target.value)}
              >
                <option value="Sentinel-2 L2A">Sentinel-2 L2A (10m BOA multispectral)</option>
                <option value="Resourcesat-2A LISS-III">Resourcesat-2A LISS-III (23.5m VNIR)</option>
              </select>

              <div className="sat-overpass-info">
                <span>{t("watershed:satellite.acquired", "Acquired")}: <b>{calculatedMetrics.timeIST}</b></span>
                <span className="sat-pass-quality-chip">{currentPass.quality}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Observation Metrics Bar */}
      <section className="sat-metrics-grid">
        {/* NDVI Metric Card */}
        <div className="sat-metric-card border-green">
          <div className="sat-metric-head">
            <div className="sat-metric-icon bg-green-light text-green">
              <Leaf size={20} />
            </div>
            <span className="sat-status-tag tag-green">{ndviStatusTag}</span>
          </div>
          <div className="sat-metric-body">
            <span className="sat-metric-label">{t("watershed:satellite.ndvi", "NDVI")}</span>
            <div className="sat-metric-value-row">
              <strong className="sat-metric-number">
                {formatDecimal(calculatedMetrics.ndvi, i18n.language, 2)}
              </strong>
              <span className={`sat-metric-delta ${calculatedMetrics.deltaNdvi >= 0 ? "positive" : "negative"}`}>
                {formatDelta(calculatedMetrics.deltaNdvi, i18n.language, 2)}
              </span>
            </div>
            <p className="sat-metric-desc">
              {t("watershed:satellite.ndviDesc", "Canopy greenness & vegetative vigor")}
            </p>
            {/* Visual Gauge */}
            <div className="sat-metric-bar-bg">
              <div
                className="sat-metric-bar-fill bar-green"
                style={{ width: `${Math.min(100, Math.max(0, calculatedMetrics.ndvi * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Water Index (NDWI) Metric Card */}
        <div className="sat-metric-card border-blue">
          <div className="sat-metric-head">
            <div className="sat-metric-icon bg-blue-light text-blue">
              <Droplets size={20} />
            </div>
            <span className="sat-status-tag tag-blue">{waterStatusTag}</span>
          </div>
          <div className="sat-metric-body">
            <span className="sat-metric-label">{t("watershed:satellite.waterIndex", "Water Index (NDWI)")}</span>
            <div className="sat-metric-value-row">
              <strong className="sat-metric-number">
                {formatDecimal(calculatedMetrics.water, i18n.language, 2)}
              </strong>
              <span className={`sat-metric-delta ${calculatedMetrics.deltaWater >= 0 ? "positive" : "negative"}`}>
                {formatDelta(calculatedMetrics.deltaWater, i18n.language, 2)}
              </span>
            </div>
            <p className="sat-metric-desc">
              {t("watershed:satellite.waterIndexDesc", "Surface water & moisture retention")}
            </p>
            {/* Visual Gauge */}
            <div className="sat-metric-bar-bg">
              <div
                className="sat-metric-bar-fill bar-blue"
                style={{ width: `${Math.min(100, Math.max(0, calculatedMetrics.water * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Seasonal Rainfall Card */}
        <div className="sat-metric-card border-amber">
          <div className="sat-metric-head">
            <div className="sat-metric-icon bg-amber-light text-amber">
              <CloudRain size={20} />
            </div>
            <span className="sat-status-tag tag-amber">{t("watershed:satellite.normalRain", "Normal Monsoon")}</span>
          </div>
          <div className="sat-metric-body">
            <span className="sat-metric-label">{t("watershed:satellite.rainfall", "Cumulative Rainfall")}</span>
            <div className="sat-metric-value-row">
              <strong className="sat-metric-number">
                {formatNumber(calculatedMetrics.rainfall, i18n.language)} mm
              </strong>
            </div>
            <p className="sat-metric-desc">
              {t("watershed:satellite.rainfallDesc", "IMD gridded rainfall context")}
            </p>
            <div className="sat-metric-bar-bg">
              <div
                className="sat-metric-bar-fill bar-amber"
                style={{ width: `${Math.min(100, Math.max(10, (calculatedMetrics.rainfall / 1000) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Data Quality & Resolution Card */}
        <div className="sat-metric-card border-slate">
          <div className="sat-metric-head">
            <div className="sat-metric-icon bg-slate-light text-slate">
              <ShieldCheck size={20} />
            </div>
            <span className="sat-status-tag tag-slate">{t("watershed:satellite.optimalQuality", "High Quality Pass")}</span>
          </div>
          <div className="sat-metric-body">
            <span className="sat-metric-label">{t("watershed:satellite.cloudCover", "Cloud Cover")}</span>
            <div className="sat-quality-stat-row">
              <div>
                <small className="quality-sub">{t("watershed:satellite.cloudCover", "Cloud Cover")}</small>
                <strong>{formatDecimal(calculatedMetrics.cloudCover, i18n.language, 1)}%</strong>
              </div>
              <div className="stat-separator" />
              <div>
                <small className="quality-sub">{t("watershed:satellite.validPixels", "Valid Pixels")}</small>
                <strong className="text-emerald">{formatDecimal(calculatedMetrics.validPixels, i18n.language, 1)}%</strong>
              </div>
            </div>
            <p className="sat-metric-desc">
              {calculatedMetrics.resolution} • BOA Level-2A
            </p>
          </div>
        </div>
      </section>

      {/* Interactive GIS Map Section */}
      <section className={`sat-map-section ${isFullscreen ? "sat-map-fullscreen" : ""}`}>
        <div className="sat-map-header-bar">
          <div className="sat-map-title-group">
            <Layers size={18} className="text-emerald" />
            <div>
              <h3>{t("watershed:satellite.mapTitle", "Interactive Earth Observation Map")}</h3>
              <p>
                {t(
                  "watershed:satellite.mapSub",
                  "High-resolution Sentinel-2 multispectral visualization centered on {{name}}",
                  { name: selectedWatershed.name }
                )}
              </p>
            </div>
          </div>

          {/* Layer Switcher Tabs */}
          <div className="sat-map-layer-tabs">
            <button
              type="button"
              className={`layer-tab-btn ${activeLayer === "ndvi" ? "active" : ""}`}
              onClick={() => setActiveLayer("ndvi")}
            >
              <Leaf size={15} />
              <span>{t("watershed:satellite.layerNdvi", "Vegetation (NDVI)")}</span>
            </button>

            <button
              type="button"
              className={`layer-tab-btn ${activeLayer === "ndwi" ? "active" : ""}`}
              onClick={() => setActiveLayer("ndwi")}
            >
              <Droplets size={15} />
              <span>{t("watershed:satellite.layerNdwi", "Surface Water (NDWI)")}</span>
            </button>

            <button
              type="button"
              className={`layer-tab-btn ${activeLayer === "lulc" ? "active" : ""}`}
              onClick={() => setActiveLayer("lulc")}
            >
              <Layers size={15} />
              <span>{t("watershed:satellite.layerLulc", "Land Cover (LULC)")}</span>
            </button>
          </div>

          {/* Toolbar Actions */}
          <div className="sat-map-tools">
            <label className="sat-boundary-toggle" title="Toggle Boundary Polygon">
              <input
                type="checkbox"
                checked={showBoundary}
                onChange={(e) => setShowBoundary(e.target.checked)}
              />
              <span>{t("watershed:satellite.boundaryToggle", "Boundary")}</span>
            </label>

            <button
              type="button"
              className="sat-tool-btn"
              onClick={() => setBasemap(basemap === "satellite" ? "street" : "satellite")}
              title="Toggle Basemap (Satellite / Carto)"
            >
              <Satellite size={15} />
            </button>

            <button
              type="button"
              className="sat-tool-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>

        {/* Leaflet Map Viewer */}
        <div className="sat-map-container-wrapper">
          <MapContainer
            bounds={mapBounds}
            className="sat-leaflet-map"
            zoomControl={true}
            minZoom={5}
            maxZoom={18}
          >
            <MapViewUpdater bounds={mapBounds} isFullscreen={isFullscreen} />

            {basemap === "satellite" ? (
              <TileLayer
                attribution="Tiles © Esri, Maxar, Earthstar Geographics"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            ) : (
              <TileLayer
                attribution="© OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}

            {/* 1. Watershed Outer Boundary Polygon */}
            {showBoundary && (
              <Polygon
                positions={watershedPolygon}
                pathOptions={{
                  color: "#10b981",
                  weight: 3,
                  dashArray: "6, 6",
                  fillColor: "#059669",
                  fillOpacity: 0.08,
                }}
              >
                <Tooltip sticky>
                  <strong>{selectedWatershed.name} ({selectedWatershed.id})</strong>
                  <br />
                  <span>Area: {selectedWatershed.area || 112.5} km² • {selectedWatershed.district}</span>
                </Tooltip>
              </Polygon>
            )}

            {/* 2. GIS Layer 1: Vegetation (NDVI Colormapped Zones) */}
            {activeLayer === "ndvi" && (
              <>
                {/* High Vigor Riparian Corridor */}
                <Polygon
                  positions={gisSubZones.valleyZone}
                  pathOptions={{
                    color: "#15803d",
                    weight: 1.5,
                    fillColor: "#16a34a",
                    fillOpacity: 0.65,
                  }}
                >
                  <Popup>
                    <strong>Valley Stream Corridor</strong>
                    <br />
                    <span>NDVI: <b>{gisSubZones.metrics.valleyNdvi}</b> (Dense Canopy Vigor)</span>
                    <br />
                    <small>High biomass along drainage intervention zone</small>
                  </Popup>
                </Polygon>

                {/* Agricultural Cropland Middle Zone */}
                <Polygon
                  positions={gisSubZones.agriZone}
                  pathOptions={{
                    color: "#65a30d",
                    weight: 1.5,
                    fillColor: "#84cc16",
                    fillOpacity: 0.55,
                  }}
                >
                  <Popup>
                    <strong>Cropland Agricultural Area</strong>
                    <br />
                    <span>NDVI: <b>{gisSubZones.metrics.agriNdvi}</b> (Moderate-High Crop Health)</span>
                    <br />
                    <small>Active Kharif crop cultivation</small>
                  </Popup>
                </Polygon>

                {/* Ridge / Shrubland Zone */}
                <Polygon
                  positions={gisSubZones.ridgeZone}
                  pathOptions={{
                    color: "#ca8a04",
                    weight: 1.5,
                    fillColor: "#eab308",
                    fillOpacity: 0.45,
                  }}
                >
                  <Popup>
                    <strong>Upper Ridge / Shrubland</strong>
                    <br />
                    <span>NDVI: <b>{gisSubZones.metrics.ridgeNdvi}</b> (Sparse Vegetation)</span>
                    <br />
                    <small>Contour trench recharge zone</small>
                  </Popup>
                </Polygon>
              </>
            )}

            {/* 3. GIS Layer 2: Surface Water (NDWI Water-Mask Layer) */}
            {activeLayer === "ndwi" && (
              <>
                {/* Reservoir / Main Check Dam Retention Pond */}
                <Polygon
                  positions={gisSubZones.reservoirZone}
                  pathOptions={{
                    color: "#0369a1",
                    weight: 2,
                    fillColor: "#0284c7",
                    fillOpacity: 0.85,
                  }}
                >
                  <Popup>
                    <strong>Waghad Storage Reservoir</strong>
                    <br />
                    <span>NDWI: <b>{gisSubZones.metrics.reservoirNdwi}</b> (Open Water Surface)</span>
                    <br />
                    <span>Capacity: <b>88% full</b> • Storage Area: 4.2 ha</span>
                  </Popup>
                </Polygon>

                {/* Stream Drainage Flowline */}
                <Polyline
                  positions={gisSubZones.streamChannel}
                  pathOptions={{
                    color: "#38bdf8",
                    weight: 4,
                    opacity: 0.9,
                  }}
                >
                  <Popup>
                    <strong>Primary Catchment Drainage Channel</strong>
                    <br />
                    <span>Stream Order: 3rd Order Stream</span>
                    <br />
                    <span>Active post-rainfall runoff flow</span>
                  </Popup>
                </Polyline>

                {/* Additional Check Dam Points */}
                <Circle
                  center={[selectedWatershed.lat, selectedWatershed.lng]}
                  radius={180}
                  pathOptions={{
                    color: "#0284c7",
                    fillColor: "#38bdf8",
                    fillOpacity: 0.75,
                  }}
                >
                  <Popup>
                    <strong>Check Dam Interventions</strong>
                    <br />
                    <span>Location: {selectedWatershed.lat.toFixed(4)}°N, {selectedWatershed.lng.toFixed(4)}°E</span>
                    <br />
                    <span>Surface Water: High Retention</span>
                  </Popup>
                </Circle>
              </>
            )}

            {/* 4. GIS Layer 3: Land Use / Land Cover (LULC Thematic Classes) */}
            {activeLayer === "lulc" && (
              <>
                {/* Water Bodies (Blue) */}
                <Polygon
                  positions={gisSubZones.reservoirZone}
                  pathOptions={{
                    color: "#0284c7",
                    fillColor: "#0284c7",
                    fillOpacity: 0.75,
                    weight: 1,
                  }}
                >
                  <Popup>
                    <strong>LULC Class: Water Body</strong>
                    <br />
                    <span>Surface Area: ~4.2 ha (4% catchment)</span>
                  </Popup>
                </Polygon>

                {/* Cropland (Green) */}
                <Polygon
                  positions={gisSubZones.agriZone}
                  pathOptions={{
                    color: "#16a34a",
                    fillColor: "#16a34a",
                    fillOpacity: 0.65,
                    weight: 1,
                  }}
                >
                  <Popup>
                    <strong>LULC Class: Irrigated Cropland</strong>
                    <br />
                    <span>Area: ~62.4 ha (55% catchment)</span>
                  </Popup>
                </Polygon>

                {/* Shrub & Fallow (Amber) */}
                <Polygon
                  positions={gisSubZones.ridgeZone}
                  pathOptions={{
                    color: "#ca8a04",
                    fillColor: "#ca8a04",
                    fillOpacity: 0.6,
                    weight: 1,
                  }}
                >
                  <Popup>
                    <strong>LULC Class: Scrubland / Fallow</strong>
                    <br />
                    <span>Area: ~34.8 ha (31% catchment)</span>
                  </Popup>
                </Polygon>
              </>
            )}

            {/* Watershed Center Location Marker */}
            <Marker
              position={[selectedWatershed.lat, selectedWatershed.lng]}
              icon={createWatershedPin({
                priority: selectedWatershed.priority,
                status: selectedWatershed.status,
                size: 30,
              })}
            >
              <Popup>
                <strong>{selectedWatershed.name}</strong>
                <br />
                <span>{selectedWatershed.id}</span>
                <br />
                <span>{selectedWatershed.district}, {selectedWatershed.state}</span>
                <br />
                <b>{selectedWatershed.structure}</b>
              </Popup>
            </Marker>
          </MapContainer>

          {/* Dynamic Layer Legend */}
          <div className="sat-map-legend">
            <strong className="legend-title">
              {activeLayer === "ndvi" && t("watershed:satellite.layerNdvi", "Vegetation (NDVI)")}
              {activeLayer === "ndwi" && t("watershed:satellite.layerNdwi", "Surface Water (NDWI)")}
              {activeLayer === "lulc" && t("watershed:satellite.layerLulc", "Land Cover (LULC)")}
            </strong>

            {activeLayer === "ndvi" && (
              <div className="legend-items">
                <div className="legend-row">
                  <span className="color-chip chip-ndvi-high" />
                  <span>{t("watershed:satellite.ndviHigh", "Dense Canopy (> 0.5)")}</span>
                </div>
                <div className="legend-row">
                  <span className="color-chip chip-ndvi-mod" />
                  <span>{t("watershed:satellite.ndviMod", "Moderate Crop (0.2 – 0.5)")}</span>
                </div>
                <div className="legend-row">
                  <span className="color-chip chip-ndvi-low" />
                  <span>{t("watershed:satellite.ndviLow", "Sparse / Soil (< 0.2)")}</span>
                </div>
              </div>
            )}

            {activeLayer === "ndwi" && (
              <div className="legend-items">
                <div className="legend-row">
                  <span className="color-chip chip-ndwi-water" />
                  <span>{t("watershed:satellite.ndwiWater", "Open Water Body (> 0.3)")}</span>
                </div>
                <div className="legend-row">
                  <span className="color-chip chip-ndwi-moist" />
                  <span>{t("watershed:satellite.ndwiMoist", "Moist Ground (0.0 – 0.3)")}</span>
                </div>
                <div className="legend-row">
                  <span className="color-chip chip-ndwi-dry" />
                  <span>{t("watershed:satellite.ndwiDry", "Dry Soil (< 0.0)")}</span>
                </div>
              </div>
            )}

            {activeLayer === "lulc" && (
              <div className="legend-items">
                <div className="legend-row">
                  <span className="color-chip chip-lulc-water" />
                  <span>{t("watershed:satellite.lulcWater", "Water Bodies")}</span>
                </div>
                <div className="legend-row">
                  <span className="color-chip chip-lulc-crop" />
                  <span>{t("watershed:satellite.lulcCropland", "Cropland (Irrigated)")}</span>
                </div>
                <div className="legend-row">
                  <span className="color-chip chip-lulc-fallow" />
                  <span>{t("watershed:satellite.lulcFallow", "Fallow / Rainfed")}</span>
                </div>
                <div className="legend-row">
                  <span className="color-chip chip-lulc-shrub" />
                  <span>{t("watershed:satellite.lulcShrubland", "Shrub & Wasteland")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Three-Tier Scientific Interpretation Card */}
      <section className="sat-interpretation-card">
        <div className="sat-card-header">
          <div className="sat-card-title-group">
            <Sparkles size={20} className="text-emerald" />
            <div>
              <h3>{t("watershed:satellite.interpretationTitle", "Satellite Evidence Interpretation")}</h3>
              <p>{t("watershed:satellite.interpretationSub", "Categorized 3-tier Earth Observation evidence analysis")}</p>
            </div>
          </div>
          <span className="sat-card-badge">SCIENTIFIC RIGOR</span>
        </div>

        <div className="sat-tiers-grid">
          {/* Tier 1: Directly Visible */}
          <div className="sat-tier-box tier-visible">
            <div className="tier-header">
              <div className="tier-icon-wrap icon-emerald">
                <Eye size={18} />
              </div>
              <div>
                <h4>{t("watershed:satellite.directlyVisibleTitle", "Directly Visible")}</h4>
                <small>{t("watershed:satellite.directlyVisibleSubtitle", "Explicit spectral signals measured by satellite sensors")}</small>
              </div>
            </div>

            <ul className="tier-items-list">
              <li>
                <CheckCircle2 size={16} className="tier-bullet bullet-emerald" />
                <span>
                  {t(
                    "watershed:satellite.directlyVisibleItem1",
                    "Vegetative canopy vigor expansion across valley floor with mean NDVI of {{ndvi}}.",
                    { ndvi: formatDecimal(calculatedMetrics.ndvi, i18n.language, 2) }
                  )}
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="tier-bullet bullet-emerald" />
                <span>
                  {t(
                    "watershed:satellite.directlyVisibleItem2",
                    "Surface water extent in watershed check dam and percolation pond storage zones (NDWI = {{ndwi}}).",
                    { ndwi: formatDecimal(calculatedMetrics.water, i18n.language, 2) }
                  )}
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="tier-bullet bullet-emerald" />
                <span>
                  {t(
                    "watershed:satellite.directlyVisibleItem3",
                    "Positive multi-temporal greenness recovery delta ({{deltaNdvi}}) compared to baseline reference.",
                    { deltaNdvi: formatDelta(calculatedMetrics.deltaNdvi, i18n.language, 2) }
                  )}
                </span>
              </li>
            </ul>
          </div>

          {/* Tier 2: Contextually Supported */}
          <div className="sat-tier-box tier-contextual">
            <div className="tier-header">
              <div className="tier-icon-wrap icon-teal">
                <SearchCheck size={18} />
              </div>
              <div>
                <h4>{t("watershed:satellite.contextuallySupportedTitle", "Contextually Supported")}</h4>
                <small>{t("watershed:satellite.contextuallySupportedSubtitle", "Hypotheses corroborated by rainfall and geography")}</small>
              </div>
            </div>

            <ul className="tier-items-list">
              <li>
                <CheckCircle2 size={16} className="tier-bullet bullet-teal" />
                <span>
                  {t(
                    "watershed:satellite.contextuallySupportedItem1",
                    "Vegetative growth correlates with cumulative seasonal precipitation ({{rainfall}} mm) and drainage interventions.",
                    { rainfall: formatNumber(calculatedMetrics.rainfall, i18n.language) }
                  )}
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="tier-bullet bullet-teal" />
                <span>
                  {t(
                    "watershed:satellite.contextuallySupportedItem2",
                    "Surface moisture retention remains elevated 18+ days post-monsoon rain event along contour trenches."
                  )}
                </span>
              </li>
            </ul>
          </div>

          {/* Tier 3: Not Resolvable */}
          <div className="sat-tier-box tier-not-resolvable">
            <div className="tier-header">
              <div className="tier-icon-wrap icon-amber">
                <AlertOctagon size={18} />
              </div>
              <div>
                <h4>{t("watershed:satellite.notResolvableTitle", "Not Resolvable")}</h4>
                <small>{t("watershed:satellite.notResolvableSubtitle", "What optical satellite data cannot determine alone (requires ground survey)")}</small>
              </div>
            </div>

            <ul className="tier-items-list">
              <li>
                <AlertTriangle size={16} className="tier-bullet bullet-amber" />
                <span>
                  {t(
                    "watershed:satellite.notResolvableItem1",
                    "Subsurface groundwater aquifer recharge rate and water table depth cannot be determined optically."
                  )}
                </span>
              </li>
              <li>
                <AlertTriangle size={16} className="tier-bullet bullet-amber" />
                <span>
                  {t(
                    "watershed:satellite.notResolvableItem2",
                    "Crop-specific economic yield and farmer household income impact."
                  )}
                </span>
              </li>
              <li>
                <AlertTriangle size={16} className="tier-bullet bullet-amber" />
                <span>
                  {t(
                    "watershed:satellite.notResolvableItem3",
                    "Sub-surface structural integrity of check dams and farm pond embankments (requires physical inspection)."
                  )}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Downstream Action Triggers & Workflow Navigation */}
      <section className="sat-action-bar">
        <div className="sat-action-hint">
          <strong>Next Workflow Steps:</strong>
          <span>Compare multi-year temporal changes or submit this satellite observation into the Evidence Assessment gate.</span>
        </div>

        <div className="sat-action-buttons">
          <button
            type="button"
            className="sat-btn sat-btn-primary"
            onClick={handleOpenBeforeAfter}
          >
            <RefreshCw size={16} />
            <span>{t("watershed:satellite.openBeforeAfter", "Open Before/After Comparison")}</span>
            <ArrowUpRight size={15} />
          </button>

          <button
            type="button"
            className="sat-btn sat-btn-accent"
            onClick={handleSendToEvidenceAssessment}
          >
            <Send size={16} />
            <span>{t("watershed:satellite.sendEvidenceAssessment", "Send to Evidence Assessment")}</span>
          </button>
        </div>
      </section>

      {/* Metadata Slide-over / Modal */}
      {showMetadataModal && (
        <div className="sat-modal-backdrop" onClick={() => setShowMetadataModal(false)}>
          <div className="sat-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="sat-modal-header">
              <div className="sat-modal-title">
                <Satellite size={19} className="text-emerald" />
                <h3>{t("watershed:satellite.metadataTitle", "Satellite Data-Source & Acquisition Metadata")}</h3>
              </div>
              <button
                type="button"
                className="sat-modal-close"
                onClick={() => setShowMetadataModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="sat-modal-body">
              <div className="metadata-table">
                <div className="metadata-row">
                  <span className="metadata-label">{t("watershed:satellite.provider", "Data Provider")}</span>
                  <strong className="metadata-val">{t("watershed:satellite.providerValue", "ISRO Bhuvan / Copernicus Sentinel-2")}</strong>
                </div>
                <div className="metadata-row">
                  <span className="metadata-label">{t("watershed:satellite.resolution", "Spatial Resolution")}</span>
                  <strong className="metadata-val">{t("watershed:satellite.resolutionValue", "10m Ground Sample Distance (B2, B3, B4, B8)")}</strong>
                </div>
                <div className="metadata-row">
                  <span className="metadata-label">{t("watershed:satellite.processing", "Processing Level")}</span>
                  <strong className="metadata-val">{t("watershed:satellite.processingValue", "Level-2A Bottom-Of-Atmosphere (BOA) Reflectance")}</strong>
                </div>
                <div className="metadata-row">
                  <span className="metadata-label">{t("watershed:satellite.sceneId", "STAC Scene Identifier")}</span>
                  <code className="metadata-code">{calculatedMetrics.sceneId}</code>
                </div>
                <div className="metadata-row">
                  <span className="metadata-label">{t("watershed:satellite.sunElevation", "Sun Elevation Angle")}</span>
                  <strong className="metadata-val">{calculatedMetrics.sunElevation}</strong>
                </div>
                <div className="metadata-row">
                  <span className="metadata-label">{t("watershed:satellite.solarAzimuth", "Solar Azimuth")}</span>
                  <strong className="metadata-val">{calculatedMetrics.solarAzimuth}</strong>
                </div>
                <div className="metadata-row">
                  <span className="metadata-label">{t("watershed:satellite.cloudCover", "Cloud Cover")}</span>
                  <strong className="metadata-val">{calculatedMetrics.cloudCover}%</strong>
                </div>
                <div className="metadata-row">
                  <span className="metadata-label">{t("watershed:satellite.validPixels", "Valid Data Pixels")}</span>
                  <strong className="metadata-val text-emerald">{calculatedMetrics.validPixels}%</strong>
                </div>
              </div>
            </div>

            <div className="sat-modal-footer">
              <button
                type="button"
                className="sat-btn sat-btn-secondary"
                onClick={() => setShowMetadataModal(false)}
              >
                {t("watershed:satellite.closeMetadata", "Close Metadata")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Bundle Confirmation Modal */}
      {showBundleModal && (
        <div className="sat-modal-backdrop" onClick={() => setShowBundleModal(false)}>
          <div className="sat-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="sat-modal-header">
              <div className="sat-modal-title">
                <Send size={19} className="text-emerald" />
                <h3>{t("watershed:satellite.bundleModalTitle", "Send Satellite Evidence to Assessment Engine")}</h3>
              </div>
              <button
                type="button"
                className="sat-modal-close"
                onClick={() => setShowBundleModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="sat-modal-body">
              <p className="bundle-intro">
                {t(
                  "watershed:satellite.bundleModalSub",
                  "The following satellite observation payload will be bundled and passed to the rule-based Evidence Assessment module."
                )}
              </p>

              <div className="bundle-preview-card">
                <span className="bundle-preview-tag">{t("watershed:satellite.bundlePayloadTitle", "Packaged Evidence Payload")}</span>
                <pre className="bundle-json">
{JSON.stringify(
  {
    watershedId: selectedId,
    watershedName: selectedWatershed.name,
    district: selectedWatershed.district,
    state: selectedWatershed.state,
    observationDate: calculatedMetrics.observationDateStr,
    ndvi: calculatedMetrics.ndvi,
    ndwi: calculatedMetrics.water,
    deltaNdvi: calculatedMetrics.deltaNdvi,
    deltaWater: calculatedMetrics.deltaWater,
    rainfall: `${calculatedMetrics.rainfall} mm`,
    cloudCover: `${calculatedMetrics.cloudCover}%`,
    sensor: calculatedMetrics.sensor,
    evidenceContribution: calculatedMetrics.deltaNdvi >= 0.10 ? "+20 pts (Strong Positive)" : "+10 pts (Moderate)",
  },
  null,
  2
)}
                </pre>
              </div>
            </div>

            <div className="sat-modal-footer">
              <button
                type="button"
                className="sat-btn sat-btn-outline"
                onClick={() => setShowBundleModal(false)}
              >
                {t("watershed:satellite.cancel", "Cancel")}
              </button>

              <button
                type="button"
                className="sat-btn sat-btn-accent"
                onClick={handleConfirmEvidenceBundle}
              >
                <Send size={15} />
                <span>{t("watershed:satellite.confirmSend", "Confirm & Transfer to Assessment")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
