import React, { useState } from "react";
import IndiaWatershedMapComponent from "./components/IndiaWatershedMapComponent";
import "./home.css";
import {
  MapPin,
  Satellite,
  Camera,
  ClipboardCheck,
  Droplets,
  Layers,
  Activity,
  ShieldCheck,
  FileText,
  ArrowRight,
  CheckCircle2,
  Mail,
  Send,
  Building2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Shield,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";

export default function HomepageApp() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Contact form state & validation
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactDept, setContactDept] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [messageSent, setMessageSent] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!contactName.trim()) {
      errors.name = "Please enter your full name.";
    }
    if (!contactEmail.trim() || !contactEmail.includes("@")) {
      errors.email = "Please enter a valid institutional email.";
    }
    if (!contactMessage.trim() || contactMessage.length < 10) {
      errors.message = "Please enter a message with at least 10 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setMessageSent(true);
    setTimeout(() => {
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      setContactDept("");
    }, 500);
  };

  return (
    <div className="jalsetu-site">
      {/* ==========================================================================
          1. BRANDING & HEADER (No Logo Graphic)
          Sticky White Navigation Bar
          ========================================================================== */}
      <header className="jalsetu-navbar">
        <div className="nav-container">
          {/* Brand Text Only - Strictly No Logo Graphic or Icon next to brand name */}
          <a href="/" className="brand-text-block" title="Jal Setu Home">
            <span className="brand-title">
              Jal <span className="brand-accent">Setu</span>
            </span>
            <span className="brand-subtitle">Watershed Intelligence Platform</span>
          </a>

          {/* Desktop Navigation Links */}
          <nav>
            <ul className="nav-links">
              <li>
                <a href="#about" className="nav-link">About</a>
              </li>
              <li>
                <a href="/map.html" className="nav-link">India Map</a>
              </li>
              <li>
                <a href="#features" className="nav-link">Features</a>
              </li>
              <li>
                <a href="#contact" className="nav-link">Contact Us</a>
              </li>
            </ul>
          </nav>

          {/* Action Buttons: Login (Outlined Blue) & Sign Up (Filled Green) */}
          <div className="nav-actions">
            <a href="/auth.html#login" className="btn-login-outline">
              Login
            </a>
            <a href="/auth.html#signup" className="btn-signup-solid">
              Sign Up
            </a>
            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0" }}>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <li>
                <a href="#about" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600, color: "#072544" }}>
                  About
                </a>
              </li>
              <li>
                <a href="/map.html" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600, color: "#0284c7" }}>
                  India Map
                </a>
              </li>
              <li>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600, color: "#072544" }}>
                  Features
                </a>
              </li>
              <li>
                <a href="#contact" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600, color: "#072544" }}>
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* ==========================================================================
          3. HERO SECTION (Two-Column Layout)
          ========================================================================== */}
      <section className="hero-section">
        <div className="hero-container">
          {/* Left Column */}
          <div className="hero-left-column">
            <div className="hero-gov-badge">
              <ShieldCheck size={15} />
              <span>National Geospatial Decision Support</span>
            </div>

            <h1 className="hero-headline">
              Field Evidence.<br />
              Environmental Context.<br />
              <span style={{ color: "#0284c7" }}>Clearer Decisions.</span>
            </h1>

            <p className="hero-subtitle">
              Jal Setu connects field photographs, GIS maps, satellite observations and government water-resource data to support transparent watershed monitoring and better inspection decisions.
            </p>

            <div className="hero-actions">
              <a href="/auth.html" className="btn-hero-primary">
                <span>Explore Jal Setu</span>
                <ArrowRight size={17} />
              </a>
              <a href="/map.html" className="btn-hero-secondary">
                <Layers size={17} />
                <span>View India Watershed Map</span>
              </a>
            </div>

            <div className="hero-trust-indicators">
              <div className="trust-item">
                <CheckCircle2 size={16} />
                <span>ISRO / NRSC Bhuvan Ready</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={16} />
                <span>Explainable Evidence Fusion</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={16} />
                <span>8 Pilot States</span>
              </div>
            </div>
          </div>

          {/* Right Column (Aesthetic Farmer Photograph in Wide Rectangular Crop) */}
          <div className="hero-right-column">
            {/* Decorative SVG GIS contour lines and water-ripple patterns */}
            <svg
              className="svg-gis-contours-bg"
              viewBox="0 0 600 450"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Water Ripples */}
              <circle cx="500" cy="180" r="140" stroke="#bae6fd" strokeWidth="1.2" strokeDasharray="6 4" opacity="0.45" />
              <circle cx="500" cy="180" r="190" stroke="#bae6fd" strokeWidth="1" strokeDasharray="8 6" opacity="0.35" />
              <circle cx="500" cy="180" r="240" stroke="#7dd3fc" strokeWidth="0.8" strokeDasharray="10 8" opacity="0.25" />

              {/* GIS Topo Contours */}
              <path
                d="M10 40 Q 140 10 260 80 T 480 90 T 590 30"
                stroke="#16a34a"
                strokeWidth="1.5"
                opacity="0.3"
                fill="none"
              />
              <path
                d="M20 90 Q 150 70 280 130 T 520 140 T 590 110"
                stroke="#0284c7"
                strokeWidth="1.2"
                opacity="0.25"
                fill="none"
              />
              <path
                d="M0 360 Q 120 320 280 390 T 460 370 T 600 410"
                stroke="#16a34a"
                strokeWidth="1.5"
                opacity="0.3"
                fill="none"
              />
              <path
                d="M10 410 Q 160 380 320 420 T 540 390 T 600 440"
                stroke="#0284c7"
                strokeWidth="1.2"
                opacity="0.25"
                fill="none"
              />
            </svg>

            {/* Farmer Photo Container: Wide rectangular crop with rounded corners, farmer on right */}
            <div className="farmer-photo-frame">
              <img
                src="/farmer.jpg"
                alt="Indian farmer cultivating agricultural paddy field in sustainable watershed"
                className="farmer-photo-img"
              />

              {/* Subtle Blue-Green Gradient Overlay on the left side only */}
              <div className="farmer-gradient-overlay" />

              {/* Decorative SVG GIS grid lines overlay */}
              <div className="photo-gis-grid-lines" />

              {/* Floating Card: Supporting Sustainable Watersheds (Soil Moisture & Catchment Rejuvenation) */}
              <div className="hero-floating-card">
                <div className="floating-card-icon">
                  <Droplets size={22} />
                </div>
                <div className="floating-card-text">
                  <span className="floating-card-title">Supporting Sustainable Watersheds</span>
                  <span className="floating-card-subtitle">Soil Moisture & Catchment Rejuvenation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          4. IMPACT STRIP
          ========================================================================== */}
      <section className="impact-strip-section">
        <div className="impact-grid">
          <div className="impact-card">
            <div className="impact-icon-box">
              <Layers size={22} />
            </div>
            <div className="impact-text">
              <h4>GIS-Based Monitoring</h4>
              <p>Geospatial river basin delineation and micro-catchment boundary analysis.</p>
            </div>
          </div>

          <div className="impact-card">
            <div className="impact-icon-box">
              <Satellite size={22} />
            </div>
            <div className="impact-text">
              <h4>Satellite Insights</h4>
              <p>NDVI vegetation index tracking, surface water trends, and temporal indices.</p>
            </div>
          </div>

          <div className="impact-card">
            <div className="impact-icon-box">
              <Camera size={22} />
            </div>
            <div className="impact-text">
              <h4>Field Evidence</h4>
              <p>Geo-tagged photographs, timestamp verification, and ground-truth records.</p>
            </div>
          </div>

          <div className="impact-card">
            <div className="impact-icon-box">
              <ClipboardCheck size={22} />
            </div>
            <div className="impact-text">
              <h4>Actionable Inspections</h4>
              <p>Risk-scored visit prioritization and objective officer review workflows.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          4. ABOUT JAL SETU SECTION & 6-STEP WORKFLOW
          ========================================================================== */}
      <section id="about" className="about-section">
        <div className="about-container">
          <div className="section-header-centered">
            <span className="section-tag">Institutional Mission</span>
            <h2 className="section-title">Connecting Water, Data and Decisions</h2>
          </div>

          <div className="about-quote-box">
            <p className="about-quote-text">
              “Jal Setu is a watershed monitoring and decision-support platform that connects field photographs, GIS maps and satellite observations in one place. It helps officers understand watershed conditions, monitor interventions, identify environmental changes and find sites that require further verification. The platform uses explainable evidence assessment and adaptive survey planning to support practical, data-driven decisions. Our goal is to bridge the gap between field evidence, environmental context and clearer watershed-management decisions. Satellite observations provide supporting evidence; final verification may require field photographs and officer review.”
            </p>
          </div>

          {/* Connected 6-step workflow */}
          <div className="workflow-block">
            <h3 className="workflow-heading">Connected Decision-Support Workflow</h3>

            <div className="workflow-pipeline">
              <div className="workflow-step">
                <div className="step-number">1</div>
                <strong className="step-label">Observe</strong>
                <span className="step-sub">Satellite indices & precipitation</span>
              </div>

              <div className="workflow-connector">
                <ChevronRight size={22} />
              </div>

              <div className="workflow-step">
                <div className="step-number">2</div>
                <strong className="step-label">Compare Change</strong>
                <span className="step-sub">Before / after intervention analysis</span>
              </div>

              <div className="workflow-connector">
                <ChevronRight size={22} />
              </div>

              <div className="workflow-step">
                <div className="step-number">3</div>
                <strong className="step-label">Fuse Evidence</strong>
                <span className="step-sub">Cross-validate GIS & field photo</span>
              </div>

              <div className="workflow-connector">
                <ChevronRight size={22} />
              </div>

              <div className="workflow-step">
                <div className="step-number">4</div>
                <strong className="step-label">Prioritise Visit</strong>
                <span className="step-sub">Target high evidence-gap sites</span>
              </div>

              <div className="workflow-connector">
                <ChevronRight size={22} />
              </div>

              <div className="workflow-step">
                <div className="step-number">5</div>
                <strong className="step-label">Officer Review</strong>
                <span className="step-sub">Official sign-off & remarks</span>
              </div>

              <div className="workflow-connector">
                <ChevronRight size={22} />
              </div>

              <div className="workflow-step">
                <div className="step-number">6</div>
                <strong className="step-label">Generate Report</strong>
                <span className="step-sub">Transparent audit & dossier</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          4. CORE FEATURES GRID (6 Rounded Cards)
          ========================================================================== */}
      <section id="features" className="features-section">
        <div className="about-container">
          <div className="section-header-centered">
            <span className="section-tag">Platform Capabilities</span>
            <h2 className="section-title">Comprehensive Watershed Tools</h2>
            <p style={{ color: "#475569", fontSize: "1.05rem" }}>
              Engineered for project directors, GIS analysts, field inspectors, and evaluators across national water conservation programs.
            </p>
          </div>

          <div className="features-grid">
            {/* Card 1: Watershed Explorer */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Droplets size={24} />
              </div>
              <h3 className="feature-title">Watershed Explorer</h3>
              <p className="feature-desc">
                Interactive registry of catchment units across 8 states. Filter by state, district, drainage pattern, and intervention status with real-time summary analytics.
              </p>
              <a href="/map.html" className="feature-footer-action">
                <span>Launch Explorer</span> <ArrowRight size={14} />
              </a>
            </div>

            {/* Card 2: Field Evidence */}
            <div className="feature-card green-accent">
              <div className="feature-icon-wrapper">
                <Camera size={24} />
              </div>
              <h3 className="feature-title">Field Evidence</h3>
              <p className="feature-desc">
                Capture and upload geo-tagged ground photographs with GPS latitude/longitude, timestamp verification, and intervention structure categorization.
              </p>
              <a href="/auth.html" className="feature-footer-action">
                <span>View Evidence Flow</span> <ArrowRight size={14} />
              </a>
            </div>

            {/* Card 3: Satellite Analysis */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Satellite size={24} />
              </div>
              <h3 className="feature-title">Satellite Analysis</h3>
              <p className="feature-desc">
                Multi-spectral environmental indices including Normalized Difference Vegetation Index (NDVI) and Normalized Difference Water Index (NDWI) temporal trends.
              </p>
              <a href="/auth.html" className="feature-footer-action">
                <span>Explore Indices</span> <ArrowRight size={14} />
              </a>
            </div>

            {/* Card 4: Evidence Fusion */}
            <div className="feature-card green-accent">
              <div className="feature-icon-wrapper">
                <ShieldCheck size={24} />
              </div>
              <h3 className="feature-title">Evidence Fusion</h3>
              <p className="feature-desc">
                Explainable assessment matrix combining remote sensing signals, spatial GIS context, and field inspection photos to compute an objective confidence index.
              </p>
              <a href="/auth.html" className="feature-footer-action">
                <span>Assessment Matrix</span> <ArrowRight size={14} />
              </a>
            </div>

            {/* Card 5: Adaptive Survey Planner */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <ClipboardCheck size={24} />
              </div>
              <h3 className="feature-title">Adaptive Survey Planner</h3>
              <p className="feature-desc">
                Smart itinerary generator optimizing travel routes and prioritising high-uncertainty or high-evidence-gap watershed sites for physical officer inspection.
              </p>
              <a href="/auth.html" className="feature-footer-action">
                <span>Survey Scheduling</span> <ArrowRight size={14} />
              </a>
            </div>

            {/* Card 6: Reports and Dashboard */}
            <div className="feature-card green-accent">
              <div className="feature-icon-wrapper">
                <FileText size={24} />
              </div>
              <h3 className="feature-title">Reports and Dashboard</h3>
              <p className="feature-desc">
                Generate downloadable, audit-ready PDF dossiers summarizing multi-temporal changes, officer verification signatures, and baseline comparison records.
              </p>
              <a href="/auth.html" className="feature-footer-action">
                <span>Sample Reports</span> <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          5. INDIA WATERSHED MAP PREVIEW
          Features identical map visualization as map.html
          ========================================================================== */}
      <section className="map-preview-section">
        <div className="map-preview-container">
          <div className="map-preview-header-bar">
            <div className="map-preview-header-text">
              <span className="section-tag">Interactive Preview</span>
              <h3>India Watershed Geospatial Intelligence Map</h3>
              <p>
                Visualizing major river drainage lines, green macro-catchment boundaries, and active field inspection telemetry.
              </p>
            </div>

            <a href="/map.html" className="btn-open-map-page">
              <Layers size={17} />
              <span>Open India Watershed Map</span>
              <ExternalLink size={15} />
            </a>
          </div>

          {/* Identical India Watershed Map Visualization Component */}
          <IndiaWatershedMapComponent
            isStandalone={false}
            height="540px"
          />
        </div>
      </section>

      {/* ==========================================================================
          6. OFFICIAL DATA SOURCES STRIP
          ========================================================================== */}
      <section className="sources-strip-section">
        <div className="sources-container">
          <div className="sources-header">
            <h4>Official Hydrological & Satellite Data Sources</h4>
          </div>

          <div className="sources-badges-row">
            <div className="source-badge">
              <Satellite size={17} color="#0284c7" />
              <span>ISRO / NRSC Bhuvan</span>
              <span className="badge-tag">Geoportal</span>
            </div>

            <div className="source-badge">
              <Layers size={17} color="#16a34a" />
              <span>Bhuvan IWMP–SRISHTI</span>
              <span className="badge-tag">Watershed Portal</span>
            </div>

            <div className="source-badge">
              <Droplets size={17} color="#0284c7" />
              <span>National Water Data Portal</span>
              <span className="badge-tag">NWIC</span>
            </div>

            <div className="source-badge">
              <Building2 size={17} color="#16a34a" />
              <span>Government Watershed Datasets</span>
              <span className="badge-tag">DoLR</span>
            </div>
          </div>

          <p className="sources-disclaimer-note">
            “Official satellite and water-resource data are used where access is authorised. Prototype records are clearly labelled as sample data.”
          </p>
        </div>
      </section>

      {/* ==========================================================================
          6. CONTACT US SECTION
          ========================================================================== */}
      <section id="contact" className="contact-section">
        <div className="contact-container">
          <div className="section-header-centered">
            <span className="section-tag">Institutional Desk</span>
            <h2 className="section-title">Partner with us for smarter watershed monitoring</h2>
            <p style={{ color: "#475569" }}>
              Reach out to deploy Jal Setu in your department, schedule a demonstration, or integrate state geospatial layers.
            </p>
          </div>

          <div className="contact-grid">
            {/* Contact Form with Validation & Feedback */}
            <div className="contact-form-card">
              {messageSent ? (
                <div className="contact-success-toast">
                  <CheckCircle2 size={24} />
                  <div>
                    <strong>Thank you for reaching out!</strong>
                    <p style={{ fontSize: "0.85rem", margin: "2px 0 0" }}>
                      Your message has been received by the Jal Setu Project Desk. Our technical coordinator will respond within 1 business day.
                    </p>
                    <button
                      type="button"
                      onClick={() => setMessageSent(false)}
                      style={{
                        marginTop: "0.75rem",
                        padding: "0.35rem 0.75rem",
                        background: "#16a34a",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="contact-form" noValidate>
                  <div className="form-field">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      id="name"
                      type="text"
                      placeholder="e.g. Dr. Ramesh Chandra"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                    {formErrors.name && <span className="field-error">{formErrors.name}</span>}
                  </div>

                  <div className="form-field">
                    <label htmlFor="dept">Department / Organization</label>
                    <input
                      id="dept"
                      type="text"
                      placeholder="e.g. State Watershed Mission / Irrigation Dept"
                      value={contactDept}
                      onChange={(e) => setContactDept(e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="email">Official Email Address *</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="e.g. ramesh.chandra@gov.in"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                    {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                  </div>

                  <div className="form-field">
                    <label htmlFor="message">Message / Inquiry *</label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder="Describe your watershed monitoring requirement, district scope, or GIS integration query..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                    />
                    {formErrors.message && <span className="field-error">{formErrors.message}</span>}
                  </div>

                  <button type="submit" className="btn-send-message">
                    <Send size={16} />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>

            {/* Official Desk Coordinates Card */}
            <div className="contact-info-column">
              <div className="official-desk-card">
                <h3 className="desk-title">Jal Setu Project Helpdesk</h3>
                <p className="desk-desc">
                  Central coordination cell for national geospatial decision-support deployments and officer onboarding.
                </p>

                <div className="desk-coords-list">
                  <div className="coord-item">
                    <Mail size={18} />
                    <div className="coord-text">
                      <strong>Official Desk Email</strong>
                      <a href="mailto:jalsetu-desk@nic.in">jalsetu-desk@nic.in</a>
                    </div>
                  </div>

                  <div className="coord-item">
                    <Building2 size={18} />
                    <div className="coord-text">
                      <strong>Institutional Affiliation</strong>
                      <span>Department of Water Resources, River Development & Ganga Rejuvenation</span>
                    </div>
                  </div>

                  <div className="coord-item">
                    <Clock size={18} />
                    <div className="coord-text">
                      <strong>Helpdesk Hours</strong>
                      <span>Monday – Friday, 09:30 – 18:00 IST</span>
                    </div>
                  </div>

                  <div className="coord-item">
                    <Shield size={18} />
                    <div className="coord-text">
                      <strong>Security Standards</strong>
                      <span>NIC / CERT-In Aligned Government Hosting Standards</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          7. DARK NAVY FOOTER (#072544)
          ========================================================================== */}
      <footer className="jalsetu-footer">
        <div className="footer-container">
          <div className="footer-top-grid">
            {/* Col 1: Typographic Brand & Short Description */}
            <div className="footer-brand-col">
              <div className="footer-brand-title">
                Jal <span className="footer-accent">Setu</span>
              </div>
              <div className="footer-brand-subtitle">
                Watershed Intelligence Platform
              </div>
              <p className="footer-description">
                Bridging field photographs, remote sensing telemetry, and transparent evidence assessment for evidence-backed watershed governance.
              </p>
              <div className="footer-tech-tag">
                <span>GIS · Remote Sensing · Field Evidence</span>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <h4 className="footer-col-title">Navigation</h4>
              <ul className="footer-nav-list">
                <li><a href="#about">About Platform</a></li>
                <li><a href="/map.html">India Watershed Map</a></li>
                <li><a href="#features">Core Features</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>

            {/* Col 3: Portal Access */}
            <div>
              <h4 className="footer-col-title">Officer Portal</h4>
              <ul className="footer-nav-list">
                <li><a href="/auth.html#login">Officer Login</a></li>
                <li><a href="/auth.html#signup">Sign Up / Register</a></li>
                <li><a href="/portal.html">Live Decision Workspace</a></li>
                <li><a href="https://bhuvan-app1.nrsc.gov.in/bhuvan2d/bhuvan/bhuvan2d.php" target="_blank" rel="noreferrer">ISRO Bhuvan 2D</a></li>
              </ul>
            </div>

            {/* Col 4: Legal & Standards */}
            <div>
              <h4 className="footer-col-title">Protocols</h4>
              <ul className="footer-nav-list">
                <li><a href="#about">Evidence Fusion Rules</a></li>
                <li><a href="#about">Adaptive Survey Planning</a></li>
                <li><a href="#about">Data Provenance</a></li>
                <li><a href="mailto:jalsetu-desk@nic.in">Technical Support</a></li>
              </ul>
            </div>
          </div>

          {/* Mandatory Disclaimer Box */}
          <div className="footer-mandatory-disclaimer">
            <div className="footer-disclaimer-card">
              <strong>Mandatory Institutional Notice:</strong> “Illustrative Prototype — Satellite observations support monitoring and do not independently prove causation. Official satellite and water-resource data are used where access is authorised. Final verification requires field photographs and officer review.”
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom-bar">
            <span>&copy; {new Date().getFullYear()} Jal Setu Project · National Geospatial Watershed Intelligence</span>
            <span>Technology: GIS · Remote Sensing · Field Evidence · WebGIS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
