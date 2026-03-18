import { useState, useEffect, useRef } from "react";
import { Navbar } from "../components/Navbar.tsx";
import { Footer } from "../components/Footer.tsx";
import { io, Socket } from "socket.io-client";

interface DriverRow {
  position: number;
  driver_number: number;
  name_acronym: string;
  team_colour: string;
  rpm: number;
  speed: number;
  throttle: number;
  brake: boolean;
  drs: number;
  tyre_compound: string;
  tyre_age: number;
  battery_charge: number;
  interval: string;
  gap_to_leader: string;
  best_lap_time?: string;
  last_lap_time?: string;
  in_pit?: boolean;
  interval_to_position_ahead?: string;
  retired?: boolean;
  stopped?: boolean;
  show_position?: boolean;
  status?: number;
  line?: number;
  stints: Stint[];
  radio_available: boolean;
  radio_url?: string;
}

interface Stint {
  compound: string;
  lap_start: number;
  lap_end?: number;
}

interface WeatherData {
  AirTemp: string;
  TrackTemp: string;
  WindSpeed: string;
  WindDirection: string;
  Pressure: string;
  Rainfall: string;
  Humidity: string;
}

interface RaceControlMessage {
  Utc: string;
  Category: string;
  Message: string;
  Flag?: string;
  Lap: number;
  Scope: string;
}

const TYRE_COLORS: Record<string, string> = {
  SOFT: "#E8002D",
  MEDIUM: "#FFF200",
  HARD: "#FFFFFF",
  INTERMEDIATE: "#39B54A",
  WET: "#0067FF",
  UNKNOWN: "#888",
};

const FLAG_COLORS: Record<string, string> = {
  GREEN: "#39B54A",
  YELLOW: "#FFF200",
  RED: "#E8002D",
  BLUE: "#0067FF",
  CHEQUERED: "#FFFFFF",
  CLEAR: "#39B54A",
  VIRTUAL_SAFETY_CAR: "#FFF200",
  SAFETY_CAR: "#FFF200",
};

const normalizeList = <T,>(value: T | T[] | null | undefined): T[] => {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
};

/** Build a blank DriverRow from any raw driver object coming off the wire */
const buildDriverRow = (raw: any): DriverRow => ({
  position: Number(raw.Position ?? raw.position ?? raw.Line ?? raw.line ?? 99) || 99,
  driver_number: Number(raw.driver_number ?? raw.RacingNumber ?? raw.car_number ?? raw.number ?? 0),
  name_acronym: raw.code ?? raw.name_acronym ?? raw.Tla ?? raw.name ?? "???",
  team_colour: raw.team_colour ?? raw.TeamColour ?? raw.team_color ?? "#888888",
  rpm: Number(raw.rpm ?? raw.RPM ?? 0),
  speed: Number(raw.speed ?? raw.Speed ?? 0),
  throttle: Number(raw.throttle ?? raw.Throttle ?? 0),
  brake: raw.brake === 1 || raw.brake === true || raw.brake === "1",
  drs: Number(raw.drs ?? raw.DRS ?? 0),
  tyre_compound: raw.tyre_compound ?? raw.compound ?? "UNKNOWN",
  tyre_age: Number(raw.tyre_age ?? raw.TyreAge ?? 0),
  battery_charge: Number(raw.battery_charge ?? raw.BatteryCharge ?? 0),
  interval: raw.IntervalToPositionAhead?.Value ?? raw.interval ?? raw.gap ?? "—",
  gap_to_leader: raw.GapToLeader ?? raw.gap_to_leader ?? "—",
  best_lap_time: raw.BestLapTime?.Value ?? raw.best_lap_time ?? undefined,
  last_lap_time: raw.LastLapTime?.Value ?? raw.last_lap_time ?? undefined,
  in_pit: Boolean(raw.InPit ?? raw.in_pit ?? false),
  retired: Boolean(raw.Retired ?? raw.retired ?? false),
  stopped: Boolean(raw.Stopped ?? raw.stopped ?? false),
  stints: Array.isArray(raw.stints) ? raw.stints : [],
  radio_available: false,
});

