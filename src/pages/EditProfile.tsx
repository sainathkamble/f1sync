import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useUser } from "../context/UserContext";

export const EditProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    username: user?.username ?? "",
    email: user?.email ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preview, setPreview] = useState<string | null>(user?.avatar ?? null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      setPreview(e.target?.result as string);
      setAvatarChanged(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!form.username.trim()) { setError("Username cannot be empty"); return; }
    if (!form.email.trim()) { setError("Email cannot be empty"); return; }

    if (form.newPassword) {
      if (form.newPassword.length < 6) { setError("New password must be at least 6 characters"); return; }
      if (form.newPassword !== form.confirmPassword) { setError("New passwords do not match"); return; }
      if (!form.currentPassword) { setError("Enter your current password to change it"); return; }
    }

    const body: Record<string, string> = {
      username: form.username,
      email: form.email,
    };

    if (avatarChanged && preview) body.avatar = preview;
    if (form.newPassword) {
      body.currentPassword = form.currentPassword;
      body.newPassword = form.newPassword;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/auth/profile/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setSuccess("Profile updated successfully!");
        setForm(f => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
        setTimeout(() => navigate("/profile"), 1200);
      } else {
        setError(data.message || "Update failed");
      }
    } catch {
      setError("Network error, please try again");
    } finally {
      setLoading(false);
    }
  };

  const inputBase = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "0.6rem",
    padding: "0.75rem 1rem",
    color: "white",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s",
  };

  const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.189-3.564M6.53 6.53A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.31 5.23M3 3l18 18" />
    </svg>
  );

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ background: "#0a0a0a" }}>
      <Navbar />

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate("/profile")}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-black text-white">Edit Profile</h1>
              <p className="text-xs text-gray-500 mt-0.5">Update your account details</p>
            </div>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(18,18,18,0.95)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="h-1 w-full" style={{ background: "#dc2626" }} />

            <div className="p-6 flex flex-col gap-6">

              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
                  style={{ border: "3px solid #dc2626" }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                >
                  {preview ? (
                    <img src={preview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(220,38,38,0.15)" }}>
                      <svg width="32" height="32" fill="none" stroke="#dc2626" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                  >
                    <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Click or drag to change photo</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                />
              </div>

              {/* Divider */}
              <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

              {/* Section — Account */}
              <div>
                <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#6b7280" }}>Account Info</p>
                <div className="flex flex-col gap-4">

                  {/* Username */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium" style={{ color: "#d1d5db" }}>Username</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      style={inputBase}
                      onFocus={e => e.target.style.borderColor = "#dc2626"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium" style={{ color: "#d1d5db" }}>Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      style={inputBase}
                      onFocus={e => e.target.style.borderColor = "#dc2626"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

              {/* Section — Password */}
              <div>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#6b7280" }}>Change Password</p>
                <p className="text-xs mb-4" style={{ color: "#4b5563" }}>Leave blank to keep your current password</p>
                <div className="flex flex-col gap-4">

                  {/* Current password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium" style={{ color: "#d1d5db" }}>Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        placeholder="Enter current password"
                        value={form.currentPassword}
                        onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                        style={{ ...inputBase, paddingRight: "2.75rem" }}
                        onFocus={e => e.target.style.borderColor = "#dc2626"}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                      />
                      <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}
                        onMouseOver={e => e.currentTarget.style.color = "white"}
                        onMouseOut={e => e.currentTarget.style.color = "#6b7280"}
                      >
                        <EyeIcon open={showCurrentPw} />
                      </button>
                    </div>
                  </div>

                  {/* New password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium" style={{ color: "#d1d5db" }}>New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPw ? "text" : "password"}
                        placeholder="Enter new password"
                        value={form.newPassword}
                        onChange={e => setForm({ ...form, newPassword: e.target.value })}
                        style={{ ...inputBase, paddingRight: "2.75rem" }}
                        onFocus={e => e.target.style.borderColor = "#dc2626"}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                      />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}
                        onMouseOver={e => e.currentTarget.style.color = "white"}
                        onMouseOut={e => e.currentTarget.style.color = "#6b7280"}
                      >
                        <EyeIcon open={showNewPw} />
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium" style={{ color: "#d1d5db" }}>Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={form.confirmPassword}
                        onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                        style={{ ...inputBase, paddingRight: "2.75rem" }}
                        onFocus={e => e.target.style.borderColor = "#dc2626"}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                      />
                      <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}
                        onMouseOver={e => e.currentTarget.style.color = "white"}
                        onMouseOut={e => e.currentTarget.style.color = "#6b7280"}
                      >
                        <EyeIcon open={showConfirmPw} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Error / Success */}
              {error && (
                <div className="px-4 py-3 rounded-xl text-sm text-center"
                  style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5" }}
                >
                  {error}
                </div>
              )}
              {success && (
                <div className="px-4 py-3 rounded-xl text-sm text-center"
                  style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac" }}
                >
                  {success}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/profile")}
                  className="flex-1 py-3 rounded-xl text-sm font-bold tracking-wide transition-all hover:scale-[1.01]"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl text-sm font-bold tracking-wide transition-all hover:scale-[1.01]"
                  style={{
                    background: loading ? "#9b1c1c" : "#dc2626",
                    border: "none",
                    color: "white",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.8 : 1,
                  }}
                  onMouseOver={e => { if (!loading) e.currentTarget.style.background = "#ef4444"; }}
                  onMouseOut={e => { e.currentTarget.style.background = loading ? "#9b1c1c" : "#dc2626"; }}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};