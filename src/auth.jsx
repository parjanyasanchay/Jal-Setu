import React from "react";
import { createRoot } from "react-dom/client";
import AuthApp from "./AuthApp";
import "./home.css";

createRoot(document.getElementById("auth-root")).render(<AuthApp />);
