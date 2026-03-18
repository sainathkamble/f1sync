import { useState } from "react";

interface Driver {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  headshot_url: string;
  country_code: string;
}

interface DriverStats {
  championships: number;
  wins: number;
  podiums: number;
  polePositions: number;
  fastestLaps: number;
  totalPoints: number;
  totalRaces: number;
  seasons: number;
  firstSeason: string;
  latestSeason: string;
  teams: string[];
  currentStanding: {
    position: string;
    points: string;
    wins: string;
  } | null;
}

interface DriverDetails {
  driverId: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
  permanentNumber: string;
  code: string;
  url: string;
  stats: DriverStats;
}

interface Props {
  driver: Driver;
  driverIdMap: Record<string, string>; // acronym → ergast driverId
}

const StatBox = ({ label, value, color }: { label: string; value: string | number; color?: string }) => (
  <div
    className="flex flex-col items-center justify-center rounded-xl py-3 px-2"
    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
  >
    <span className="text-lg font-black" style={{ color: color ?? "white" }}>{value}</span>
    <span className="text-xs uppercase tracking-widest mt-0.5" style={{ color: "#6b7280" }}>{label}</span>
  </div>
);

export const DriverCard = ({ driver, driverIdMap }: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [details, setDetails] = useState<DriverDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const teamColor = driver.team_colour ? `#${driver.team_colour}` : "#dc2626";

  const formatDOB = (dob: string) => {
    if (!dob) return "—";
    const d = new Date(dob);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

  const getAge = (dob: string) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const handleOpen = async () => {
    setModalOpen(true);
    if (details) return; // already fetched

    const ergastId = driverIdMap[driver.name_acronym];
    if (!ergastId) {
      setDetailsError("Extended stats not available for this driver");
      return;
    }

    setLoadingDetails(true);
    setDetailsError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/driver/${ergastId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      setDetails(await res.json());
      console.log("Fetched details for", res);
    } catch {
      setDetailsError("Could not load driver details");
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <>
      {/* ── CARD ── */}
      <div
        onClick={handleOpen}
        className="rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl group"
        style={{ background: "rgba(18,18,18,0.95)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="h-1 w-full" style={{ background: teamColor }} />

        {/* Headshot */}
        <div
          className="flex items-center justify-center pt-5 pb-2 px-4 relative overflow-hidden"
          style={{ background: `linear-gradient(180deg, ${teamColor}18 0%, rgba(0,0,0,0) 100%)` }}
        >
          {driver.headshot_url ? (
            <img
              src={driver.headshot_url}
              alt={driver.full_name}
              className="h-32 object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-32 w-24 flex items-center justify-center">
              <svg width="44" height="44" fill="none" stroke="#374151" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}

          {/* Driver number watermark */}
          <span
            className="absolute bottom-1 right-3 text-5xl font-black leading-none select-none pointer-events-none"
            style={{ color: `${teamColor}50` }}
          >
            {driver.driver_number}
          </span>
        </div>

        {/* Info */}
        <div className="px-4 pb-4 pt-2" style={{ padding: "0.5rem 1rem" }}>
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{
                background: `${teamColor}22`,
                color: teamColor,
                border: `1px solid ${teamColor}44`,
                padding: "0.125rem 0.5rem",
              }}
            >
              {driver.name_acronym}
            </span>
            <span className="text-xs uppercase tracking-widest" style={{ color: "#6b7280" }}>
              {driver.country_code}
            </span>
          </div>

          <p className="text-white font-black text-sm leading-tight mt-1" style={{ marginTop: "0.25rem"}}>{driver.full_name}</p>
          <p className="text-xs mt-0.5 truncate" style={{ color: "#6b7280", margin: "0.25rem 0" }}>{driver.team_name}</p>

          {/* View details hint */}
          <div className="flex items-center justify-end mt-2 gap-1">
            <span className="text-xs" style={{ color: "#4b5563" }}>View stats</span>
            <svg width="10" height="10" fill="none" stroke="#4b5563" strokeWidth="2" viewBox="0 0 24 24"
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
          style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)" }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ background: "rgba(13,13,13,0.99)", border: `1px solid ${teamColor}50` }}
            onClick={e => e.stopPropagation()}
          >
            <div className="h-1.5 w-full" style={{ background: teamColor }} />

            {/* Modal hero */}
            <div
              className="relative flex items-end justify-between px-6 pt-4 pb-0 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${teamColor}22, rgba(0,0,0,0))`, minHeight: "140px", padding: "1rem 1.5rem 0.75rem" }}
            >
              {/* Driver info left */}
              <div className="pb-4 z-10">
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: teamColor }}>
                  #{driver.driver_number} · {driver.name_acronym}
                </p>
                <h2 className="text-2xl font-black text-white leading-tight">{driver.full_name}</h2>
                <p className="text-sm mt-0.5" style={{ color: "#9ca3af" }}>{driver.team_name}</p>
                <p className="text-xs mt-1 uppercase tracking-widest" style={{ color: "#6b7280" }}>{driver.country_code}</p>
              </div>

              {/* Headshot right */}
              {driver.headshot_url && (
                <img
                  src={driver.headshot_url}
                  alt={driver.full_name}
                  className="h-36 object-contain z-10 shrink-0"
                />
              )}

              {/* Number watermark */}
              <span
                className="absolute right-4 bottom-0 text-8xl font-black leading-none select-none pointer-events-none"
                style={{ color: `${teamColor}15` }}
              >
                {driver.driver_number}
              </span>

              {/* Close */}
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-20 transition-all hover:scale-110"
                style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 pb-6 pt-4 overflow-y-scroll" style={{ padding: "1rem 1.5rem" }}>
              {/* Loading */}
              {loadingDetails && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${teamColor} transparent transparent transparent` }} />
                </div>
              )}

              {/* Error */}
              {detailsError && !loadingDetails && (
                <p className="text-center text-sm py-6" style={{ color: "#6b7280" }}>{detailsError}</p>
              )}

              {/* Details */}
              {details && !loadingDetails && (
                <>
                  {/* Personal info */}
                  <div className="grid grid-cols-2 gap-2.5 mb-5">
                    {[
                      { label: "Nationality", value: details.nationality },
                      { label: "Date of Birth", value: formatDOB(details.dateOfBirth) },
                      { label: "Age", value: getAge(details.dateOfBirth) ? `${getAge(details.dateOfBirth)} years` : "—" },
                      { label: "Driver #", value: `#${details.permanentNumber ?? driver.driver_number}` },
                    ].map(item => (
                      <div
                        key={item.label}
                        className="rounded-xl px-3 py-2.5"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", padding: "0.5rem" }}
                      >
                        <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "#6b7280" }}>{item.label}</p>
                        <p className="text-sm font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Championship highlight */}
                  {details.stats.championships > 0 && (
                    <div
                      className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5"
                      style={{ background: `${teamColor}15`, border: `1px solid ${teamColor}35` }}
                    >
                      <span className="text-2xl">🏆</span>
                      <div>
                        <p className="text-xs uppercase tracking-widest" style={{ color: "#9ca3af" }}>World Championships</p>
                        <p className="text-2xl font-black" style={{ color: teamColor }}>{details.stats.championships}</p>
                      </div>
                    </div>
                  )}

                  {/* Career stats grid */}
                  <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#6b7280", margin: "0.25rem 0" }}>Career Stats</p>
                  <div className="grid grid-cols-3 gap-2.5 mb-5" style={{ marginBottom: "0.75rem" }}>
                    <StatBox label="Wins" value={details.stats.wins} color={teamColor} />
                    <StatBox label="Podiums" value={details.stats.podiums} />
                    <StatBox label="Poles" value={details.stats.polePositions} />
                    <StatBox label="Fastest Laps" value={details.stats.fastestLaps} />
                    <StatBox label="Points" value={details.stats.totalPoints.toLocaleString()} />
                    <StatBox label="Races" value={details.stats.totalRaces} />
                  </div>

                  {/* Career span */}
                  <div className="grid grid-cols-3 gap-2.5 mb-5" style={{ marginBottom: "0.75rem" }}>
                    <StatBox label="Seasons" value={details.stats.seasons} />
                    <StatBox label="First Season" value={details.stats.firstSeason ?? "—"} />
                    <StatBox label="Latest Season" value={details.stats.latestSeason ?? "—"} />
                  </div>

                  {/* Teams */}
                  {details.stats.teams.length > 0 && (
                    <>
                      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#6b7280", margin: "0.25rem 0" }}>Teams</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        {details.stats.teams.map(team => (
                          <span
                            key={team}
                            className="text-xs px-3 py-1 rounded-lg font-semibold"
                            style={{ background: "rgba(255,255,255,0.05)", color: "#d1d5db", border: "1px solid rgba(255,255,255,0.08)", padding: "0.25rem 0.75rem", marginBottom: "0.5rem" }}
                          >
                            {team}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Current standing */}
                  {details.stats.currentStanding && (
                    <div
                      className="flex items-center justify-between rounded-xl px-4 py-3 mb-5"
                      style={{ background: `${teamColor}10`, border: `1px solid ${teamColor}25`, padding: "0.75rem" }}
                    >
                      <p className="text-sm font-semibold text-white">Latest Championship Standing</p>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs" style={{ color: "#9ca3af" }}>Position</p>
                          <p className="font-black text-lg" style={{ color: teamColor }}>P{details.stats.currentStanding.position}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs" style={{ color: "#9ca3af" }}>Points</p>
                          <p className="font-black text-lg text-white">{details.stats.currentStanding.points}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Wikipedia link */}
                  {details.url && (
                    <a
                      href={details.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.01]"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#d1d5db", padding: "0.75rem" }}
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View on Wikipedia
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};