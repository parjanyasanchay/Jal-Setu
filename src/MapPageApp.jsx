import React from "react";
import IndiaWatershedMapComponent from "./components/IndiaWatershedMapComponent";
import "./home.css";
import { ArrowLeft, ExternalLink, ShieldCheck, Layers, Droplets } from "lucide-react";

export default function MapPageApp() {
  return (
    <div className="standalone-map-page-layout">
      {/* Top Navigation Bar: Brand text only (no logo graphic) */}
      <header className="standalone-map-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <a href="/" className="back-to-home-link">
            <ArrowLeft size={16} />
            <span>Homepage</span>
          </a>

          <div className="brand-text-block">
            <span className="brand-title" style={{ fontSize: "1.25rem" }}>
              Jal <span className="brand-accent">Setu</span>
            </span>
            <span className="brand-subtitle" style={{ fontSize: "0.65rem" }}>
              India Watershed Geospatial Explorer
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <a
            href="https://bhuvan-app1.nrsc.gov.in/bhuvan2d/bhuvan/bhuvan2d.php"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#0369a1",
              padding: "0.4rem 0.75rem",
              background: "#e0f2fe",
              borderRadius: "4px",
            }}
          >
            <span>Bhuvan 2D Portal</span>
            <ExternalLink size={13} />
          </a>

          <a href="/auth.html#login" className="btn-login-outline" style={{ padding: "0.4rem 0.95rem" }}>
            Officer Portal
          </a>
        </div>
      </header>

      {/* Standalone Full Interactive Map Component */}
      <main className="standalone-map-container">
        <IndiaWatershedMapComponent
          isStandalone={true}
          height="calc(100vh - 64px)"
        />
      </main>
    </div>
  );
}
