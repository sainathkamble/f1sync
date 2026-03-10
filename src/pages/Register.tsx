import '../index.css';
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export const Register = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const { setUser } = useUser(); 

  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };// add this hook

const handleRegister = async () => {
  // ... existing validation ...
  setLoading(true);
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...form, avatar: preview }),
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
      setError(data.message || "Registration failed");
    }
  } catch {
    setError("Network error, please try again");
  } finally {
    setLoading(false);
  }
};

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
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" style={{ filter: "grayscale(100%)", zIndex: 0 }}>
        <source src="https://res.cloudinary.com/dwrydexn6/video/upload/v1773134562/f1-compressed_b3synn.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.78)", zIndex: 1 }} />
      <div className="absolute inset-0 overflow-y-auto flex items-center justify-center px-4 py-8" style={{ zIndex: 2 }}>
        <div className="w-full max-w-md rounded-2xl my-auto mx-4"
          style={{ background: "rgba(15,15,15,0.75)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "1rem 1.5rem" }}
        >
          <div className="flex flex-col items-center text-center mb-7">
            <img src="/F1-logo.png" alt="F1" className="h-10 mb-4" />
            <h1 className="text-3xl font-black tracking-wide text-white">Join the Race</h1>
            <p className="text-sm" style={{ color: "#9ca3af", marginTop: "6px", marginBottom: "6px" }}>
              Create your account to access exclusive F1 content
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm text-center"
              style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.4)", color: "#fca5a5" }}
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium flex items-center gap-1" style={{ color: "#d1d5db" }}>
                Email Address <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input type="email" placeholder="Enter your email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#dc2626"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.18)"}
              />
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium flex items-center gap-1" style={{ color: "#d1d5db" }}>
                Username <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input type="text" placeholder="Choose a username" value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })} style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#dc2626"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.18)"}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium flex items-center gap-1" style={{ color: "#d1d5db" }}>
                Password <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ ...inputStyle, paddingRight: "2.75rem" }}
                  onFocus={e => e.target.style.borderColor = "#dc2626"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.18)"}
                  onKeyDown={e => e.key === "Enter" && handleRegister()}
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

            {/* Profile Picture */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium flex items-center gap-1" style={{ color: "#d1d5db" }}>
                Profile Picture <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className="w-full rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all"
                style={{ border: `2px dashed ${dragging ? "#dc2626" : "rgba(255,255,255,0.2)"}`, background: dragging ? "rgba(220,38,38,0.08)" : "rgba(255,255,255,0.03)", minHeight: "100px" }}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="w-20 h-20 rounded-full object-cover" style={{ border: "2px solid #dc2626" }} />
                ) : (
                  <>
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="#6b7280" strokeWidth="1.5" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
                    </svg>
                    <p className="text-sm text-center" style={{ color: "#9ca3af" }}>
                      <span style={{ color: "#dc2626", fontWeight: 600 }}>Upload a file</span> or drag and drop
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#6b7280" }}>PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full rounded-lg font-bold text-white text-base flex items-center justify-center gap-2 mt-1"
              style={{ background: loading ? "#9b1c1c" : "#dc2626", border: "none", padding: "0.85rem", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: loading ? 0.8 : 1 }}
              onMouseOver={e => { if (!loading) { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.transform = "scale(1.02)"; } }}
              onMouseOut={e => { e.currentTarget.style.background = loading ? "#9b1c1c" : "#dc2626"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>}
            </button>

            <p className="text-center text-sm" style={{ color: "#9ca3af" }}>
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} className="font-semibold cursor-pointer"
                style={{ color: "#dc2626" }}
                onMouseOver={e => e.currentTarget.style.color = "#ef4444"}
                onMouseOut={e => e.currentTarget.style.color = "#dc2626"}
              >
                Sign in
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};