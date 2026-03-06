import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

interface DriverStanding {
  position: number;
  points: number;
  wins: number;
  driverId: string;
  code: string;
  permanentNumber: string;
  givenName: string;
  familyName: string;
  fullName: string;
  nationality: string;
  dob: string;
  wikipediaUrl: string;
  team: string;
  teamId: string;
  teamNationality: string;
}

interface ConstructorStanding {
  position: number;
  points: number;
  wins: number;
  constructorId: string;
  name: string;
  nationality: string;
  wikipediaUrl: string;
}

interface StandingsResponse<T> {
  standings: T[];
  season: string | null;
  round: string | null;
}

type Tab = "drivers" | "constructors";

// team color map since ergast doesn't have colors
const TEAM_COLORS: Record<string, string> = {
  mclaren: "#ff8000",
  mercedes: "#00d2be",
  "red_bull": "#3b1f6e",
  ferrari: "#dc0000",
  "aston_martin": "#006f62",
  alpine: "#0090ff",
  williams: "#005aff",
  "rb": "#6692ff",
  "racing_bulls": "#6692ff",
  sauber: "#52e252",
  kick_sauber: "#52e252",
  haas: "#b6babd",
  cadillac: "#a8a9ad",
  audi: "#bb0000",
};

const getTeamColor = (teamId: string) => {
  if (!teamId) return "#dc2626";
  const key = teamId.toLowerCase().replace(/\s+/g, "_");
  return TEAM_COLORS[key] ?? "#dc2626";
};

const positionColor = (pos: number) => {
  if (pos === 1) return "#fbbf24";
  if (pos === 2) return "#9ca3af";
  if (pos === 3) return "#cd7f32";
  return "#6b7280";
};

const getAge = (dob: string) => {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
};

// ── Empty / Pre-season state ──
const PreSeasonState = ({ season, tab }: { season: string | null; tab: Tab }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4 max-w-md mx-auto text-center">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
      style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)" }}
    >
      <svg width="28" height="28" fill="none" stroke="#dc2626" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    </div>
    <h3 className="text-lg font-black text-white">Season Not Started</h3>
    <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
      {season
        ? `The ${season} ${tab === "drivers" ? "Driver" : "Constructor"} Championship standings will appear here once the season gets underway.`
        : `${tab === "drivers" ? "Driver" : "Constructor"} standings will appear here once the season gets underway.`
      }
    </p>
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mt-2"
      style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", color: "#fca5a5" }}
    >
      🏁 Lights out soon
    </div>
  </div>
);

