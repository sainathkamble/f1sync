import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { DriverCard } from "../components/DriverCard";

interface Driver {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  headshot_url: string;
  country_code: string;
}

export const Drivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driverIdMap, setDriverIdMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [driversRes, mapRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/v1/drivers`, { credentials: "include" }),
          fetch(`${import.meta.env.VITE_API_URL}/v1/driver-map/2026`, { credentials: "include" }),
        ]);

        if (!driversRes.ok) throw new Error("Failed to fetch drivers");

        const [driversData, mapData] = await Promise.all([
          driversRes.json(),
          mapRes.ok ? mapRes.json() : Promise.resolve({}),
        ]);

        setDrivers(driversData);
        setDriverIdMap(mapData);
      } catch {
        setError("Failed to load drivers");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ background: "#0a0a0a" }}>
      <Navbar />
      <div className="flex-1 px-6 md:px-10 py-10" style={{ marginBottom: "2rem" }}>
        <div className="mb-8 flex flex-col items-center gap-1" style={{ padding: "2rem 0" }}>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Formula 1</p>
          <h1 className="text-3xl font-black tracking-wide">2026 Drivers</h1>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
          </div>
        )}

        {error && <p className="text-red-400 text-sm text-center py-20">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" style={{padding: "0 1rem"}}>
            {drivers.map(driver => (
              <DriverCard
                key={driver.driver_number}
                driver={driver}
                driverIdMap={driverIdMap}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};