import { useEffect, useRef, useState, useMemo } from "react";

interface DriverPos {
  driver_number: number;
  name_acronym: string;
  team_colour: string;
  x: number;
  y: number;
  z?: number;
}

interface TrackMapProps {
  driverPositions: Record<string, DriverPos>;
  circuitShortName: string | null;
}

const CIRCUIT_GEOJSON_MAP: Record<string, string> = {
  "melbourne":          "au-1953",
  "albert park":        "au-1953",
  "shanghai":           "cn-2004",
  "suzuka":             "jp-1962",
  "sakhir":             "bh-2002",
  "bahrain":            "bh-2002",
  "jeddah":             "sa-2021",
  "miami":              "us-2022",
  "imola":              "it-1953",
  "monte carlo":        "mc-1929",
  "monaco":             "mc-1929",
  "barcelona":          "es-1991",
  "montmelo":           "es-1991",
  "montreal":           "ca-1978",
  "gilles villeneuve":  "ca-1978",
  "spielberg":          "at-1969",
  "red bull ring":      "at-1969",
  "silverstone":        "gb-1948",
  "spa":                "be-1925",
  "spa-francorchamps":  "be-1925",
  "hungaroring":        "hu-1986",
  "budapest":           "hu-1986",
  "zandvoort":          "nl-1948",
  "monza":              "it-1922",
  "baku":               "az-2016",
  "singapore":          "sg-2008",
  "marina bay":         "sg-2008",
  "austin":             "us-2012",
  "cota":               "us-2012",
  "mexico city":        "mx-1962",
  "interlagos":         "br-1940",
  "são paulo":          "br-1940",
  "sao paulo":          "br-1940",
  "las vegas":          "us-2023",
  "lusail":             "qa-2004",
  "losail":             "qa-2004",
  "qatar":              "qa-2004",
  "yas marina":         "ae-2009",
  "abu dhabi":          "ae-2009",
};

const GEOJSON_BASE =
  "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits";

const VB = 500;
const PAD = 32;

function buildTrackPath(coords: [number, number][]): string {
  const xs = coords.map(([lon]) => lon);
  const ys = coords.map(([, lat]) => -lat);

  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const scale = Math.min((VB - 2 * PAD) / rangeX, (VB - 2 * PAD) / rangeY);
  const offX = (VB - rangeX * scale) / 2;
  const offY = (VB - rangeY * scale) / 2;

  const pts = coords.map(([lon, lat]) => {
    const px = offX + (lon - minX) * scale;
    const py = offY + (-lat - minY) * scale;
    return `${px.toFixed(2)},${py.toFixed(2)}`;
  });

  return `M${pts.join("L")}Z`;
}

function mapPosToSvg(
  x: number,
  y: number,
  bbox: { minX: number; maxX: number; minY: number; maxY: number }
): { svgX: number; svgY: number } {
  const rX = bbox.maxX - bbox.minX || 1;
  const rY = bbox.maxY - bbox.minY || 1;
  const nx = (x - bbox.minX) / rX;
  const ny = 1 - (y - bbox.minY) / rY;
  return {
    svgX: PAD + nx * (VB - 2 * PAD),
    svgY: PAD + ny * (VB - 2 * PAD),
  };
}

export const TrackMap = ({ driverPositions, circuitShortName }: TrackMapProps) => {
  const [trackPath, setTrackPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const geojsonId = useMemo(
    () => CIRCUIT_GEOJSON_MAP[circuitShortName?.toLowerCase().trim() ?? ""] ?? null,
    [circuitShortName]
  );

  useEffect(() => {
    if (!geojsonId) {
      setTrackPath(null);
      setError(circuitShortName ? `No map for "${circuitShortName}"` : null);
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    setTrackPath(null);

    fetch(`${GEOJSON_BASE}/${geojsonId}.geojson`, { signal: ctrl.signal })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((gj) => {
        const coords: [number, number][] =
          gj?.geometry?.coordinates ??
          gj?.features?.[0]?.geometry?.coordinates ?? [];
        if (!coords.length) throw new Error("empty coords");
        setTrackPath(buildTrackPath(coords));
        setLoading(false);
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        setError(`Failed: ${e.message}`);
        setLoading(false);
      });

    return () => ctrl.abort();
  }, [geojsonId, circuitShortName]);

  const drivers = Object.values(driverPositions).filter((d) => d.x !== 0 || d.y !== 0);

  const posBbox = useMemo(() => {
    if (!drivers.length) return null;
    const xs = drivers.map((d) => d.x);
    const ys = drivers.map((d) => d.y);
    return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
  }, [driverPositions]);

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        backgroundColor: "#0c0c0c",
        borderRadius: 4,
        overflow: "hidden",
        minHeight: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {loading && !trackPath && (
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#333", letterSpacing: "0.14em" }}>
          LOADING TRACK...
        </span>
      )}

      {!loading && error && !trackPath && (
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#2a2a2a", letterSpacing: "0.1em", padding: 12, textAlign: "center" }}>
          {circuitShortName ? `NO MAP: ${circuitShortName.toUpperCase()}` : "AWAITING SESSION..."}
        </span>
      )}

      {(trackPath || (posBbox && drivers.length > 0)) && (
        <svg
          viewBox={`0 0 ${VB} ${VB}`}
          style={{ width: "100%", height: "100%", display: "block" }}
          xmlns="http://www.w3.org/2000/svg"
        >

          {trackPath && (
            <>
              <path d={trackPath} fill="none" stroke="#252525" strokeWidth={24} strokeLinejoin="round" strokeLinecap="round" />
              <path d={trackPath} fill="none" stroke="#353535" strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" />
              <path d={trackPath} fill="none" stroke="#161616" strokeWidth={5}  strokeLinejoin="round" strokeLinecap="round" />
            </>
          )}

          {posBbox && drivers.map((driver) => {
            const { svgX, svgY } = mapPosToSvg(driver.x, driver.y, posBbox);
            const color = `#${driver.team_colour.replace(/^#/, "")}`;
            return (
              <DriverDot key={driver.driver_number} svgX={svgX} svgY={svgY} color={color} acronym={driver.name_acronym} />
            );
          })}
        </svg>
      )}
    </div>
  );
};

const DriverDot = ({ svgX, svgY, color, acronym }: { svgX: number; svgY: number; color: string; acronym: string }) => (
  <g>
    <circle cx={svgX} cy={svgY} r={11} fill={`${color}18`} stroke={`${color}44`} strokeWidth={1.5} />

    <circle cx={svgX} cy={svgY} r={6} fill={color} />

    <rect x={svgX - 15} y={svgY - 25} width={30} height={12} rx={2} fill="#0a0a0aee" />

    <text
      x={svgX}
      y={svgY - 15}
      textAnchor="middle"
      style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, fill: color, letterSpacing: "0.04em", userSelect: "none" }}
    >
      {acronym}
    </text>
  </g>
);