/** Returns all IDs (as strings) that identify this raw driver object */
const rawDriverIds = (raw: any): string[] => {
  const ids: string[] = [];
  for (const key of ["driver_number", "RacingNumber", "car_number", "number", "Line"]) {
    const v = raw?.[key];
    if (v !== undefined && v !== null) {
      const s = String(v).trim();
      ids.push(s);
      if (s.length === 1) ids.push(s.padStart(2, "0"));
    }
  }
  return ids;
};

const TyreIcon = ({ compound, age }: { compound: string; age: number }) => (
  <div className="flex items-center gap-1">
    <div
      className="w-4 h-4 rounded-full border flex items-center justify-center"
      style={{
        borderColor: TYRE_COLORS[compound] ?? "#888",
        boxShadow: `0 0 4px ${TYRE_COLORS[compound]}55`,
      }}
    >
      <div
        className="w-3 h-3 flex justify-center items-center text-[10px]"
        style={{ color: TYRE_COLORS[compound] ?? "#888", marginBottom: "0.25rem" }}
      >
        {compound === "SOFT" ? "S" : compound === "MEDIUM" ? "M" : compound === "HARD" ? "H" : compound === "INTERMEDIATE" ? "I" : compound === "WET" ? "W" : "?"}
      </div>
    </div>
    <span className="text-xs opacity-60" style={{ fontFamily: "monospace" }}>{age}L</span>
  </div>
);

const DRSIndicator = ({ active }: { active: boolean }) => (
  <span
    className="text-xs px-1 rounded font-bold tracking-widest"
    style={{
      fontFamily: "monospace",
      backgroundColor: active ? "#39B54A22" : "transparent",
      color: active ? "#39B54A" : "#444",
      border: `1px solid ${active ? "#39B54A" : "#333"}`,
      transition: "all 0.3s",
      padding: "0 4px",
    }}
  >
    DRS
  </span>
);

const RadioButton = ({ available, url }: { available: boolean; url?: string }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const handleClick = () => {
    if (!available || !url) return;
    if (!audioRef.current) audioRef.current = new Audio(url);
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
      audioRef.current.onended = () => setPlaying(false);
    }
  };

  if (!available) return <div className="w-6 h-4" />;

  return (
    <button onClick={handleClick} className="relative flex items-center justify-center w-6 h-5 group">
      <span
        className="absolute w-2 h-2 rounded-full"
        style={{
          backgroundColor: "#E8002D",
          animation: playing ? "ping 0.8s cubic-bezier(0,0,0.2,1) infinite" : "radioPulse 2s ease-in-out infinite",
        }}
      />
      <span className="relative w-2 h-2 rounded-full" style={{ backgroundColor: "#E8002D" }} />
      <style>{`
        @keyframes radioPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
      `}</style>
    </button>
  );
};

