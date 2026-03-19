import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { label: "Home", path: "/home" },
    { label: "Watch Live", path: "/stream" },
    { label: "Schedule", path: "/schedule" },
    { label: "Drivers", path: "/drivers" },
    { label: "Constructors", path: "/constructors" },
    { label: "Championship", path: "/championship" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close drawer on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-10 border-b border-white/10"
        style={{
          background: "rgba(10,10,10,0.90)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          padding: "0 2.5rem",
        }}
      >
        {/* Mobile/Tablet: Hamburger on the LEFT */}
        <button
          className="lg:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 cursor-pointer bg-transparent border-none shrink-0 z-50"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span
            className="block h-px bg-white transition-all duration-300 origin-center"
            style={{
              width: "22px",
              transform: menuOpen ? "translateY(5px) rotate(45deg)" : "none",
            }}
          />
          <span
            className="block h-px bg-white transition-all duration-300"
            style={{
              width: "22px",
              opacity: menuOpen ? 0 : 1,
              transform: menuOpen ? "scaleX(0)" : "none",
            }}
          />
          <span
            className="block h-px bg-white transition-all duration-300 origin-center"
            style={{
              width: "22px",
              transform: menuOpen ? "translateY(-5px) rotate(-45deg)" : "none",
            }}
          />
        </button>

        {/* Logo — centered on mobile, left on desktop */}
        <div
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 cursor-pointer shrink-0 lg:mr-0 absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
        >
          <img src="/F1-logo.png" alt="F1" className="h-6" />
          <span className="text-white font-extrabold text-xs tracking-widest uppercase">SYNC</span>
        </div>

        {/* Desktop — Links + Avatar */}
        <div className="hidden lg:flex items-center gap-8 ml-auto">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`relative text-xs font-semibold tracking-widest uppercase cursor-pointer bg-transparent border-none transition-all duration-200 pb-0.5 group
                  ${isActive(link.path) ? "text-white" : "text-gray-400 hover:text-white"}`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 h-px bg-red-600 transition-all duration-300 ${
                    isActive(link.path) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Avatar */}
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

        {/* Mobile/Tablet: Avatar on the RIGHT */}
        <div
          onClick={() => navigate("/profile")}
          className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shrink-0 border-2 border-red-600 hover:border-red-400 transition-all duration-200 overflow-hidden"
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
      </nav>

      {/* Mobile/Tablet Drawer */}
      {/* Backdrop */}
      <div
        className="lg:hidden fixed inset-0 z-40 bg-black/60 transition-opacity duration-300"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
        }}
        aria-hidden="true"
      />

      {/* Slide-in drawer */}
      <div
        ref={drawerRef}
        className="lg:hidden fixed top-0 left-0 z-40 h-full w-64 flex flex-col pt-20 pb-8 px-6 border-r border-white/10"
        style={{
          background: "rgba(10,10,10,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)",
          padding: "5rem 1.5rem 2rem",
        }}
      >
        {/* Drawer nav links */}
        <nav className="flex flex-col gap-1">
          {navLinks.map((link, i) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`relative text-left text-sm font-semibold tracking-widest uppercase px-3 py-3 rounded-md cursor-pointer bg-transparent border-none transition-all duration-200
                ${isActive(link.path)
                  ? "text-white bg-white/5"
                  : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              style={{
                transitionDelay: menuOpen ? `${i * 40}ms` : "0ms",
                transform: menuOpen ? "translateX(0)" : "translateX(-12px)",
                opacity: menuOpen ? 1 : 0,
                transition: `transform 0.3s ease ${i * 40}ms, opacity 0.3s ease ${i * 40}ms, background 0.2s, color 0.2s`,
                padding: "0.75rem 1.25rem",
              }}
            >
              {/* Active indicator */}
              {isActive(link.path) && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-red-600 rounded-full" />
              )}
              {link.label}
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div className="mt-auto pt-6 border-t border-white/10" style={{ marginTop: "auto", paddingTop: "1.5rem" }} />
          <p className="text-gray-600 text-xs tracking-widest uppercase">
            {user?.username ?? "Guest"}
          </p>
        </div>

      <div className="h-14" />
    </>
  );
};