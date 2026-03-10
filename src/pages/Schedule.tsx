import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { GrandPrixCard } from "../components/GrandPrixCard";

interface Session {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
}

interface Meeting {
  circuit_key: number;
  circuit_info_url: string;
  circuit_image: string;
  circuit_short_name: string;
  circuit_type: string;
  country_code: string;
  country_flag: string;
  country_key: number;
  country_name: string;
  date_end: string;
  date_start: string;
  gmt_offset: string;
  location: string;
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  year: number;
  sessions: Session[];
}

export const Schedule = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/schedule`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed");
        setMeetings(await res.json());
      } catch {
        setError("Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ background: "#0a0a0a" }}>
      <Navbar />

      <div className="flex-1 px-6 md:px-10 py-10" style={{ marginBottom: "2rem" }}>
        <div className="flex flex-col items-center gap-1" style={{ padding: "2rem 0" }}>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Formula 1</p>
          <h1 className="text-3xl font-black tracking-wide">2025 Season Schedule</h1>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
          </div>
        )}

        {error && <p className="text-red-400 text-sm text-center py-20">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" style={{ padding: "0 2rem" }}>
            {meetings.map((meeting, idx) => (
              <GrandPrixCard key={meeting.meeting_key} meeting={meeting} index={idx} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};