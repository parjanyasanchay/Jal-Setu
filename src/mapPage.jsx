import React from "react";
import { createRoot } from "react-dom/client";
import MapPageApp from "./MapPageApp";
import "./home.css";

createRoot(document.getElementById("map-root")).render(<MapPageApp />);