const BatteryBar = ({ charge }: { charge: number }) => {
  const color = charge > 60 ? "#39B54A" : charge > 30 ? "#FFF200" : "#E8002D";
  return (
    <div className="flex items-center gap-1">
      <div className="w-10 h-2 rounded-sm overflow-hidden" style={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}>
        <div className="h-full rounded-sm transition-all duration-500" style={{ width: `${charge}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs w-6 text-right" style={{ fontFamily: "monospace", color }}>{charge}%</span>
    </div>
  );
};

const ThrottleBar = ({ value, braking }: { value: number; braking: boolean }) => (
  <div className="flex items-center gap-1">
    <div className="w-8 h-2 rounded-sm overflow-hidden" style={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}>
      <div
        className="h-full rounded-sm transition-all duration-200"
        style={{ width: `${value}%`, backgroundColor: braking ? "#E8002D" : "#39B54A" }}
      />
    </div>
  </div>
);

/** Parse "1:18.422" → seconds float for delta math */
const parseTime = (t?: string): number | null => {
  if (!t) return null;
  const parts = t.split(":");
  if (parts.length === 2) {
    const mins = parseFloat(parts[0]);
    const secs = parseFloat(parts[1]);
    if (!isNaN(mins) && !isNaN(secs)) return mins * 60 + secs;
  }
  const s = parseFloat(t);
  return isNaN(s) ? null : s;
};

const LapTimesCell = ({ best, last }: { best?: string; last?: string }) => {
  const bestSec = parseTime(best);
  const lastSec = parseTime(last);
  const delta = bestSec !== null && lastSec !== null ? lastSec - bestSec : null;

  // Colour logic: purple = personal best matched, green = faster, red = slower
  const deltaColor = delta === null ? "#555" : delta <= 0 ? "#b48aff" : delta < 0.5 ? "#39B54A" : "#E8002D";
  const deltaStr = delta === null ? "—" : delta === 0 ? "PB" : `${delta > 0 ? "+" : ""}${delta.toFixed(3)}`;

  return (
    <div
      className="w-48 flex flex-col items-start justify-center flex-shrink-0 px-2"
      style={{ borderRight: "1px solid #1a1a1a", alignSelf: "stretch", width: 120, gap: 2, padding: "0 8px" }}
    >
      <div className="flex items-center justify-between w-full">
        <span style={{ fontFamily: "monospace", fontSize: 8, color: "#444", letterSpacing: "0.08em" }}>BEST</span>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#b48aff", fontWeight: 600 }}>
          {best ?? "—"}
        </span>
      </div>
      <div className="flex items-center justify-between w-full">
        <span style={{ fontFamily: "monospace", fontSize: 8, color: "#444", letterSpacing: "0.08em" }}>LAST</span>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#aaa" }}>
          {last ?? "—"}
        </span>
      </div>
      <div className="flex items-center justify-between w-full">
        <span style={{ fontFamily: "monospace", fontSize: 8, color: "#444", letterSpacing: "0.08em" }}>Δ</span>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: deltaColor, fontWeight: 600 }}>
          {deltaStr}
        </span>
      </div>
    </div>
  );
};

const PitCell = ({ inPit, retired, stopped }: { inPit?: boolean; retired?: boolean; stopped?: boolean }) => {
  if (retired) {
    return (
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: 44, borderRight: "1px solid #1a1a1a", alignSelf: "stretch" }}>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "#E8002D",
            backgroundColor: "#E8002D18",
            border: "1px solid #E8002D44",
            borderRadius: 3,
            padding: "1px 4px",
          }}
        >
          RET
        </span>
      </div>
    );
  }
  if (stopped) {
    return (
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: 44, borderRight: "1px solid #1a1a1a", alignSelf: "stretch" }}>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "#FF8000",
            backgroundColor: "#FF800018",
            border: "1px solid #FF800044",
            borderRadius: 3,
            padding: "1px 4px",
          }}
        >
          STP
        </span>
      </div>
    );
  }
  if (inPit) {
    return (
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: 44, borderRight: "1px solid #1a1a1a", alignSelf: "stretch" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#39B54A",
              backgroundColor: "#39B54A18",
              border: "1px solid #39B54A44",
              borderRadius: 3,
              padding: "1px 4px",
              animation: "pitPulse 1s ease-in-out infinite",
            }}
          >
            PIT
          </span>
        </div>
        <style>{`@keyframes pitPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    );
  }
  // On track — show a subtle green dot
  return (
    <div className="flex items-center justify-center flex-shrink-0" style={{ width: 44, borderRight: "1px solid #1a1a1a", alignSelf: "stretch" }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#39B54A", opacity: 0.35 }} />
    </div>
  );
};

const WeatherPanel = ({ data }: { data: WeatherData | null }) => {
  if (!data)
    return (
      <div className="p-3 text-center" style={{ color: "#444", fontFamily: "monospace", fontSize: 11, padding: "12px" }}>
        AWAITING WEATHER DATA...
      </div>
    );
  return (
    <div className="p-3 space-y-2" style={{ padding: "12px" }}>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {[
          { label: "AIR", value: `${data.AirTemp}°C`, highlight: false },
          { label: "TRACK", value: `${data.TrackTemp}°C`, highlight: data.TrackTemp > "45" },
          { label: "WIND", value: `${data.WindSpeed} km/h`, highlight: false },
          { label: "HUMIDITY", value: `${data.Humidity}%`, highlight: false },
          { label: "PRESSURE", value: `${data.Pressure} hPa`, highlight: false },
          { label: "WIND DIR", value: `${data.WindDirection}°`, highlight: false },
        ].map(({ label, value, highlight }) => (
          <div key={label} className="flex justify-between items-center">
            <span style={{ fontFamily: "monospace", fontSize: 10, color: "#555", letterSpacing: "0.1em" }}>{label}</span>
            <span style={{ fontFamily: "monospace", fontSize: 11, color: highlight ? "#FFF200" : "#ccc", fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>
      <div
        className="flex items-center gap-2 mt-1 px-2 py-1 rounded"
        style={{
          backgroundColor: data.Rainfall === "1" ? "#0067FF11" : "#39B54A11",
          border: `1px solid ${data.Rainfall === "1" ? "#0067FF44" : "#39B54A44"}`,
          padding: "4px 8px",
          marginTop: "8px",
        }}
      >
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.Rainfall === "1" ? "#0067FF" : "#39B54A" }} />
        <span style={{ fontFamily: "monospace", fontSize: 10, color: data.Rainfall === "1" ? "#0067FF" : "#39B54A" }}>
          {data.Rainfall === "1" ? "RAIN" : "DRY CONDITIONS"}
        </span>
      </div>
    </div>
  );
};

const RaceControlPanel = ({ messages }: { messages: RaceControlMessage[] }) => (
  <div className="overflow-y-auto" style={{ maxHeight: 180 }}>
    {messages.length === 0 ? (
      <div className="p-3 text-center" style={{ color: "#444", fontFamily: "monospace", fontSize: 11, padding: "12px" }}>
        NO MESSAGES
      </div>
    ) : (
      messages.map((msg, i) => (
        <div
          key={i}
          className="px-3 py-2 border-b flex gap-2 items-start"
          style={{
            borderColor: "#1a1a1a",
            backgroundColor: i === 0 ? "#ffffff05" : "transparent",
            animation: i === 0 ? "flashIn 0.5s ease" : "none",
            padding: "8px 12px",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
            style={{ backgroundColor: FLAG_COLORS[msg.Flag ?? "GREEN"] ?? "#555", marginTop: 6 }}
          />
          <div className="flex-1 min-w-0 text-white">
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "#555", letterSpacing: "0.08em" }}>
              {(msg.Category ?? "UNKNOWN").toString().toUpperCase()}
              {msg.Lap ? ` - LAP ${msg.Lap}` : ""}
              {msg.Scope ? ` - ${msg.Scope.toUpperCase()}` : ""}
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "#555", letterSpacing: "0.08em" }}>{msg.Utc ?? ""}</div>
            <div style={{ fontFamily: "monospace", fontSize: 10, color: "#ccc", lineHeight: 1.4, wordBreak: "break-word" }}>{msg.Message}</div>
          </div>
        </div>
      ))
    )}
    <style>{`@keyframes flashIn { from { background: #ffffff15; } to { background: transparent; } }`}</style>
  </div>
);

const DriverRowItem = ({ driver, index }: { driver: DriverRow; index: number }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 60);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className="flex items-center gap-0 border-b"
      style={{
        borderColor: "#111",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-8px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        minHeight: 40,
      }}
    >
      <div className="flex items-center justify-center w-7 flex-shrink-0" style={{ borderRight: "1px solid #1a1a1a", alignSelf: "stretch" }}>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: driver.position <= 3 ? "#fff" : "#666", fontWeight: 700 }}>
          {driver.position}
        </span>
      </div>

      <div className="flex items-center gap-1.5 w-20 flex-shrink-0 px-1.5" style={{ borderRight: "1px solid #1a1a1a", alignSelf: "stretch", padding: "0 6px" }}>
        <div className="w-0.5 self-stretch rounded-full" style={{ backgroundColor: `#${driver.team_colour.replace("#", "")}` }} />
        <span style={{ fontFamily: "monospace", fontSize: 11, color: "#e0e0e0", fontWeight: 700, letterSpacing: "0.05em" }}>
          {driver.name_acronym}
        </span>
      </div>

      <div className="flex flex-col items-center w-16 flex-shrink-0 px-1" style={{ borderRight: "1px solid #1a1a1a", alignSelf: "stretch", justifyContent: "center", padding: "0 4px" }}>
        <span style={{ fontFamily: "monospace", fontSize: 9, color: "#444", letterSpacing: "0.08em" }}>RPM</span>
        <span style={{ fontFamily: "monospace", fontSize: 11, color: driver.rpm > 11000 ? "#E8002D" : "#aaa", fontWeight: 600 }}>
          {driver.rpm > 0 ? `${(driver.rpm / 1000).toFixed(1)}k` : "—"}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center gap-0.5 w-16 flex-shrink-0 px-1" style={{ borderRight: "1px solid #1a1a1a", alignSelf: "stretch", padding: "0 4px" }}>
        <ThrottleBar value={driver.throttle} braking={driver.brake} />
        <span style={{ fontFamily: "monospace", fontSize: 9, color: "#444" }}>
          {driver.brake ? "BRK" : driver.throttle > 0 ? `${driver.throttle}%` : "—"}
        </span>
      </div>

      <div className="flex items-center justify-center w-16 flex-shrink-0 px-1" style={{ borderRight: "1px solid #1a1a1a", alignSelf: "stretch", padding: "0 4px" }}>
        <TyreIcon compound={driver.tyre_compound} age={driver.tyre_age} />
      </div>

      <div className="flex items-center justify-center w-16 flex-shrink-0 px-1" style={{ borderRight: "1px solid #1a1a1a", alignSelf: "stretch", padding: "0 4px" }}>
        <BatteryBar charge={driver.battery_charge} />
      </div>

      <div className="flex items-center justify-center w-16 flex-shrink-0 px-1" style={{ borderRight: "1px solid #1a1a1a", alignSelf: "stretch", padding: "0 4px" }}>
        <DRSIndicator active={driver.drs >= 10} />
      </div>

      <div className="flex items-center gap-2 w-16 flex-shrink-0 px-1.5" style={{ borderRight: "1px solid #1a1a1a", alignSelf: "stretch", padding: "0 6px" }}>
        {driver.stints.map((s, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: `${TYRE_COLORS[s.compound] ?? "#888"}70`,
              border: `1px solid ${TYRE_COLORS[s.compound] ?? "#888"}88`,
            }}
            title={`${s.compound} – Lap ${s.lap_start}${s.lap_end ? `–${s.lap_end}` : "+"}`}
          />
        ))}
      </div>

      <div className="flex items-center justify-center w-16 flex-shrink-0 px-1" style={{ borderRight: "1px solid #1a1a1a", alignSelf: "stretch", padding: "0 4px" }}>
        <RadioButton available={driver.radio_available} url={driver.radio_url} />
      </div>

      {/* PIT status */}
      <PitCell inPit={driver.in_pit} retired={driver.retired} stopped={driver.stopped} />

      {/* Best vs Last lap */}
      <LapTimesCell best={driver.best_lap_time} last={driver.last_lap_time} />

      {/* Gap / interval */}
      <div className="flex items-center justify-end flex-1 px-2" style={{ alignSelf: "stretch", padding: "0 8px" }}>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: driver.interval === "LEADER" ? "#FFF200" : "#aaa",
            fontWeight: driver.interval === "LEADER" ? 700 : 400,
            letterSpacing: "0.04em",
          }}
        >
          {driver.interval}
        </span>
      </div>
    </div>
  );
};