export const Championship = () => {
  const [tab, setTab] = useState<Tab>("drivers");
  const [driverData, setDriverData] = useState<StandingsResponse<DriverStanding> | null>(null);
  const [constructorData, setConstructorData] = useState<StandingsResponse<ConstructorStanding> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const alreadyLoaded = tab === "drivers" ? driverData !== null : constructorData !== null;
    if (alreadyLoaded) return;

    const fetchStandings = async () => {
      setLoading(true);
      setError("");
      try {
        const endpoint = tab === "drivers" ? "drivers/standings" : "constructors/standings";
        const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/${endpoint}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (tab === "drivers") setDriverData(data);
        else setConstructorData(data);
      } catch {
        setError("Failed to load standings");
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [tab]);

  const currentData = tab === "drivers" ? driverData : constructorData;
  const hasStandings = (currentData?.standings?.length ?? 0) > 0;

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ background: "#0a0a0a" }}>
      <Navbar />

      <div className="flex-1 px-6 md:px-10 py-10">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Formula 1</p>
          <h1 className="text-3xl font-black tracking-wide">Championship Standings</h1>
          {hasStandings && currentData?.season && (
            <p className="text-xs mt-2" style={{ color: "#6b7280" }}>
              {currentData.season} Season
              {currentData.round ? ` · After Round ${currentData.round}` : ""}
            </p>
          )}
        </div>

        {/* Tab switcher */}
        <div
          className="inline-flex rounded-xl p-1 mb-8"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {(["drivers", "constructors"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setLoading(t === "drivers" ? driverData === null : constructorData === null); }}
              className="px-5 py-2 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 capitalize"
              style={tab === t
                ? { background: "#dc2626", color: "white" }
                : { background: "transparent", color: "#6b7280" }
              }
            >
              {t}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <p className="text-red-400 text-sm text-center py-20">{error}</p>
        )}

        {/* Pre-season / empty */}
        {!loading && !error && !hasStandings && (
          <PreSeasonState season={currentData?.season ?? null} tab={tab} />
        )}

        {/* Driver standings */}
        {!loading && !error && hasStandings && tab === "drivers" && (
          <div className="flex flex-col gap-2 max-w-3xl">
            {(driverData?.standings ?? []).map(driver => {
              const color = getTeamColor(driver.teamId);
              const isTop3 = driver.position <= 3;
              const age = getAge(driver.dob);
              return (
                <div
                  key={driver.driverId}
                  className="relative flex items-center gap-4 rounded-xl px-5 py-3 transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: isTop3 ? `${color}12` : "rgba(18,18,18,0.95)",
                    border: `1px solid ${isTop3 ? `${color}35` : "rgba(255,255,255,0.07)"}`,
                  }}
                >
                  {/* Left color bar */}
                  <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r" style={{ background: color }} />

                  {/* Position */}
                  <div className="w-7 text-center shrink-0">
                    {driver.position === 1
                      ? <span className="text-lg">👑</span>
                      : <span className="text-base font-black" style={{ color: positionColor(driver.position) }}>{driver.position}</span>
                    }
                  </div>

                  {/* Driver number */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background: `${color}20`, color, border: `1px solid ${color}35` }}
                  >
                    {driver.permanentNumber ?? "—"}
                  </div>

                  {/* Name + details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-black text-white">{driver.fullName}</p>
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{ background: `${color}22`, color, border: `1px solid ${color}40` }}
                      >
                        {driver.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-xs truncate" style={{ color: "#6b7280" }}>{driver.team}</p>
                      {driver.nationality && (
                        <p className="text-xs" style={{ color: "#4b5563" }}>· {driver.nationality}</p>
                      )}
                      {age && (
                        <p className="text-xs" style={{ color: "#4b5563" }}>· {age} yrs</p>
                      )}
                    </div>
                  </div>

                  {/* Wins + Points */}
                  <div className="text-right shrink-0">
                    <p className="text-xl font-black leading-tight" style={{ color: isTop3 ? color : "white" }}>
                      {driver.points}
                    </p>
                    <p className="text-xs" style={{ color: "#6b7280" }}>PTS</p>
                    {driver.wins > 0 && (
                      <p className="text-xs font-bold mt-0.5" style={{ color: "#fbbf24" }}>
                        🏆 {driver.wins}W
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Constructor standings */}
        {!loading && !error && hasStandings && tab === "constructors" && (
          <div className="flex flex-col gap-2 max-w-3xl">
            {(constructorData?.standings ?? []).map(team => {
              const color = getTeamColor(team.constructorId);
              const isTop3 = team.position <= 3;
              return (
                <div
                  key={team.constructorId}
                  className="relative flex items-center gap-4 rounded-xl px-5 py-3 transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: isTop3 ? `${color}12` : "rgba(18,18,18,0.95)",
                    border: `1px solid ${isTop3 ? `${color}35` : "rgba(255,255,255,0.07)"}`,
                  }}
                >
                  {/* Left color bar */}
                  <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r" style={{ background: color }} />

                  {/* Position */}
                  <div className="w-7 text-center shrink-0">
                    {team.position === 1
                      ? <span className="text-lg">👑</span>
                      : <span className="text-base font-black" style={{ color: positionColor(team.position) }}>{team.position}</span>
                    }
                  </div>

                  {/* Team initials circle */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background: `${color}25`, color, border: `2px solid ${color}50` }}
                  >
                    {team.name?.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Team name + nationality */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white truncate">{team.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                      <p className="text-xs" style={{ color: "#6b7280" }}>
                        {team.nationality ?? "Constructor"}
                      </p>
                    </div>
                  </div>

                  {/* Wins + Points */}
                  <div className="text-right shrink-0">
                    <p className="text-xl font-black leading-tight" style={{ color: isTop3 ? color : "white" }}>
                      {team.points}
                    </p>
                    <p className="text-xs" style={{ color: "#6b7280" }}>PTS</p>
                    {team.wins > 0 && (
                      <p className="text-xs font-bold mt-0.5" style={{ color: "#fbbf24" }}>
                        🏆 {team.wins}W
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
};