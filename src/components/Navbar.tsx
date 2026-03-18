import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser(); // 👈 read from context

  const navLinks = [
    { label: "Home", path: "/home" },
    { label: "Watch Live", path: "/stream" },
    { label: "Schedule", path: "/schedule" },
    { label: "Drivers", path: "/drivers" },
    { label: "Constructors", path: "/constructors" },
    { label: "Championship", path: "/championship" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-10 border-b border-white/10"
        style={{ background: "rgba(10,10,10,0.90)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", padding: "0 2.5rem" }}
      >
        {/* Left — Logo */}
        <div onClick={() => navigate("/home")} className="flex items-center gap-2 cursor-pointer shrink-0">
          <img src="/F1-logo.png" alt="F1" className="h-6" />
          <span className="text-white font-extrabold text-xs tracking-widest uppercase">SYNC</span>
        </div>

        {/* Right — Links + Avatar */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`relative text-xs font-semibold tracking-widest uppercase cursor-pointer bg-transparent border-none transition-all duration-200 pb-0.5 group
                  ${isActive(link.path) ? "text-white" : "text-gray-400 hover:text-white"}`}
              >
                {link.label}
                <span className={`absolute bottom-0 left-0 h-px bg-red-600 transition-all duration-300 ${isActive(link.path) ? "w-full" : "w-0 group-hover:w-full"}`} />
              </button>
            ))}
          </div>

          {/* Avatar — from context */}
          <div
            onClick={() => navigate("/profile")}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shrink-0 border-2 border-red-600 hover:border-red-400 hover:scale-110 transition-all duration-200 overflow-hidden"
            style={{ background: "rgba(220,38,38,0.15)" }}
            title={user?.username ?? "Profile"}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <svg width="15" height="15" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
        </div>
      </nav>
      <div className="h-14" />
    </>
  );
};