import { useState } from "react";
import {
  Droplets,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  KeyRound,
  RefreshCw,
  Building2,
  BadgeCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { loginUser, registerUser, setStoredSession } from "./api";

export default function AuthPage({ onLogin, signOutNotice }) {
  const { t } = useTranslation(["common", "nav"]);
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(signOutNotice || "");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRole, setRegRole] = useState("Project Officer");
  const [regDepartment, setRegDepartment] = useState(
    "Department of Water Resources & Watershed Development"
  );
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  function handleDemoFill() {
    setError("");
    setNotice(t("nav:auth.demoNotice", "Demo Officer credentials loaded. Click 'Sign In' to enter."));
    setLoginEmail("officer@jalsetu.gov.in");
    setLoginPassword("JalSetu@2026");
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!loginEmail.trim() || !loginPassword) {
      setError(t("nav:auth.errMissingCredentials", "Please enter both email and password."));
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(loginEmail.trim(), loginPassword);
      if (response && response.user) {
        if (rememberMe) {
          setStoredSession(response.user, response.token);
        }
        onLogin(response.user, response.token);
      } else {
        throw new Error(t("nav:auth.errInvalidResponse", "Invalid response received from authentication server."));
      }
    } catch (err) {
      // Check if it's a network error (e.g. backend server not reachable)
      const msg = err.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setError(
          t("nav:auth.errServerUnreachable", "Unable to connect to the backend server (http://127.0.0.1:8000). You can use 'Continue in Demo Mode' below to proceed.")
        );
      } else {
        setError(msg || t("nav:auth.errAuthFailed", "Authentication failed. Please verify your credentials."));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!regFullName.trim()) {
      setError(t("nav:auth.errNameRequired", "Please enter your full name."));
      return;
    }
    if (!regEmail.trim() || !regEmail.includes("@")) {
      setError(t("nav:auth.errEmailRequired", "Please enter a valid official email address."));
      return;
    }
    if (regPassword.length < 6) {
      setError(t("nav:auth.errPassShort", "Password must be at least 6 characters long."));
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError(t("nav:auth.errPassMismatch", "Passwords do not match. Please verify."));
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        department: regDepartment,
      });

      if (response && response.user) {
        setStoredSession(response.user, response.token);
        onLogin(response.user, response.token);
      } else {
        throw new Error(t("nav:auth.errRegFailed", "Registration failed. Please try again."));
      }
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setError(
          t("nav:auth.errServerUnreachable", "Backend server not reachable. Check if FastAPI is running on port 8000.")
        );
      } else {
        setError(msg || t("nav:auth.errRegExists", "Registration failed. An account with this email may already exist."));
      }
    } finally {
      setLoading(false);
    }
  }

  function handleDemoBypass() {
    const fallbackUser = {
      id: "DEMO-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      fullName: loginEmail.includes("officer") ? "Pari Jadhav" : "Demo Project Officer",
      email: loginEmail || "officer@jalsetu.gov.in",
      role: "Project Officer",
      department: "Department of Water Resources & Watershed Development",
      initials: "PJ",
    };
    setStoredSession(fallbackUser, "token-demo-session");
    onLogin(fallbackUser, "token-demo-session");
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-mesh-bg" />

      <div className="auth-container">
        {/* Portal Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <div className="auth-logo-icon">
              <Droplets size={28} />
            </div>
            <div className="auth-logo-text">
              <div className="auth-brand-name">
                <strong>Jal</strong>
                <span>SETU</span>
              </div>
              <small>{t("common:appTagline", "Watershed Decision Support System")}</small>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.825rem",
                fontWeight: 600,
                color: "#0284c7",
                textDecoration: "none",
                padding: "0.35rem 0.65rem",
                borderRadius: "4px",
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
              }}
            >
              ← Homepage
            </a>
            <div className="auth-gov-tag">
              <span className="gov-emblem-dot" />
              <span>{t("common:govTag", "Watershed Surveillance & Verification Directorate")}</span>
            </div>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Notices and Alerts */}
        {notice && (
          <div className="auth-banner auth-banner-success">
            <CheckCircle2 size={18} />
            <span>{notice}</span>
          </div>
        )}

        {error && (
          <div className="auth-banner auth-banner-error">
            <AlertCircle size={18} />
            <div>
              <span>{error}</span>
              {error.includes("Unable to connect") && (
                <button
                  type="button"
                  className="auth-inline-btn"
                  onClick={handleDemoBypass}
                >
                  {t("common:actions.demoMode", "Continue in Demo Mode")} →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Authentication Card */}
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${tab === "login" ? "active" : ""}`}
              onClick={() => {
                setTab("login");
                setError("");
              }}
            >
              {t("common:actions.signIn", "Sign In")}
            </button>
            <button
              type="button"
              className={`auth-tab ${tab === "register" ? "active" : ""}`}
              onClick={() => {
                setTab("register");
                setError("");
              }}
            >
              {t("common:actions.signUp", "Create Account")}
            </button>
          </div>

          {tab === "login" ? (
            /* ================= SIGN IN FORM ================= */
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="auth-form-intro">
                <h2>{t("nav:auth.welcomeBack", "Welcome Back")}</h2>
                <p>{t("nav:auth.welcomeSubtitle", "Sign in with your official credentials to access the watershed monitoring console.")}</p>
              </div>

              {/* Quick Demo Pill */}
              <button
                type="button"
                className="auth-demo-pill"
                onClick={handleDemoFill}
                title={t("nav:auth.demoCredentials", "Click to automatically fill verified demo officer credentials")}
              >
                <div className="demo-pill-icon">
                  <KeyRound size={15} />
                </div>
                <div className="demo-pill-content">
                  <strong>{t("nav:auth.demoButton", "Autofill Demo Credentials")}</strong>
                  <span>officer@jalsetu.gov.in</span>
                </div>
                <Sparkles size={16} className="demo-sparkle" />
              </button>

              <div className="auth-field">
                <label htmlFor="login-email">{t("nav:auth.emailLabel", "Official Email Address")}</label>
                <div className="auth-input-wrap">
                  <Mail size={17} className="field-icon" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="name@jalsetu.gov.in"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field">
                <div className="field-label-row">
                  <label htmlFor="login-password">{t("nav:auth.passwordLabel", "Password")}</label>
                </div>
                <div className="auth-input-wrap">
                  <Lock size={17} className="field-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="auth-options">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>{t("nav:auth.rememberMe", "Remember this workstation session")}</span>
                </label>
                <span className="secure-badge">
                  <ShieldCheck size={14} /> 256-Bit SSL
                </span>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw size={17} className="spinner" />
                    <span>{t("common:actions.loading", "Loading...")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("nav:auth.signInButton", "Sign In to Console")}</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ================= REGISTER FORM ================= */
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="auth-form-intro">
                <h2>{t("nav:auth.createAccount", "Create Officer Account")}</h2>
                <p>{t("nav:auth.createSubtitle", "Register with your government credentials to access spatial decision support.")}</p>
              </div>

              <div className="auth-field">
                <label htmlFor="reg-name">{t("nav:auth.fullNameLabel", "Full Name")}</label>
                <div className="auth-input-wrap">
                  <User size={17} className="field-icon" />
                  <input
                    id="reg-name"
                    type="text"
                    placeholder={t("nav:auth.fullNamePlaceholder", "Enter your full name")}
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="reg-email">{t("nav:auth.emailLabel", "Official Email Address")}</label>
                <div className="auth-input-wrap">
                  <Mail size={17} className="field-icon" />
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="officer@department.gov.in"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-form-row">
                <div className="auth-field">
                  <label htmlFor="reg-role">{t("nav:auth.roleLabel", "Official Role / Designation")}</label>
                  <div className="auth-input-wrap">
                    <BadgeCheck size={17} className="field-icon" />
                    <select
                      id="reg-role"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                    >
                      <option value="Project Officer">Project Officer</option>
                      <option value="Field Verifier">Field Verifier / Inspector</option>
                      <option value="GIS Analyst">GIS & Satellite Analyst</option>
                      <option value="District Watershed Officer">District Watershed Officer</option>
                      <option value="State Director">State Director</option>
                    </select>
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-dept">{t("nav:auth.departmentLabel", "Department / Ministry")}</label>
                  <div className="auth-input-wrap">
                    <Building2 size={17} className="field-icon" />
                    <input
                      id="reg-dept"
                      type="text"
                      placeholder="Department of Water Resources"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="auth-form-row">
                <div className="auth-field">
                  <label htmlFor="reg-pass">{t("nav:auth.passwordLabel", "Password")}</label>
                  <div className="auth-input-wrap">
                    <Lock size={17} className="field-icon" />
                    <input
                      id="reg-pass"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 chars"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-pass-confirm">{t("nav:auth.confirmPasswordLabel", "Confirm Password")}</label>
                  <div className="auth-input-wrap">
                    <Lock size={17} className="field-icon" />
                    <input
                      id="reg-pass-confirm"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw size={17} className="spinner" />
                    <span>{t("common:actions.loading", "Loading...")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("nav:auth.registerButton", "Register & Enter Console")}</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Prototype Bypass */}
          <div className="auth-footer-bypass">
            <span>Reviewing in offline/testing mode?</span>
            <button
              type="button"
              className="bypass-link-btn"
              onClick={handleDemoBypass}
            >
              {t("common:actions.demoMode", "Continue in Demo Mode")}
            </button>
          </div>
        </div>

        {/* Security & Compliance Footer */}
        <div className="auth-compliance-footer">
          <div className="compliance-item">
            <ShieldCheck size={14} />
            <span>Govt. of India • Ministry of Jal Shakti Standards</span>
          </div>
          <div className="compliance-separator">•</div>
          <div className="compliance-item">
            <span>ISRO NRSC Bhuvan Geospatial Framework</span>
          </div>
          <div className="compliance-separator">•</div>
          <div className="compliance-item">
            <span>Authorized Personnel Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}

