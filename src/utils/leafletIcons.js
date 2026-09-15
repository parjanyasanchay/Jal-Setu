import L from "leaflet";

// Ensure Leaflet default images can fall back to bundled / public assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
});

/**
 * Creates a high-visibility SVG pin marker for Leaflet maps.
 * Uses inline SVG, requiring ZERO network calls or external image files.
 * The bottom tip of the pin anchors exactly to [lat, lng].
 */
export function createWatershedPin({ priority = "MEDIUM", status = "Active", size = 32 } = {}) {
  let bgColor = "#0284c7"; // Primary Blue

  const upperStatus = String(status || "").toUpperCase();
  const upperPriority = String(priority || "").toUpperCase();

  if (upperStatus === "VERIFIED" || upperStatus === "ACTIVE") {
    bgColor = "#16a34a"; // Vibrant Green
  } else if (upperStatus === "ACTION NEEDED" || upperStatus === "HIGH PRIORITY") {
    bgColor = "#dc2626"; // Vibrant Red
  } else if (upperPriority === "HIGH") {
    bgColor = "#ea580c"; // Warm Orange
  } else if (upperPriority === "MEDIUM") {
    bgColor = "#0284c7"; // Blue
  } else {
    bgColor = "#0d9488"; // Teal
  }

  const width = size;
  const height = Math.round(size * 1.3);
  const tipX = width / 2;
  const tipY = height;

  const html = `
    <div class="watershed-pin-container" style="
      width: ${width}px;
      height: ${height}px;
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.38));
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    ">
      <svg width="${width}" height="${height}" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
        <!-- Pin Body -->
        <path d="M14 0C6.268 0 0 6.268 0 14c0 10.8 14 22 14 22s14-11.2 14-22c0-7.732-6.268-14-14-14z" fill="${bgColor}" />
        <!-- Crisp Border -->
        <path d="M14 1C6.82 1 1 6.82 1 14c0 9.6 12.1 20.3 13 21.15.9-.85 13-11.55 13-21.15 0-7.18-5.82-13-13-13z" stroke="#ffffff" stroke-width="1.8" />
        <!-- Inner Core Highlight -->
        <circle cx="14" cy="14" r="5" fill="#ffffff" />
        <circle cx="14" cy="14" r="2.8" fill="${bgColor}" />
        <!-- Pulse Beacon Dot -->
        <circle cx="14" cy="14" r="8.5" stroke="#ffffff" stroke-width="1" opacity="0.45" />
      </svg>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: "custom-watershed-pin",
    iconSize: [width, height],
    iconAnchor: [tipX, tipY],
    popupAnchor: [0, -tipY],
  });
}

export default createWatershedPin;