const ColHeader = ({ label, width }: { label: string; width: string }) => (
  <div
    className="flex items-center justify-center flex-shrink-0"
    style={{ width, borderRight: "1px solid #111", padding: "0 4px", height: "100%" }}
  >
    <span style={{ fontFamily: "monospace", fontSize: 9, color: "#444", letterSpacing: "0.12em" }}>{label}</span>
  </div>
);

const SectionLabel = ({ children }: { children: string }) => (
  <div
    className="px-3 py-1.5 flex items-center gap-2"
    style={{ borderBottom: "1px solid #1a1a1a", backgroundColor: "#0a0a0a", padding: "6px 12px" }}
  >
    <div className="w-1 h-3 rounded-sm" style={{ backgroundColor: "#E8002D" }} />
    <span style={{ fontFamily: "monospace", fontSize: 9, color: "#555", letterSpacing: "0.18em" }}>{children}</span>
  </div>
);

export const Home = () => {
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [raceControl, setRaceControl] = useState<RaceControlMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || window.location.origin;
    const socket = io(wsUrl, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      timeout: 10000,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join:livetiming");
    });

    socket.on("connect_error", (err) => console.error("WS connect_error", err));
    socket.on("connect_timeout", () => console.warn("WS connect_timeout"));
    socket.on("reconnect_attempt", (attempt) => console.warn("WS reconnect_attempt", attempt));
    socket.on("reconnect_failed", () => console.error("WS reconnect_failed"));
    socket.on("joined:livetiming", () => {});
    socket.onAny((event, payload) => console.debug("WS EVENT", event, payload));
    socket.on("disconnect", (reason) => { setConnected(false); console.warn("WS disconnected", reason); });
    socket.on("error", (err) => console.error("WS error", err));

    // ─── Helpers ────────────────────────────────────────────────────────────────

    /** Build a stable lookup Map<normalisedId, DriverRow> from current state */
    const buildLookup = (list: DriverRow[]): Map<string, DriverRow> => {
      const m = new Map<string, DriverRow>();
      for (const d of list) {
        const id = String(d.driver_number);
        m.set(id, d);
        m.set(id.padStart(2, "0"), d);
      }
      return m;
    };

    /** Given a raw payload object and a lookup map, find the matching DriverRow */
    // const findByRaw = (raw: any, lookup: Map<string, DriverRow>): DriverRow | undefined => {
    //   for (const id of rawDriverIds(raw)) {
    //     const found = lookup.get(id);
    //     if (found) return found;
    //   }
    //   return undefined;
    // };

    // ─── DriverList – seeds the full driver list from the server ────────────────
    const handleDriverList = (payload: any) => {
      const raw = payload?.data ?? payload;
      if (!raw) return;

      // Normalise to a flat array of raw driver objects
      const list: any[] = Array.isArray(raw)
        ? raw
        : typeof raw === "object"
        ? Object.values(raw)
        : [];

      if (list.length === 0) return;

      setDrivers((prev) => {
        const lookup = buildLookup(prev);
        const next = new Map<number, DriverRow>();

        for (const rawDriver of list) {
          if (!rawDriver || typeof rawDriver !== "object") continue;
          const row = buildDriverRow(rawDriver);
          if (!row.driver_number) continue;

          // Merge with any existing row so we don't lose live telemetry already received
          const existing = lookup.get(String(row.driver_number));
          next.set(row.driver_number, existing ? { ...row, ...existing, name_acronym: row.name_acronym, team_colour: row.team_colour } : row);
        }

        return [...next.values()].sort((a, b) => a.position - b.position);
      });
    };

    socket.on("livetiming:DriverList", ({ data }) => handleDriverList(data));
    socket.on("DriverList", ({ data }) => handleDriverList(data));

    // ─── Position ────────────────────────────────────────────────────────────────
    const updatePosition = (data: any) => {
      if (!data) return;
      const list: any[] = Array.isArray(data) ? data : Object.values(data);

      setDrivers((prev) => {
        if (prev.length === 0) return prev; // wait for DriverList
        // const lookup = buildLookup(prev);
        const updated = prev.map((d) => {
          // const raw = findByRaw({ driver_number: d.driver_number }, lookup);
          // find this driver in the incoming list
          const payload = list.find((r) => rawDriverIds(r).some((id) => id === String(d.driver_number) || id === String(d.driver_number).padStart(2, "0")));
          if (!payload) return d;
          return {
            ...d,
            position: Number(payload.Position ?? payload.position ?? payload.pos ?? d.position) || d.position,
            interval: payload.IntervalToPositionAhead?.Value ?? payload.interval ?? payload.gap_to_leader ?? d.interval,
            gap_to_leader: payload.GapToLeader ?? payload.gap_to_leader ?? payload.delta ?? d.gap_to_leader,
          };
        });
        return updated.sort((a, b) => a.position - b.position);
      });
    };

    socket.on("livetiming:Position.z", ({ data }) => updatePosition(data));
    socket.on("livetiming:Position", ({ data }) => updatePosition(data));
    socket.on("Position.z", ({ data }) => updatePosition(data));
    socket.on("Position", ({ data }) => updatePosition(data));

    // ─── CarData ─────────────────────────────────────────────────────────────────
    const updateCarData = (data: any) => {
      if (!data) return;
      const list: any[] = Array.isArray(data) ? data : Object.values(data);

      setDrivers((prev) => {
        if (prev.length === 0) return prev;
        return prev.map((d) => {
          const payload = list.find((r) => rawDriverIds(r).some((id) => id === String(d.driver_number) || id === String(d.driver_number).padStart(2, "0")));
          if (!payload) return d;
          return {
            ...d,
            rpm: payload.rpm ?? payload.RPM ?? d.rpm,
            speed: payload.speed ?? payload.Speed ?? d.speed,
            throttle: payload.throttle ?? payload.Throttle ?? d.throttle,
            brake: payload.brake === 1 || payload.brake === true || payload.brake === "1" ? true : d.brake,
            drs: payload.drs ?? payload.DRS ?? d.drs,
          };
        });
      });
    };

    socket.on("livetiming:CarData.z", ({ data }) => updateCarData(data));
    socket.on("livetiming:CarData", ({ data }) => updateCarData(data));
    socket.on("CarData.z", ({ data }) => updateCarData(data));
    socket.on("CarData", ({ data }) => updateCarData(data));

    // ─── TimingData ───────────────────────────────────────────────────────────────
    const updateTimingData = (payload: any) => {
      const raw = payload?.data ?? payload;
      if (!raw) return;

      const lines = Array.isArray(raw)
        ? raw
        : raw?.Lines ?? raw?.lines ?? raw?.Data ?? raw?.data ?? raw;
      if (!lines) return;

      const list: any[] = Array.isArray(lines) ? lines : Object.values(lines);
      if (list.length === 0) return;

      // Build id→raw map
      const byId = new Map<string, any>();
      for (const row of list) {
        if (!row || typeof row !== "object") continue;
        for (const id of rawDriverIds(row)) {
          byId.set(id, row);
        }
      }

      setDrivers((prev) => {
        // If no drivers yet, seed them from TimingData itself
        if (prev.length === 0) {
          const seeded = list
            .map((r) => buildDriverRow(r))
            .filter((d) => d.driver_number > 0)
            .sort((a, b) => a.position - b.position);
          if (seeded.length > 0) return seeded;
          return prev;
        }

        return prev
          .map((d) => {
            const id = String(d.driver_number);
            const row = byId.get(id) ?? byId.get(id.padStart(2, "0"));
            if (!row) return d;

            return {
              ...d,
              position: Number(row.Position ?? row.position ?? row.Line ?? d.position) || d.position,
              interval: row.IntervalToPositionAhead?.Value ?? row.interval ?? d.interval,
              gap_to_leader: row.GapToLeader ?? row.gap_to_leader ?? d.gap_to_leader,
              best_lap_time: row.BestLapTime?.Value ?? row.best_lap_time ?? d.best_lap_time,
              last_lap_time: row.LastLapTime?.Value ?? row.last_lap_time ?? d.last_lap_time,
              in_pit: Boolean(row.InPit ?? row.in_pit ?? d.in_pit),
              retired: Boolean(row.Retired ?? row.retired ?? d.retired),
              stopped: Boolean(row.Stopped ?? row.stopped ?? d.stopped),
              show_position: row.ShowPosition ?? d.show_position,
              status: row.Status ?? d.status,
              line: row.Line ?? d.line,
              interval_to_position_ahead: row.IntervalToPositionAhead?.Value ?? row.interval ?? d.interval_to_position_ahead,
            };
          })
          .sort((a, b) => a.position - b.position);
      });
    };

    socket.on("livetiming:TimingData", updateTimingData);
    socket.on("livetiming:TimingData.z", updateTimingData);
    socket.on("TimingData", updateTimingData);
    socket.on("TimingData.z", updateTimingData);

    // ─── WeatherData ──────────────────────────────────────────────────────────────
    socket.on("livetiming:WeatherData", ({ data }) => {
      const w = Array.isArray(data) ? data[0] : data;
      setWeather(w ?? null);
    });

    // ─── RaceControlMessages ──────────────────────────────────────────────────────
    socket.on("livetiming:RaceControlMessages", ({ data }) => {
      const messages = normalizeList(data?.Messages ?? data);
      setRaceControl(messages as RaceControlMessage[]);
    });

    // ─── Radio ────────────────────────────────────────────────────────────────────
    socket.on("livetiming:radio", ({ data }) => {
      const clips = normalizeList(data);
      setDrivers((prev) =>
        prev.map((d) => {
          const clip = clips.find((r: any) => r.driver_number === d.driver_number);
          return clip ? { ...d, radio_available: true, radio_url: clip.recording_url } : d;
        })
      );
    });

    return () => {
      socket.emit("leave:livetiming");
      socket.disconnect();
    };
  }, []);

  const isEmpty = drivers.length === 0;

  return (
    <div className="min-h-screen bg-[#080808] text-[#e0e0e0]">
      <Navbar />

      <div className="mx-auto w-full max-w-6xl px-3 pb-4 pt-2 lg:px-4">
        {/* Live indicator */}
        <div className="mt-2 rounded-md border border-[#1f1f1f] bg-[#0b0b0b] p-2 text-xs text-slate-300 flex items-center gap-2" style={{ padding: "4px 8px" }}>
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${connected ? "bg-[#E8002D] shadow-[0_0_8px_#E8002D]" : "bg-[#444]"}`} />
          <span className="font-mono tracking-[0.18em] text-[11px]">{connected ? "LIVE" : "CONNECTING..."}</span>
          <span className="ml-auto text-[#777]">WS: {connected ? "ONLINE" : "OFFLINE"}</span>
        </div>

        {/* Main layout */}
        <div className="mt-3 flex min-h-[72vh] flex-col gap-3 lg:flex-row" style={{ marginTop: "12px" }}>
          {/* Left column */}
          <div className="flex w-full flex-col gap-2 rounded-xl border border-[#1a1a1a] bg-[#090909] p-2 lg:w-[28%] lg:p-3" style={{ padding: "8px" }}>
            <div className="rounded-md border border-[#1c1c1c] bg-[#0c0c0c]">
              <SectionLabel>LIVE STREAM</SectionLabel>
              <div className="relative overflow-hidden rounded-b-md border-t border-[#1a1a1a]" style={{ paddingBottom: "56.25%" }}>
                <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d0d] text-center" />
              </div>
            </div>

            <div className="rounded-md border border-[#1c1c1c] bg-[#0c0c0c]">
              <SectionLabel>WEATHER</SectionLabel>
              <WeatherPanel data={weather} />
            </div>

            <div className="flex-1 overflow-hidden rounded-md border border-[#1c1c1c] bg-[#0c0c0c]">
              <SectionLabel>RACE CONTROL</SectionLabel>
              <RaceControlPanel messages={raceControl} />
            </div>
          </div>

          {/* Right column */}
          <div className="h-[80dvh] flex flex-1 flex-col overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-1 lg:p-2" style={{ padding: "4px" }}>
            <div className="flex min-h-[28px] items-center rounded-md border border-[#1a1a1a] bg-[#101010] text-[10px] font-medium uppercase text-[#888]">
              <ColHeader label="P" width="28px" />
              <ColHeader label="DRIVER" width="80px" />
              <ColHeader label="RPM" width="64px" />
              <ColHeader label="THR" width="64px" />
              <ColHeader label="TYRE" width="64px" />
              <ColHeader label="BAT" width="64px" />
              <ColHeader label="DRS" width="64px" />
              <ColHeader label="STINTS" width="64px" />
              <ColHeader label="RADIO" width="64px" />
              <ColHeader label="PIT" width="44px" />
              <ColHeader label="LAP TIMES" width="140px" />
              <div className="flex-1 flex items-center justify-end pr-2">
                <span className="font-mono text-[9px] text-[#666] tracking-[0.12em]">GAP</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                  <div className="w-2 h-2 rounded-full bg-[#E8002D] animate-pulse" />
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "#444", letterSpacing: "0.18em" }}>
                    {connected ? "AWAITING DRIVER DATA..." : "CONNECTING TO TIMING FEED..."}
                  </span>
                </div>
              ) : (
                drivers.map((driver, i) => (
                  <DriverRowItem key={driver.driver_number} driver={driver} index={i} />
                ))
              )}
            </div>

            <div className="flex items-center gap-3 rounded-b-md border-t border-[#1a1a1a] bg-[#0a0a0a] px-2 py-2 text-[10px] text-[#aaa]" style={{ padding: "8px 12px" }}>
              {Object.entries(TYRE_COLORS)
                .filter(([k]) => k !== "UNKNOWN")
                .map(([compound, color]) => (
                  <div key={compound} className="flex items-center gap-1 text-[#ccc]">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="font-mono text-[9px] tracking-[0.08em]">{compound.slice(0, 3)}</span>
                  </div>
                ))}
              <div className="flex-1" />
              <span className="font-mono text-[9px] text-[#999]">SESSION: LIVE</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};