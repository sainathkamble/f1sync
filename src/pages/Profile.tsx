import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { EditProfileModal } from "../components/EditProfileModal";
import { useUser } from "../context/UserContext";

export const Profile = () => {
  const navigate = useNavigate();
  const { user, clearUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!user) navigate("/");
    else setLoading(false);
  }, [user]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch { /* silently fail */ }
    finally {
      clearUser();
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ background: "rgba(10,10,10,1)" }}>
      <Navbar />

      {loading ? (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
            <p className="text-gray-400 text-sm tracking-widest uppercase">Loading</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: "rgba(18,18,18,0.95)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Banner */}
            <div className="h-24 w-full" style={{ background: "linear-gradient(135deg, #7f1d1d, #dc2626)" }} />

            <div className="flex flex-col items-center px-8 pb-8" style={{ marginTop: "-3rem" }}>
              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-full overflow-hidden border-4 border-red-600 mb-4 shrink-0"
                style={{ background: "rgba(220,38,38,0.2)" }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg width="36" height="36" fill="none" stroke="#dc2626" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
              </div>

              <h2 className="text-xl font-black tracking-wide text-white mb-1">@{user?.username}</h2>

              <div className="w-full h-px my-5" style={{ background: "rgba(255,255,255,0.08)" }} />

              {/* Info rows */}
              <div className="w-full flex flex-col gap-4 mb-8">
                {[
                  {
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
                    label: "Email", value: user?.email,
                  },
                  {
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
                    label: "Username", value: user?.username,
                  },
                  {
                    icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></>,
                    label: "Password", value: "••••••••••••",
                  },
                ].map(row => (
                  <div
                    key={row.label}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                      {row.icon}
                    </svg>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-gray-500 uppercase tracking-widest">{row.label}</span>
                      <span className="text-sm text-gray-200 truncate">{row.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={() => setEditOpen(true)}
                  className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.4)", color: "#fca5a5" }}
                  onMouseOver={e => { e.currentTarget.style.background = "rgba(220,38,38,0.25)"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "rgba(220,38,38,0.15)"; }}
                >
                  Edit Profile
                </button>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all hover:scale-[1.02]"
                  style={{
                    background: loggingOut ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: loggingOut ? "#6b7280" : "#d1d5db",
                    cursor: loggingOut ? "not-allowed" : "pointer",
                  }}
                  onMouseOver={e => { if (!loggingOut) e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                  onMouseOut={e => { e.currentTarget.style.background = loggingOut ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)"; }}
                >
                  {loggingOut ? "Logging out..." : "Log Out"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}
    </div>
  );
};