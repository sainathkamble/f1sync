import '../index.css';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });

  const { setUser } = useUser(); // add this hook

const handleLogin = async () => {
  setError("");
  if (!form.usernameOrEmail.trim()) { setError("Username or email is required"); return; }
  if (!form.password.trim()) { setError("Password is required"); return; }

  setLoading(true);
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      // fetch profile and store in context
      const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/v1/auth/profile`, {
        method: "GET",
        credentials: "include",
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData);
      }
      navigate("/home");
    } else {
      setError(data.message || "Login failed");
    }
  } catch {
    setError("Network error, please try again");
  } finally {
    setLoading(false);
  }
};

  const emailRegex = /^[^\s@]+@[^\s@]+\.(com|in)$/i;

const isFormValid =
  form.usernameOrEmail.trim() !== "" &&
  form.password.trim() !== "";

const looksLikeEmail = form.usernameOrEmail.includes("@");
const emailInvalid = looksLikeEmail && !emailRegex.test(form.usernameOrEmail);

  const inputStyle = {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "0.5rem",
    padding: "0.75rem 1rem",
    color: "white",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s",
  };

  const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.189-3.564M6.53 6.53A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.31 5.23M3 3l18 18" />
    </svg>
  );

  return (
    <div className="relative w-screen h-dvh overflow-hidden text-white">
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" style={{ filter: "grayscale(90%)", zIndex: 0 }}>
        <source src="https://res.cloudinary.com/dwrydexn6/video/upload/v1773134562/f1-compressed_b3synn.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.78)", zIndex: 1 }} />
      <div className="absolute inset-0 overflow-y-auto flex items-center justify-center px-4 py-8" style={{ zIndex: 2 }}>
        <div className="w-full max-w-md rounded-2xl my-auto mx-4"
          style={{ background: "rgba(15,15,15,0.75)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "1rem 1.5rem" }}
        >
          <div className="flex flex-col items-center text-center mb-8">
            <img src="/F1-logo.png" alt="F1" className="h-10 mb-4" />
            <h1 className="text-3xl font-black tracking-wide text-white">Welcome Back to the Grid</h1>
            <p className="text-sm mt-2" style={{ color: "#9ca3af", marginTop: "6px", marginBottom: "6px" }}>
              You're one click away from an adrenaline-filled joy
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm text-center"
              style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.4)", color: "#fca5a5", padding: "0.75rem", margin: "1rem 0" }}
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium flex items-center gap-1" style={{ color: "#d1d5db" }}>
                Username or Email <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input type="text" placeholder="Enter your username or email" value={form.usernameOrEmail}
                onChange={e => setForm({ ...form, usernameOrEmail: e.target.value })} style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#dc2626"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.18)"}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium flex items-center gap-1" style={{ color: "#d1d5db" }}>
                Password <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ ...inputStyle, paddingRight: "2.75rem" }}
                  onFocus={e => e.target.style.borderColor = "#dc2626"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.18)"}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                  style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  onMouseOver={e => e.currentTarget.style.color = "white"}
                  onMouseOut={e => e.currentTarget.style.color = "#9ca3af"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <div className="flex justify-end" style={{ marginTop: "-0.75rem" }}>
              <span className="text-xs cursor-pointer transition"
                style={{ color: "#dc2626" }}
                onMouseOver={e => e.currentTarget.style.color = "#ef4444"}
                onMouseOut={e => e.currentTarget.style.color = "#dc2626"}
              >
                Forgot password?
              </span>
            </div>

            {/* Validation hints */}
            {(!isFormValid || emailInvalid) && (
              <div className="flex flex-wrap gap-2" style={{ marginTop: "-0.5rem" }}>
                {!form.usernameOrEmail.trim() && (
                  <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5", padding: "0.25rem 0.5rem" }}>
                    Username or email required
                  </span>
                )}
                {emailInvalid && (
                  <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5", padding: "0.25rem 0.5rem" }}>
                    Please enter a valid email!
                  </span>
                )}
                {!form.password.trim() && (
                  <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5", padding: "0.25rem 0.5rem" }}>
                    Password required
                  </span>
                )}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !isFormValid || emailInvalid}
              className="w-full rounded-lg font-bold text-white text-base flex items-center justify-center gap-2"
              style={{
                background: loading ? "#9b1c1c" : (!isFormValid || emailInvalid) ? "#4b4b4b" : "#dc2626",
                border: "none",
                padding: "0.85rem",
                cursor: loading || !isFormValid || emailInvalid ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: loading || !isFormValid || emailInvalid ? 0.6 : 1
              }}
              onMouseOver={e => { if (!loading && isFormValid && !emailInvalid) { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.transform = "scale(1.02)"; } }}
              onMouseOut={e => { e.currentTarget.style.background = loading ? "#9b1c1c" : (!isFormValid || emailInvalid) ? "#4b4b4b" : "#dc2626"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              {loading ? "Starting Engine..." : "Let's Race"}
              {!loading && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>}
            </button>

            <p className="text-center text-sm" style={{ color: "#9ca3af" }}>
              Don't have an account?{" "}
              <span onClick={() => navigate("/register")} className="font-semibold cursor-pointer"
                style={{ color: "#dc2626" }}
                onMouseOver={e => e.currentTarget.style.color = "#ef4444"}
                onMouseOut={e => e.currentTarget.style.color = "#dc2626"}
              >
                Join the Race
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};