import { useState } from "react";

export type Team = {
  id: number;
  name: string;
  fullName: string;
  country: string;
  base: string;
  teamPrincipal: string;
  chassis: string;
  powerUnit: string;
  firstEntry: number;
  worldChampionships: number;
  color: string;
  drivers: string[];
  logo: string;
  isNew?: boolean;
};

export const ConstructorCard = ({ team }: { team: Team }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <>
      {/* ── CARD ── */}
      <div
        onClick={() => setModalOpen(true)}
        className="rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group"
        style={{ background: "rgba(18,18,18,0.95)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Team color bar */}
        <div className="h-1 w-full" style={{ background: team.color }} />

        {/* Car image hero */}
        <div
          className="relative h-36 flex items-center justify-center overflow-hidden px-4"
          style={{ background: `linear-gradient(135deg, ${team.color}18, rgba(0,0,0,0))` }}
        >
          {!imgError ? (
            <img
              src={team.logo}
              alt={team.name}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110 py-3"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black"
              style={{ background: `${team.color}30`, color: team.color }}
            >
              {team.name[0]}
            </div>
          )}

          {/* NEW badge */}
          {team.isNew && (
            <span
              className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded font-bold"
              style={{ background: "rgba(220,38,38,0.85)", color: "white" }}
            >
              NEW
            </span>
          )}

          {/* Championship badge */}
          {team.worldChampionships > 0 && (
            <div
              className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded text-xs font-black"
              style={{ background: "rgba(0,0,0,0.6)", color: team.color, backdropFilter: "blur(4px)" }}
            >
              🏆 {team.worldChampionships}
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="px-4 pb-4 pt-3">
          {/* Name + country */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-white font-black text-sm leading-tight">{team.name}</h3>
              <p className="text-xs uppercase tracking-widest mt-0.5" style={{ color: "#6b7280" }}>
                {team.country} · Since {team.firstEntry}
              </p>
            </div>
          </div>

          {/* TP */}
          <p className="text-xs mb-3" style={{ color: "#9ca3af" }}>
            <span style={{ color: "#6b7280" }}>TP: </span>{team.teamPrincipal}
          </p>

          {/* Chassis + Power Unit pills */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <span
              className="text-xs px-2 py-0.5 rounded font-semibold"
              style={{ background: `${team.color}18`, color: team.color, border: `1px solid ${team.color}35` }}
            >
              {team.chassis}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded font-semibold"
              style={{ background: "rgba(255,255,255,0.05)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {team.powerUnit}
            </span>
          </div>

          {/* Divider */}
          <div className="h-px mb-3" style={{ background: "rgba(255,255,255,0.05)" }} />

          {/* Drivers */}
          <div className="flex flex-col gap-1.5">
            {team.drivers.map(driver => (
              <div
                key={driver}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                style={{ background: `${team.color}12`, border: `1px solid ${team.color}28` }}
              >
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: team.color }} />
                <span className="text-xs font-semibold text-white">{driver}</span>
              </div>
            ))}
          </div>

          {/* Arrow */}
          <div className="flex justify-end mt-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 group-hover:translate-x-1"
              style={{ background: `${team.color}20`, border: `1px solid ${team.color}40` }}
            >
              <svg width="10" height="10" fill="none" stroke={team.color} strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
              </svg>
            </div>
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
            style={{ background: "rgba(13,13,13,0.99)", border: `1px solid ${team.color}50` }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal color bar */}
            <div className="h-1.5 w-full" style={{ background: team.color }} />

            {/* Modal car image hero */}
            <div
              className="relative h-48 flex items-center justify-center px-8"
              style={{ background: `linear-gradient(135deg, ${team.color}20, rgba(0,0,0,0))` }}
            >
              {!imgError ? (
                <img
                  src={team.logo}
                  alt={team.name}
                  className="h-full w-full object-contain py-4"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black" style={{ background: `${team.color}30`, color: team.color }}>
                  {team.name[0]}
                </div>
              )}

              {/* Badges */}
              {team.isNew && (
                <span className="absolute top-3 left-3 text-xs px-2 py-0.5 rounded font-bold" style={{ background: "rgba(220,38,38,0.85)", color: "white" }}>
                  NEW 2026
                </span>
              )}

              {/* Close */}
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 pb-6">
              {/* Full name + country */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-xl font-black text-white">{team.fullName}</h2>
                  {team.isNew && (
                    <span className="text-xs px-1.5 py-0.5 rounded font-bold shrink-0" style={{ background: "rgba(220,38,38,0.2)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.3)" }}>
                      NEW
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-widest">{team.country}</p>
              </div>

              {/* Championships highlight */}
              {team.worldChampionships > 0 && (
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5"
                  style={{ background: `${team.color}15`, border: `1px solid ${team.color}35` }}
                >
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="text-xs uppercase tracking-widest" style={{ color: "#9ca3af" }}>World Championships</p>
                    <p className="text-2xl font-black" style={{ color: team.color }}>{team.worldChampionships}</p>
                  </div>
                </div>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {[
                  { label: "Team Principal", value: team.teamPrincipal },
                  { label: "Chassis", value: team.chassis },
                  { label: "Power Unit", value: team.powerUnit },
                  { label: "First Entry", value: team.firstEntry },
                  { label: "Base", value: team.base },
                  { label: "Country", value: team.country },
                  { label: "Championships", value: team.worldChampionships > 0 ? `${team.worldChampionships} titles` : "None yet" },
                  { label: "Season", value: "2026" },
                ].map(item => (
                  <div
                    key={item.label}
                    className="rounded-xl px-3 py-2.5"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "#6b7280" }}>{item.label}</p>
                    <p className="text-sm font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Chassis + PU pills */}
              <div className="flex gap-2 mb-5 flex-wrap">
                <span
                  className="text-sm px-3 py-1 rounded-lg font-bold"
                  style={{ background: `${team.color}20`, color: team.color, border: `1px solid ${team.color}40` }}
                >
                  🏎 {team.chassis}
                </span>
                <span
                  className="text-sm px-3 py-1 rounded-lg font-semibold"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#d1d5db", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  ⚡ {team.powerUnit}
                </span>
              </div>

              {/* Drivers */}
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#6b7280" }}>2026 Drivers</p>
              <div className="flex flex-col gap-2">
                {team.drivers.map((driver, i) => (
                  <div
                    key={driver}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: `${team.color}10`, border: `1px solid ${team.color}25` }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                      style={{ background: `${team.color}30`, color: team.color }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-sm font-semibold text-white">{driver}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};