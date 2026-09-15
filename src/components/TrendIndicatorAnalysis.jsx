import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import {
  TrendingUp,
  Droplets,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Info,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles,
  HelpCircle,
  Eye,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileSpreadsheet
} from "lucide-react";
import { getAnalysisTrends, getAnalysisSummary } from "../api";

export default function TrendIndicatorAnalysis({
  setPage,
  initialWatershedId = "WGH-NK-01",
  watersheds = []
}) {
  // Filter States
  const [selectedWatershed, setSelectedWatershed] = useState(initialWatershedId);
  const [selectedIndicator, setSelectedIndicator] = useState("ndvi");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2026-09-15");
  const [selectedSeason, setSelectedSeason] = useState("ALL");
  const [selectedIntervention, setSelectedIntervention] = useState("ALL");

  // Data & Lifecycle States
  const [trendsData, setTrendsData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Canvas Refs for Chart.js
  const vegChartRef = useRef(null);
  const waterChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const coverageChartRef = useRef(null);

  // Chart instances tracking for clean destruction
  const chartInstances = useRef({});

  // Sync initial watershed change
  useEffect(() => {
    if (initialWatershedId) {
      setSelectedWatershed(initialWatershedId);
    }
  }, [initialWatershedId]);

  // Fetch Data
  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [trendsRes, summaryRes] = await Promise.all([
        getAnalysisTrends({
          watershedId: selectedWatershed,
          indicator: selectedIndicator,
          startDate,
          endDate,
          season: selectedSeason,
          interventionType: selectedIntervention,
        }),
        getAnalysisSummary({
          watershedId: selectedWatershed,
          interventionType: selectedIntervention,
          season: selectedSeason,
        }),
      ]);

      setTrendsData(trendsRes);
      setSummaryData(summaryRes);
    } catch (err) {
      console.error("Failed to load trend analysis data:", err);
      setError(err.message || "Failed to retrieve trend and indicator observations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedWatershed, selectedIndicator, startDate, endDate, selectedSeason, selectedIntervention]);

  // Render Charts with Chart.js
  useEffect(() => {
    if (loading || !trendsData || !summaryData) return;

    // Destroy prior instances
    Object.values(chartInstances.current).forEach((inst) => {
      if (inst && typeof inst.destroy === "function") {
        inst.destroy();
      }
    });
    chartInstances.current = {};

    const timeSeries = trendsData.time_series || [];
    const labels = timeSeries.map((d) => d.date);
    const values = timeSeries.map((d) => d.value);
    const baseVal = trendsData.baseline_value || 0.46;

    // -------------------------------------------------------------
    // Chart 1: Vegetation Trend (NDVI / VCI Line Chart)
    // -------------------------------------------------------------
    if (vegChartRef.current && timeSeries.length > 0) {
      const isVci = selectedIndicator === "vci";
      const ctx = vegChartRef.current.getContext("2d");

      // Gradient fill for line
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, "rgba(22, 163, 74, 0.35)");
      gradient.addColorStop(1, "rgba(22, 163, 74, 0.0)");

      chartInstances.current.veg = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: isVci ? "Vegetation Condition Index (%)" : "Observed NDVI (10m Zonal Mean)",
              data: values,
              borderColor: "#16a34a",
              backgroundColor: gradient,
              fill: true,
              tension: 0.35,
              pointBackgroundColor: "#16a34a",
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
              pointRadius: 4.5,
              pointHoverRadius: 7,
            },
            {
              label: `Baseline Benchmark (${baseVal})`,
              data: new Array(labels.length).fill(baseVal),
              borderColor: "#ea580c",
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false,
              borderWidth: 1.8,
            }
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: { boxWidth: 14, font: { size: 12, weight: "600" } },
            },
            tooltip: {
              backgroundColor: "#072544",
              titleFont: { size: 13, weight: "700" },
              bodyFont: { size: 12 },
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                afterBody: (context) => {
                  const idx = context[0].dataIndex;
                  const item = timeSeries[idx];
                  if (!item) return "";
                  return [
                    `Season: ${item.season}`,
                    `Cloud-free: ${item.cloud_free}%`,
                    `Sensor: ${item.source} (${item.resolution_m}m)`,
                  ];
                },
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { maxRotation: 45, minRotation: 30, font: { size: 11 } },
            },
            y: {
              beginAtZero: false,
              grid: { color: "rgba(2, 132, 199, 0.08)" },
              title: {
                display: true,
                text: isVci ? "VCI Score (%)" : "NDVI Index (-1 to +1)",
                font: { size: 11, weight: "600" },
              },
            },
          },
        },
      });
    }

    // -------------------------------------------------------------
    // Chart 2: Surface-Water Trend (NDWI Line Chart)
    // -------------------------------------------------------------
    if (waterChartRef.current && timeSeries.length > 0) {
      const ctx = waterChartRef.current.getContext("2d");
      // Calculate realistic water curve if indicator isn't ndwi
      const waterValues = timeSeries.map((item, idx) => {
        if (selectedIndicator === "ndwi" || selectedIndicator === "water") {
          return item.value;
        }
        // Simulated coupled NDWI curve
        const season = item.season;
        const base = 0.48;
        const progress = idx / (timeSeries.length - 1);
        const seasonal = season === "Kharif" ? 0.14 : (season === "Post-Monsoon" ? 0.09 : (season === "Rabi" ? 0.02 : -0.10));
        return Math.round((base + 0.16 * progress + seasonal) * 100) / 100;
      });

      const waterBase = summaryData.indicator_stats?.ndwi?.baseline || 0.48;

      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, "rgba(2, 132, 199, 0.40)");
      gradient.addColorStop(1, "rgba(2, 132, 199, 0.02)");

      chartInstances.current.water = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Surface Water / NDWI Index",
              data: waterValues,
              borderColor: "#0284c7",
              backgroundColor: gradient,
              fill: true,
              tension: 0.35,
              pointBackgroundColor: "#0284c7",
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
              pointRadius: 4.5,
              pointHoverRadius: 7,
            },
            {
              label: `Pre-Project Water Baseline (${waterBase})`,
              data: new Array(labels.length).fill(waterBase),
              borderColor: "#64748b",
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false,
              borderWidth: 1.8,
            }
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: { boxWidth: 14, font: { size: 12, weight: "600" } },
            },
            tooltip: {
              backgroundColor: "#072544",
              titleFont: { size: 13, weight: "700" },
              bodyFont: { size: 12 },
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                afterBody: (context) => {
                  const idx = context[0].dataIndex;
                  const item = timeSeries[idx];
                  if (!item) return "";
                  return [
                    `Season: ${item.season}`,
                    `Retention: Structures retain residual moisture`,
                    `Note: Regional rainfall is governing factor`,
                  ];
                },
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { maxRotation: 45, minRotation: 30, font: { size: 11 } },
            },
            y: {
              beginAtZero: false,
              grid: { color: "rgba(2, 132, 199, 0.08)" },
              title: {
                display: true,
                text: "NDWI Index (-1 to +1)",
                font: { size: 11, weight: "600" },
              },
            },
          },
        },
      });
    }

    // -------------------------------------------------------------
    // Chart 3: Intervention Status (Bar Chart)
    // -------------------------------------------------------------
    if (statusChartRef.current) {
      const ctx = statusChartRef.current.getContext("2d");
      const statusSummary = summaryData.interventions_summary || {
        verified: 12,
        needs_review: 4,
        inconclusive: 2,
      };

      chartInstances.current.status = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Verified (Field + Sat)", "Needs Review", "Inconclusive"],
          datasets: [
            {
              label: "Intervention Structures Count",
              data: [
                statusSummary.verified,
                statusSummary.needs_review,
                statusSummary.inconclusive,
              ],
              backgroundColor: ["#16a34a", "#f59e0b", "#64748b"],
              borderRadius: 6,
              borderWidth: 1,
              borderColor: ["#15803d", "#d97706", "#475569"],
            }
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#072544",
              titleFont: { size: 13, weight: "700" },
              bodyFont: { size: 12 },
              padding: 10,
              cornerRadius: 8,
            },
          },
          scales: {
            x: { grid: { display: false } },
            y: {
              beginAtZero: true,
              ticks: { stepSize: 2 },
              grid: { color: "rgba(2, 132, 199, 0.08)" },
              title: {
                display: true,
                text: "Number of Sites",
                font: { size: 11, weight: "600" },
              },
            },
          },
        },
      });
    }

    // -------------------------------------------------------------
    // Chart 4: Evidence Coverage (Doughnut Chart)
    // -------------------------------------------------------------
    if (coverageChartRef.current) {
      const ctx = coverageChartRef.current.getContext("2d");
      const coverage = summaryData.evidence_coverage || {
        complete: 12,
        incomplete: 4,
        low_confidence: 2,
      };

      chartInstances.current.coverage = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: [
            "Complete (Photo + GPS + GIS)",
            "Incomplete (Missing GPS/Photo)",
            "Low-Confidence (Stale/Obstructed)",
          ],
          datasets: [
            {
              data: [coverage.complete, coverage.incomplete, coverage.low_confidence],
              backgroundColor: ["#0284c7", "#f59e0b", "#ef4444"],
              hoverOffset: 6,
              borderWidth: 2,
              borderColor: "#ffffff",
            }
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: { boxWidth: 12, font: { size: 11 }, padding: 12 },
            },
            tooltip: {
              backgroundColor: "#072544",
              titleFont: { size: 12, weight: "700" },
              bodyFont: { size: 11 },
              padding: 10,
              cornerRadius: 8,
            },
          },
          cutout: "68%",
        },
      });
    }

    return () => {
      Object.values(chartInstances.current).forEach((inst) => {
        if (inst && typeof inst.destroy === "function") {
          inst.destroy();
        }
      });
    };
  }, [loading, trendsData, summaryData, selectedIndicator]);

  // Export Filtered Records as CSV
  function handleExportCsv() {
    if (!trendsData || !trendsData.time_series || trendsData.time_series.length === 0) {
      alert("No time-series records available to export for the selected filters.");
      return;
    }

    const headers = [
      "Date",
      "Watershed ID",
      "Watershed Name",
      "Indicator",
      "Value",
      "Season",
      "Source",
      "Resolution (m)",
      "Cloud-Free (%)",
      "Confidence",
    ];

    const rows = trendsData.time_series.map((item) => [
      item.date,
      item.watershed,
      `"${trendsData.watershed_name.replace(/"/g, '""')}"`,
      item.indicator.toUpperCase(),
      item.value,
      item.season,
      `"${item.source}"`,
      item.resolution_m,
      `${item.cloud_free}%`,
      item.confidence,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `JalSetu_Trends_${trendsData.watershed}_${selectedIndicator}_${startDate}_${endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Quick reset filters helper
  function handleResetFilters() {
    setSelectedWatershed(initialWatershedId || "WGH-NK-01");
    setSelectedIndicator("ndvi");
    setStartDate("2024-01-01");
    setEndDate("2026-09-15");
    setSelectedSeason("ALL");
    setSelectedIntervention("ALL");
  }

  return (
    <div className="page trend-analysis-page">
      {/* Page Header */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">TEMPORAL TIME-SERIES & MULTI-DATE INDICATORS</span>
          <h1>Trend and Indicator Analysis</h1>
          <p>
            Multi-temporal satellite vegetation & hydrological trends, intervention verification status,
            and evidence coverage monitoring across Indian watersheds.
          </p>
        </div>

        <div className="heading-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={handleExportCsv}
            disabled={loading || !trendsData}
            title="Download filtered time-series as CSV spreadsheet"
          >
            <FileSpreadsheet size={16} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={loadData}
            disabled={loading}
            title="Refresh satellite trend data"
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Official Data Source Attribution & Disclaimer Banner */}
      <div className="trend-banner-alert">
        <div className="banner-icon">
          <Info size={18} color="#0284c7" />
        </div>
        <div className="banner-content">
          <strong>Official Earth Observation & Geospatial Attribution</strong>
          <p>
            Data calibrated using <strong>Copernicus Sentinel-2 L2A (10m)</strong> and <strong>ISRO Bhuvan / NRSC Open Geospatial Archives</strong>.
            All Waghad, Kadwa, Darna, and benchmark intervention numbers are cataloged as <strong>Prototype / Sample Data</strong> for decision-support testing.
          </p>
          <div className="banner-chips">
            <span className="badge-tag prototype">Prototype / Sample Data</span>
            <span className="badge-tag attribution">ISRO Bhuvan & IWMP-SRISHTI Compliant</span>
            <span className="badge-tag causality-warning">⚠️ Supporting evidence only — not proof of causality</span>
          </div>
        </div>
      </div>

      {/* 5-Item Dynamic Filter Bar */}
      <section className="content-card trend-filters-card">
        <div className="filter-header-bar">
          <div className="filter-title">
            <Filter size={16} color="#072544" />
            <strong>Analysis Filters & Temporal Controls</strong>
          </div>
          <button type="button" className="btn-text-link" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>

        <div className="filters-grid-row">
          {/* 1. Watershed Filter */}
          <label className="filter-field">
            <span>Watershed</span>
            <select
              value={selectedWatershed}
              onChange={(e) => setSelectedWatershed(e.target.value)}
              disabled={loading}
            >
              {watersheds && watersheds.length > 0 ? (
                watersheds.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.district}, {w.state})
                  </option>
                ))
              ) : (
                <>
                  <option value="WGH-NK-01">Waghad Watershed (Nashik, MH)</option>
                  <option value="KDW-NK-02">Kadwa Watershed (Nashik, MH)</option>
                  <option value="DRN-NK-03">Darna Watershed (Nashik, MH)</option>
                  <option value="RLG-AH-06">Ralegan Siddhi (Ahmednagar, MH)</option>
                  <option value="ARV-AL-10">Arvari River (Alwar, RJ)</option>
                </>
              )}
            </select>
          </label>

          {/* 2. Indicator Filter */}
          <label className="filter-field">
            <span>Indicator</span>
            <select
              value={selectedIndicator}
              onChange={(e) => setSelectedIndicator(e.target.value)}
              disabled={loading}
            >
              <option value="ndvi">NDVI — Vegetation Index (10m)</option>
              <option value="vci">VCI — Vegetation Condition Index (%)</option>
              <option value="ndwi">NDWI — Surface Water Index (10m)</option>
              <option value="water">Surface Water & Soil Moisture Index</option>
            </select>
          </label>

          {/* 3. Start Date */}
          <label className="filter-field">
            <span>Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={loading}
              min="2023-01-01"
              max="2026-12-31"
            />
          </label>

          {/* 4. End Date */}
          <label className="filter-field">
            <span>End Date</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={loading}
              min="2023-01-01"
              max="2026-12-31"
            />
          </label>

          {/* 5. Season Filter */}
          <label className="filter-field">
            <span>Season</span>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              disabled={loading}
            >
              <option value="ALL">All Seasons (Annual Composite)</option>
              <option value="Kharif">Kharif (Monsoon Crop / Jun–Oct)</option>
              <option value="Post-Monsoon">Post-Monsoon (Recharge / Oct–Nov)</option>
              <option value="Rabi">Rabi (Winter Harvest / Nov–Mar)</option>
              <option value="Zaid">Zaid (Summer Dry Season / Mar–Jun)</option>
            </select>
          </label>

          {/* 6. Intervention Type Filter */}
          <label className="filter-field">
            <span>Intervention Type</span>
            <select
              value={selectedIntervention}
              onChange={(e) => setSelectedIntervention(e.target.value)}
              disabled={loading}
            >
              <option value="ALL">All Structure Types</option>
              <option value="Check Dam">Check Dam (Cement / Masonry)</option>
              <option value="Farm Pond">Farm Pond / Percolation Pit</option>
              <option value="Continuous Contour Trenching">Continuous Contour Trenching (CCT)</option>
              <option value="Percolation Tank">Percolation Tank & Earthen Bunds</option>
              <option value="Traditional Johad">Traditional Johad & Anicut</option>
            </select>
          </label>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="content-card trend-loading-state">
          <div className="spinner-large" />
          <h4>Synthesizing Multi-Date Earth Observations...</h4>
          <p>Evaluating Sentinel-2 L2A orbital cycles, cloud-cover filtering, and database benchmarks.</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="content-card trend-error-card">
          <AlertTriangle size={32} color="#dc2626" />
          <h4>Failed to Load Trend Observations</h4>
          <p>{error}</p>
          <button type="button" className="primary-btn" onClick={loadData}>
            <RefreshCw size={15} /> Retry Request
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && trendsData && (!trendsData.time_series || trendsData.time_series.length === 0) && (
        <div className="content-card trend-empty-card">
          <Calendar size={36} color="#64748b" />
          <h4>No Observations Match the Selected Filter Range</h4>
          <p>
            No cloud-free Sentinel-2 overpasses were found for the chosen date window ({startDate} to {endDate}) or season ({selectedSeason}).
          </p>
          <button type="button" className="secondary-btn" onClick={handleResetFilters}>
            Reset Filters to Full Multi-Year Series
          </button>
        </div>
      )}

      {/* Content Display when Ready */}
      {!loading && !error && trendsData && trendsData.time_series && trendsData.time_series.length > 0 && (
        <>
          {/* KPI Summary Strip */}
          <div className="trend-kpi-grid">
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Latest {trendsData.indicator_name}</span>
                <Sparkles size={16} color="#0284c7" />
              </div>
              <div className="kpi-value-row">
                <span className="kpi-main-number">{trendsData.current_value}</span>
                <span className={`kpi-badge ${trendsData.change_delta >= 0 ? "positive" : "negative"}`}>
                  {trendsData.change_delta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {trendsData.change_percentage} vs Baseline
                </span>
              </div>
              <small className="kpi-footnote">
                Baseline Benchmark: {trendsData.baseline_value} ({trendsData.unit})
              </small>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Observations Synthesized</span>
                <Calendar size={16} color="#16a34a" />
              </div>
              <div className="kpi-value-row">
                <span className="kpi-main-number">{trendsData.observation_count}</span>
                <span className="kpi-badge neutral">Multi-Temporal Passes</span>
              </div>
              <small className="kpi-footnote">
                Span: {startDate} to {endDate}
              </small>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Valid-Data / Cloud-Free Quality</span>
                <ShieldCheck size={16} color="#0284c7" />
              </div>
              <div className="kpi-value-row">
                <span className="kpi-main-number">
                  {Math.round(
                    trendsData.time_series.reduce((sum, item) => sum + item.cloud_free, 0) /
                      trendsData.time_series.length
                  )}%
                </span>
                <span className="kpi-badge positive">Cloud &lt; 20% Filtered</span>
              </div>
              <small className="kpi-footnote">
                Sensor: Sentinel-2 L2A (10m Zonal Resolution)
              </small>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Composite Verification Status</span>
                <CheckCircle2 size={16} color="#ea580c" />
              </div>
              <div className="kpi-value-row">
                <span className="kpi-main-number">
                  {summaryData?.interventions_summary?.verified || 12} /{" "}
                  {summaryData?.interventions_summary?.total || 18}
                </span>
                <span className="kpi-badge neutral">
                  {trendsData.metadata?.confidence_level || "82% Confidence"}
                </span>
              </div>
              <small className="kpi-footnote">
                {summaryData?.interventions_summary?.needs_review || 4} structures pending inspection
              </small>
            </div>
          </div>

          {/* Visualisations Grid: 4 Core Charts */}
          <div className="trend-charts-grid">
            {/* Chart 1: Vegetation Trend */}
            <div className="content-card chart-container-card">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title-row">
                    <TrendingUp size={18} color="#16a34a" />
                    <h3>Vegetation Trend (NDVI / VCI Over Time)</h3>
                  </div>
                  <p className="chart-card-subtitle">
                    Multi-date vegetative canopy vigor vs pre-project baseline benchmark ({trendsData.baseline_value}).
                  </p>
                </div>
                <div className="chart-pills">
                  <span className="status-pill directly-visible">Directly visible (10m)</span>
                </div>
              </div>

              <div className="chart-canvas-wrapper">
                <canvas ref={vegChartRef} />
              </div>

              {/* Explainability & Disclaimers Footer */}
              <div className="chart-explainability-box">
                <div className="explain-row">
                  <span className="meta-key">Data Source:</span>
                  <span className="meta-val">{trendsData.metadata?.source}</span>
                </div>
                <div className="explain-row">
                  <span className="meta-key">Resolution & Quality:</span>
                  <span className="meta-val">10m Ground Resolution • Cloud-free pixels &gt; 80%</span>
                </div>
                <div className="explain-row">
                  <span className="meta-key">Non-Technical Explanation:</span>
                  <span className="meta-val highlight">
                    “{trendsData.metadata?.non_technical_explanation}”
                  </span>
                </div>
                <div className="explain-disclaimer-tag">
                  ⚠️ <strong>Causality Disclaimer:</strong> {trendsData.metadata?.labels?.causality_note}
                </div>
              </div>
            </div>

            {/* Chart 2: Surface-Water Trend */}
            <div className="content-card chart-container-card">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title-row">
                    <Droplets size={18} color="#0284c7" />
                    <h3>Surface-Water Trend (NDWI & Catchment Retention)</h3>
                  </div>
                  <p className="chart-card-subtitle">
                    Hydrological reflection patterns across Kharif monsoon fill and Rabi post-monsoon drawdowns.
                  </p>
                </div>
                <div className="chart-pills">
                  <span className="status-pill contextually-supported">Contextually supported</span>
                </div>
              </div>

              <div className="chart-canvas-wrapper">
                <canvas ref={waterChartRef} />
              </div>

              {/* Explainability & Disclaimers Footer */}
              <div className="chart-explainability-box">
                <div className="explain-row">
                  <span className="meta-key">Data Source:</span>
                  <span className="meta-val">Sentinel-2 L2A Band Math (B03 - B08) / (B03 + B08)</span>
                </div>
                <div className="explain-row">
                  <span className="meta-key">Hydrological Behaviour:</span>
                  <span className="meta-val">
                    Peak surface retention observed in Post-Monsoon (Oct–Nov); steady decline in Zaid (Apr–May).
                  </span>
                </div>
                <div className="explain-row">
                  <span className="meta-key">Non-Technical Explanation:</span>
                  <span className="meta-val highlight">
                    “Water availability peaks following monsoon recharge cycles. Check dams hold localized moisture, but regional monsoon intensity is the dominant variable.”
                  </span>
                </div>
                <div className="explain-disclaimer-tag">
                  ⚠️ <strong>Causality Disclaimer:</strong> Supporting evidence only — not proof of causality
                </div>
              </div>
            </div>

            {/* Chart 3: Intervention Status */}
            <div className="content-card chart-container-card">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title-row">
                    <ShieldCheck size={18} color="#072544" />
                    <h3>Intervention Status Breakdown</h3>
                  </div>
                  <p className="chart-card-subtitle">
                    Distribution of Verified, Needs Review, and Inconclusive watershed structures.
                  </p>
                </div>
                <div className="chart-pills">
                  <span className="status-pill not-resolvable">Micro-structures &lt;10m unresolvable</span>
                </div>
              </div>

              <div className="chart-canvas-wrapper">
                <canvas ref={statusChartRef} />
              </div>

              {/* Explainability & Disclaimers Footer */}
              <div className="chart-explainability-box">
                <div className="explain-row">
                  <span className="meta-key">Classification Rules:</span>
                  <span className="meta-val">
                    <strong>Verified:</strong> Field GPS & Photo matched with optical response.{" "}
                    <strong>Needs Review:</strong> Evidence conflict or missing observation.{" "}
                    <strong>Inconclusive:</strong> Obstructed or small-scale trenching (&lt;2m).
                  </span>
                </div>
                <div className="explain-row">
                  <span className="meta-key">Intervention Types:</span>
                  <span className="meta-val">
                    {selectedIntervention === "ALL" ? "All Structures Included" : selectedIntervention}
                  </span>
                </div>
                <div className="explain-disclaimer-tag">
                  ℹ️ <strong>Field Guidance:</strong> Structures labeled 'Inconclusive' require on-ground officer inspection.
                </div>
              </div>
            </div>

            {/* Chart 4: Evidence Coverage */}
            <div className="content-card chart-container-card">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title-row">
                    <Layers size={18} color="#ea580c" />
                    <h3>Evidence Coverage & Audit Confidence</h3>
                  </div>
                  <p className="chart-card-subtitle">
                    Ratio of complete field photographs, geotagged evidence, and audit documentation.
                  </p>
                </div>
                <div className="chart-pills">
                  <span className="status-pill supported-only">Supporting evidence only</span>
                </div>
              </div>

              <div className="chart-canvas-wrapper doughnut-wrapper">
                <canvas ref={coverageChartRef} />
              </div>

              {/* Explainability & Disclaimers Footer */}
              <div className="chart-explainability-box">
                <div className="explain-row">
                  <span className="meta-key">Evidence Completeness:</span>
                  <span className="meta-val">
                    {summaryData?.evidence_coverage?.complete} Complete •{" "}
                    {summaryData?.evidence_coverage?.incomplete} Incomplete •{" "}
                    {summaryData?.evidence_coverage?.low_confidence} Low-Confidence
                  </span>
                </div>
                <div className="explain-row">
                  <span className="meta-key">Data Source:</span>
                  <span className="meta-val">IWMP-SRISHTI Geoportal & Mobile Field Upload Records</span>
                </div>
                <div className="explain-disclaimer-tag">
                  ⚠️ <strong>Audit Notice:</strong> Low-confidence records are excluded from high-level state compliance dashboards.
                </div>
              </div>
            </div>
          </div>

          {/* Cross-Module Navigation Bridge */}
          <div className="content-card trend-navigation-bridge">
            <div className="bridge-content">
              <h4>Need Spatial Side-by-Side Verification?</h4>
              <p>
                Trend and Indicator Analysis tracks quantitative multi-temporal trends. For high-resolution visual
                split-view maps and raster comparison overlays, open the dedicated <strong>Before–After Comparison</strong> module.
              </p>
            </div>
            <div className="bridge-actions">
              <button
                type="button"
                className="primary-btn"
                onClick={() => setPage("Before / After", { watershedId: selectedWatershed })}
              >
                <span>Open Before / After Comparison</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
