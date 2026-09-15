import React, { useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Polygon,
  Marker,
  Popup,
  Tooltip,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  majorRiverDrainageLines,
  macroCatchmentBasins,
  watershedMarkersData,
} from "../data/watershedGisData";
import { createWatershedPin } from "../utils/leafletIcons";
import {
  Layers,
  MapPin,
  Maximize2,
  Filter,
  Info,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Droplets,
  Eye,
  ExternalLink,
} from "lucide-react";

// Create custom SVG markers for watershed checkpoints with guaranteed visibility
function createWatershedIcon(priority, status) {
  return createWatershedPin({ priority, status, size: 28 });
}

function MapViewController({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function IndiaWatershedMapComponent({
  isStandalone = false,
  height = "560px",
  initialSelectedId = null,
  onMarkerSelect = null,
}) {
  // Layer Toggles
  const [layers, setLayers] = useState({
    drainageLines: true,
    catchmentBasins: true,
    inspectionMarkers: true,
    simulatedNdvi: true,
  });

  const [basemap, setBasemap] = useState("carto"); // "carto" | "satellite" | "osm"
  const [activeMarker, setActiveMarker] = useState(
    initialSelectedId
      ? watershedMarkersData.find((w) => w.id === initialSelectedId) || null
      : null
  );

  const [filterBasin, setFilterBasin] = useState("ALL");
  const [filterState, setFilterState] = useState("ALL");

  const statesList = useMemo(() => {
    return ["ALL", ...Array.from(new Set(watershedMarkersData.map((m) => m.state))).sort()];
  }, []);

  const basinsList = useMemo(() => {
    return ["ALL", ...Array.from(new Set(macroCatchmentBasins.map((b) => b.name))).sort()];
  }, []);

  const filteredMarkers = useMemo(() => {
    return watershedMarkersData.filter((m) => {
      if (filterState !== "ALL" && m.state !== filterState) return false;
      if (filterBasin !== "ALL" && !m.basin.toLowerCase().includes(filterBasin.toLowerCase().replace(" macro-catchment", "").replace(" basin", ""))) {
        return false;
      }
      return true;
    });
  }, [filterState, filterBasin]);

  const mapCenter = useMemo(() => {
    if (activeMarker) {
      return [activeMarker.lat, activeMarker.lng];
    }
    if (filterState !== "ALL" && filteredMarkers.length > 0) {
      const avgLat = filteredMarkers.reduce((s, m) => s + m.lat, 0) / filteredMarkers.length;
      const avgLng = filteredMarkers.reduce((s, m) => s + m.lng, 0) / filteredMarkers.length;
      return [avgLat, avgLng];
    }
    return [22.35, 79.5]; // Central India center
  }, [activeMarker, filterState, filteredMarkers]);

  const mapZoom = useMemo(() => {
    if (activeMarker) return 8;
    if (filterState !== "ALL") return 6;
    return isStandalone ? 5 : 5;
  }, [activeMarker, filterState, isStandalone]);

  const handleMarkerClick = (marker) => {
    setActiveMarker(marker);
    if (onMarkerSelect) onMarkerSelect(marker);
  };

  return (
    <div className={`india-watershed-map-wrapper ${isStandalone ? "standalone-mode" : "preview-mode"}`}>
      {/* Disclaimer Banner Top */}
      <div className="map-disclaimer-strip">
        <div className="disclaimer-badge">
          <Info size={14} />
          <strong>Illustrative map · Not for navigation</strong>
        </div>
        <span className="disclaimer-note">
          National prototype displaying major river drainage networks, macro-catchments, and watershed telemetry.
        </span>
        {!isStandalone && (
          <a href="/map.html" className="disclaimer-btn-link">
            <span>Open Standalone Map</span>
            <ExternalLink size={13} />
          </a>
        )}
      </div>

      <div className="map-layout-container">
        {/* Standalone Control Panel (Available on both, expanded on map.html) */}
        {isStandalone && (
          <aside className="map-control-sidebar">
            <div className="sidebar-section">
              <div className="section-title">
                <Filter size={16} />
                <span>Geographic Filter</span>
              </div>
              <div className="filter-group">
                <label>State / Region</label>
                <select
                  value={filterState}
                  onChange={(e) => {
                    setFilterState(e.target.value);
                    setActiveMarker(null);
                  }}
                  className="gov-select"
                >
                  <option value="ALL">All States (National Coverage)</option>
                  {statesList.filter((s) => s !== "ALL").map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>River Macro-Basin</label>
                <select
                  value={filterBasin}
                  onChange={(e) => {
                    setFilterBasin(e.target.value);
                    setActiveMarker(null);
                  }}
                  className="gov-select"
                >
                  <option value="ALL">All Macro-Catchments</option>
                  {basinsList.filter((b) => b !== "ALL").map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sidebar-section">
              <div className="section-title">
                <Layers size={16} />
                <span>Layer Toggles</span>
              </div>
              <div className="toggles-list">
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={layers.drainageLines}
                    onChange={(e) => setLayers({ ...layers, drainageLines: e.target.checked })}
                  />
                  <span className="toggle-indicator blue-indicator"></span>
                  <span className="toggle-text">Drainage Network (9 Major Rivers)</span>
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={layers.catchmentBasins}
                    onChange={(e) => setLayers({ ...layers, catchmentBasins: e.target.checked })}
                  />
                  <span className="toggle-indicator green-indicator"></span>
                  <span className="toggle-text">Catchment Basins (7 Regions)</span>
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={layers.inspectionMarkers}
                    onChange={(e) => setLayers({ ...layers, inspectionMarkers: e.target.checked })}
                  />
                  <span className="toggle-indicator orange-indicator"></span>
                  <span className="toggle-text">Inspection Checkpoints ({filteredMarkers.length})</span>
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={layers.simulatedNdvi}
                    onChange={(e) => setLayers({ ...layers, simulatedNdvi: e.target.checked })}
                  />
                  <span className="toggle-indicator teal-indicator"></span>
                  <span className="toggle-text">Simulated NDVI Vegetation Buffers</span>
                </label>
              </div>
            </div>

            <div className="sidebar-section">
              <div className="section-title">
                <Eye size={16} />
                <span>Basemap Style</span>
              </div>
              <div className="basemap-switch">
                <button
                  type="button"
                  className={`basemap-btn ${basemap === "carto" ? "active" : ""}`}
                  onClick={() => setBasemap("carto")}
                >
                  Clean GIS
                </button>
                <button
                  type="button"
                  className={`basemap-btn ${basemap === "satellite" ? "active" : ""}`}
                  onClick={() => setBasemap("satellite")}
                >
                  Satellite
                </button>
                <button
                  type="button"
                  className={`basemap-btn ${basemap === "osm" ? "active" : ""}`}
                  onClick={() => setBasemap("osm")}
                >
                  Standard
                </button>
              </div>
            </div>

            {/* Active Telemetry Drawer in Sidebar */}
            {activeMarker ? (
              <div className="telemetry-card active-telemetry">
                <div className="telemetry-header">
                  <div>
                    <span className="telemetry-badge">{activeMarker.id}</span>
                    <h4>{activeMarker.name}</h4>
                    <p>{activeMarker.district}, {activeMarker.state}</p>
                  </div>
                  <span className={`status-pill ${activeMarker.monitoringStatus.toLowerCase().replace(" ", "-")}`}>
                    {activeMarker.monitoringStatus}
                  </span>
                </div>

                <div className="telemetry-grid">
                  <div className="telemetry-item">
                    <span className="item-label">Catchment Area</span>
                    <strong className="item-value">{activeMarker.catchmentAreaSqKm} sq km</strong>
                  </div>
                  <div className="telemetry-item">
                    <span className="item-label">Drainage Pattern</span>
                    <strong className="item-value">{activeMarker.drainagePattern}</strong>
                  </div>
                  <div className="telemetry-item">
                    <span className="item-label">NDVI Trend</span>
                    <strong className="item-value text-green">
                      <TrendingUp size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                      {activeMarker.ndviTrend}
                    </strong>
                  </div>
                  <div className="telemetry-item">
                    <span className="item-label">Soil Moisture</span>
                    <strong className="item-value text-blue">{activeMarker.soilMoisture}</strong>
                  </div>
                  <div className="telemetry-item full-width">
                    <span className="item-label">Conservation Intervention</span>
                    <strong className="item-value">{activeMarker.intervention}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="close-telemetry-btn"
                  onClick={() => setActiveMarker(null)}
                >
                  Clear Selection
                </button>
              </div>
            ) : (
              <div className="telemetry-placeholder">
                <MapPin size={22} className="text-muted" />
                <p>Click any watershed pin on the map to inspect live catchment telemetry.</p>
              </div>
            )}
          </aside>
        )}

        {/* The Leaflet Map Canvas */}
        <div className="map-view-canvas" style={{ height }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            minZoom={4}
            maxZoom={14}
            scrollWheelZoom={isStandalone}
            className="leaflet-map-element"
            attributionControl={true}
          >
            <MapViewController center={mapCenter} zoom={mapZoom} />

            {/* Basemap Tiles */}
            {basemap === "satellite" ? (
              <TileLayer
                attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            ) : basemap === "carto" ? (
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
            ) : (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}

            {/* Green Watershed Regions (Macro-catchments) */}
            {layers.catchmentBasins &&
              macroCatchmentBasins.map((basin) => (
                <Polygon
                  key={basin.id}
                  positions={basin.coordinates}
                  pathOptions={{
                    color: basin.color,
                    fillColor: basin.fillColor,
                    fillOpacity: basin.fillOpacity,
                    weight: 1.8,
                    dashArray: "4, 4",
                  }}
                >
                  <Tooltip sticky>
                    <div className="basin-tooltip">
                      <strong>{basin.name}</strong>
                      <br />
                      <span>{basin.river}</span>
                      <br />
                      <small>Area: {basin.totalAreaSqKm} km²</small>
                    </div>
                  </Tooltip>
                </Polygon>
              ))}

            {/* Blue Drainage Lines (Major Indian River Networks) */}
            {layers.drainageLines &&
              majorRiverDrainageLines.map((river) => (
                <Polyline
                  key={river.id}
                  positions={river.coordinates}
                  pathOptions={{
                    color: river.color,
                    weight: river.weight,
                    opacity: 0.85,
                    lineJoin: "round",
                    lineCap: "round",
                  }}
                >
                  <Tooltip sticky>
                    <div className="river-tooltip">
                      <strong style={{ color: "#0284c7" }}>🌊 {river.name}</strong>
                      <br />
                      <span>Basin: {river.basin}</span>
                      <br />
                      <small>Approx. Course: {river.lengthKm} km</small>
                    </div>
                  </Tooltip>
                </Polyline>
              ))}

            {/* Simulated NDVI Buffers around active / high priority watersheds */}
            {layers.simulatedNdvi &&
              filteredMarkers.map((m) => (
                <Circle
                  key={`ndvi-${m.id}`}
                  center={[m.lat, m.lng]}
                  radius={m.catchmentAreaSqKm * 85}
                  pathOptions={{
                    color: m.ndviTrend.startsWith("+") ? "#22c55e" : "#eab308",
                    fillColor: "#4ade80",
                    fillOpacity: 0.12,
                    weight: 1,
                    dashArray: "2, 4",
                  }}
                />
              ))}

            {/* Watershed Inspection Markers */}
            {layers.inspectionMarkers &&
              filteredMarkers.map((m) => (
                <Marker
                  key={m.id}
                  position={[m.lat, m.lng]}
                  icon={createWatershedIcon(m.priority, m.monitoringStatus)}
                  eventHandlers={{
                    click: () => handleMarkerClick(m),
                  }}
                >
                  <Popup className="gov-watershed-popup">
                    <div className="popup-telemetry-content">
                      <div className="popup-top">
                        <span className="popup-code">{m.id}</span>
                        <span className={`popup-status-pill ${m.monitoringStatus.toLowerCase().replace(" ", "-")}`}>
                          {m.monitoringStatus}
                        </span>
                      </div>
                      <h4 className="popup-title">{m.name}</h4>
                      <div className="popup-location">{m.district}, {m.state}</div>

                      <div className="popup-data-table">
                        <div className="data-row">
                          <span className="row-key">Catchment Area:</span>
                          <span className="row-val"><strong>{m.catchmentAreaSqKm}</strong> sq km</span>
                        </div>
                        <div className="data-row">
                          <span className="row-key">Drainage Pattern:</span>
                          <span className="row-val">{m.drainagePattern}</span>
                        </div>
                        <div className="data-row">
                          <span className="row-key">NDVI Trend:</span>
                          <span className="row-val text-green"><strong>{m.ndviTrend}</strong></span>
                        </div>
                        <div className="data-row">
                          <span className="row-key">Soil Moisture:</span>
                          <span className="row-val text-blue"><strong>{m.soilMoisture}</strong></span>
                        </div>
                        <div className="data-row">
                          <span className="row-key">Key Intervention:</span>
                          <span className="row-val">{m.intervention}</span>
                        </div>
                      </div>

                      <div className="popup-actions">
                        <button
                          type="button"
                          className="popup-select-btn"
                          onClick={() => handleMarkerClick(m)}
                        >
                          View Full Telemetry
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>

          {/* Quick Floating Layer Toggles on Preview Mode */}
          {!isStandalone && (
            <div className="floating-preview-layer-toggles">
              <label className="chip-toggle">
                <input
                  type="checkbox"
                  checked={layers.drainageLines}
                  onChange={(e) => setLayers({ ...layers, drainageLines: e.target.checked })}
                />
                <span className="chip-dot blue"></span>
                <span>Drainage Lines</span>
              </label>

              <label className="chip-toggle">
                <input
                  type="checkbox"
                  checked={layers.catchmentBasins}
                  onChange={(e) => setLayers({ ...layers, catchmentBasins: e.target.checked })}
                />
                <span className="chip-dot green"></span>
                <span>Catchment Basins</span>
              </label>

              <label className="chip-toggle">
                <input
                  type="checkbox"
                  checked={layers.inspectionMarkers}
                  onChange={(e) => setLayers({ ...layers, inspectionMarkers: e.target.checked })}
                />
                <span className="chip-dot orange"></span>
                <span>Markers ({filteredMarkers.length})</span>
              </label>
            </div>
          )}

          {/* Map Legend (Present on both homepage preview and dedicated map page) */}
          <div className="map-legend-card">
            <div className="legend-title">GIS Map Legend</div>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-line blue-line"></span>
                <span>Blue Drainage Lines (River Networks)</span>
              </div>
              <div className="legend-item">
                <span className="legend-box green-box"></span>
                <span>Green Watershed Regions (Macro-Basins)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot green-dot"></span>
                <span>Verified Inspection Checkpoint</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot orange-dot"></span>
                <span>High-Priority Watershed Marker</span>
              </div>
            </div>
            <div className="legend-meta">
              <span>Projection: WGS 84 / Geographic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
