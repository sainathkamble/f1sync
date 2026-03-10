import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Typewriter from "typewriter-effect";
import { useUser } from "../context/UserContext";

export const LandingPage = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const { setUser } = useUser(); 

  // Session check — redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/auth/session`, {
          method: "GET",
          credentials: "include",
        });
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
        }
      } catch {
        // network error — stay on landing
      }
    };
    checkSession();
  }, []);

  // Audio
  useEffect(() => {
    if (sessionStorage.getItem("enginePlayed")) return;

    const audio = new Audio("/engine.mp3");
    audio.volume = 0.15;
    audio.loop = false;
    audioRef.current = audio;
    audio.load();

    const unlock = () => {
      if (sessionStorage.getItem("enginePlayed")) return;
      sessionStorage.setItem("enginePlayed", "true");
      audio.play().catch(() => {});
    };

    document.addEventListener("mousemove", unlock, { once: true });
    document.addEventListener("click", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });
    document.addEventListener("touchstart", unlock, { once: true });

    return () => {
      document.removeEventListener("mousemove", unlock);
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("touchstart", unlock);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100dvh", overflow: "hidden", color: "white" }}>
      <video autoPlay muted loop playsInline style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(90%)", zIndex: 0 }}>
        <source src="https://res.cloudinary.com/dwrydexn6/video/upload/v1773134562/f1-compressed_b3synn.mp4" type="video/mp4" />
      </video>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.70)", zIndex: 1 }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 1.5rem" }}>
        <p style={{ fontSize: "clamp(0.85rem, 1.5vw, 1rem)", letterSpacing: "0.35em", textTransform: "uppercase", color: "#9ca3af", marginBottom: "0.4rem", fontWeight: 500 }}>
          Welcome to
        </p>
        <h1 style={{ fontSize: "clamp(4rem, 10vw, 7rem)", fontWeight: 900, letterSpacing: "0.2em", marginBottom: "1.5rem", lineHeight: 1 }}>
          F1 SYNC
        </h1>
        <div style={{ maxWidth: "700px", fontSize: "clamp(1.3rem, 2.5vw, 1.75rem)", color: "#e5e7eb", marginBottom: "2rem", minHeight: "4rem", fontWeight: 400, lineHeight: 1.5 }}>
          <Typewriter
            options={{
              strings: ["The ultimate platform for Formula 1 fans.", "Watch races, track live driver standings and telemetry.", "Built for true F1 nerds."],
              autoStart: true, loop: true, delay: 40,
            }}
          />
        </div>
        <button
          style={{ padding: "1rem 3.5rem", background: "#dc2626", border: "none", borderRadius: "0.5rem", color: "white", fontWeight: 700, fontSize: "1.1rem", cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.05em", marginBottom: "1rem" }}
          onMouseOver={e => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.transform = "scale(1.04)"; }}
          onMouseOut={e => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.transform = "scale(1)"; }}
          onClick={() => navigate("/register")}
        >
          Register
        </button>
        <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.6rem" }}>Already have an account?</p>
        <button
          style={{ padding: "0.5rem 1.75rem", background: "transparent", border: "1.5px solid rgba(255,255,255,0.5)", borderRadius: "0.4rem", color: "#d1d5db", fontWeight: 500, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "black"; }}
          onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d1d5db"; }}
          onClick={() => navigate("/login")}
        >
          Log In
        </button>
      </div>
    </div>
  );
};