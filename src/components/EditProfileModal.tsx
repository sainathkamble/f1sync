import { useState, useRef } from "react";
import { useUser } from "../context/UserContext";

interface Props {
  onClose: () => void;
}

export const EditProfileModal = ({ onClose }: Props) => {
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
      if (form.newPassword !== form.confirmPassword) { setError("Passwords do not match"); return; }
      if (!form.currentPassword) { setError("Enter current password to change it"); return; }
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
        setSuccess("Profile updated!");
        setTimeout(() => onClose(), 1000);
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
    padding: "0.72rem 1rem",
    color: "white",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s",
  };

  const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.189-3.564M6.53 6.53A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.31 5.23M3 3l18 18" />
    </svg>
  );

  const PwField = ({
    label, value, show, onToggle, onChange, placeholder,
  }: {
    label: string; value: string; show: boolean;
    onToggle: () => void; onChange: (v: string) => void; placeholder: string;
  }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: "#9ca3af" }}>{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ ...inputBase, paddingRight: "2.75rem" }}
          onFocus={e => e.target.style.borderColor = "#dc2626"}
          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
        />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}
          onMouseOver={e => e.currentTarget.style.color = "white"}
          onMouseOut={e => e.currentTarget.style.color = "#6b7280"}
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ background: "rgba(13,13,13,0.99)", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1.5 w-full" style={{ background: "#dc2626" }} />

        <div className="p-6 flex flex-col gap-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">Edit Profile</h2>
              <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>Update your account details</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer group"
              style={{ border: "3px solid #dc2626" }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => {
                e.preventDefault(); setDragging(false);
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
            >
              {preview ? (
                <img src={preview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(220,38,38,0.15)" }}>
                  <svg width="28" height="28" fill="none" stroke="#dc2626" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs" style={{ color: "#4b5563" }}>Click or drag to change photo</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            />
          </div>

          {/* Divider */}
          <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

          {/* Account info */}
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest" style={{ color: "#6b7280" }}>Account Info</p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#9ca3af" }}>Username</label>
              <input type="text" value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                style={inputBase}
                onFocus={e => e.target.style.borderColor = "#dc2626"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#9ca3af" }}>Email Address</label>
              <input type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={inputBase}
                onFocus={e => e.target.style.borderColor = "#dc2626"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

          {/* Password */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest" style={{ color: "#6b7280" }}>Change Password</p>
              <p className="text-xs mt-0.5" style={{ color: "#4b5563" }}>Leave blank to keep current password</p>
            </div>

            <PwField
              label="Current Password" placeholder="Enter current password"
              value={form.currentPassword} show={showCurrentPw}
              onToggle={() => setShowCurrentPw(!showCurrentPw)}
              onChange={v => setForm({ ...form, currentPassword: v })}
            />
            <PwField
              label="New Password" placeholder="Enter new password"
              value={form.newPassword} show={showNewPw}
              onToggle={() => setShowNewPw(!showNewPw)}
              onChange={v => setForm({ ...form, newPassword: v })}
            />
            <PwField
              label="Confirm New Password" placeholder="Confirm new password"
              value={form.confirmPassword} show={showConfirmPw}
              onToggle={() => setShowConfirmPw(!showConfirmPw)}
              onChange={v => setForm({ ...form, confirmPassword: v })}
            />
          </div>

          {/* Error / Success */}
          {error && (
            <div className="px-4 py-2.5 rounded-xl text-sm text-center"
              style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5" }}
            >
              {error}
            </div>
          )}
          {success && (
            <div className="px-4 py-2.5 rounded-xl text-sm text-center"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac" }}
            >
              {success}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.01]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.01]"
              style={{
                background: loading ? "#9b1c1c" : "#dc2626",
                border: "none", color: "white",
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
  );
};