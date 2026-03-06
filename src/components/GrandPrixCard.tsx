import { useState } from "react";

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
  sessions?: Session[];
}

interface Session {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
}

const sessionColor: Record<string, string> = {
  Race: "#dc2626",
  Qualifying: "#f59e0b",
  Sprint: "#8b5cf6",
  "Sprint Qualifying": "#ec4899",
  "Practice 1": "#3b82f6",
  "Practice 2": "#3b82f6",
  "Practice 3": "#3b82f6",
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const isPast = (d: string) => new Date(d) < new Date();

interface Props {
  meeting: Meeting;
  index: number;
}

export const GrandPrixCard = ({ meeting, index }: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const past = isPast(meeting.date_end);
  const upcoming = !past;

  return (
    <>
      {/* Card */}
      <div
        className="relative rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        style={{
          background: "rgba(18,18,18,0.95)",
          border: "1px solid rgba(255,255,255,0.07)",
          opacity: past ? 0.6 : 1,
        }}
        onClick={() => setModalOpen(true)}
      >
        {/* Circuit image */}
        <div className="relative h-40 overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
          {meeting.circuit_image ? (
            <img
              src={meeting.circuit_image}
              alt={meeting.circuit_short_name}
              className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
              style={{ filter: past ? "grayscale(80%)" : "grayscale(0%)" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="48" height="48" fill="none" stroke="#374151" strokeWidth="1" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 8v4l3 3" />
              </svg>
            </div>
          )}

          {/* Round badge */}
          <div
            className="absolute top-3 left-3 text-xs font-black px-2 py-1 rounded"
            style={{ background: "rgba(0,0,0,0.7)", color: "#9ca3af", backdropFilter: "blur(4px)" }}
          >
            RD {String(index + 1).padStart(2, "0")}
          </div>

          {/* Status badge */}
          <div className="absolute top-3 right-3">
            {past ? (
              <span className="text-xs px-2 py-1 rounded font-semibold" style={{ background: "rgba(0,0,0,0.7)", color: "#6b7280", backdropFilter: "blur(4px)" }}>
                Completed
              </span>
            ) : (
              <span className="text-xs px-2 py-1 rounded font-semibold" style={{ background: "rgba(220,38,38,0.8)", color: "white", backdropFilter: "blur(4px)" }}>
                Upcoming
              </span>
            )}
          </div>

          {/* Dark gradient at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-12" style={{ background: "linear-gradient(to top, rgba(18,18,18,1), transparent)" }} />
        </div>

        {/* Card body */}
        <div className="px-4 pb-4 pt-2">
          {/* Country flag + name */}
          <div className="flex items-center gap-2 mb-2">
            {meeting.country_flag && (
              <img src={meeting.country_flag} alt={meeting.country_name} className="h-3.5 rounded-sm object-cover" style={{ width: "22px" }} />
            )}
            <span className="text-xs text-gray-400 uppercase tracking-widest">{meeting.country_name}</span>
          </div>

          {/* Meeting name */}
          <h3 className="text-white font-black text-base leading-tight mb-1">{meeting.meeting_name}</h3>
          <p className="text-gray-600 text-xs truncate mb-3">{meeting.location} · {meeting.circuit_short_name}</p>

          {/* Date + arrow */}
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-xs">{formatDate(meeting.date_start)} — {formatDate(meeting.date_end)}</p>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 group-hover:translate-x-1"
              style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)" }}
            >
              <svg width="12" height="12" fill="none" stroke="#dc2626" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ background: "rgba(15,15,15,0.98)", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header image */}
            <div className="relative h-48" style={{ background: "rgba(255,255,255,0.03)" }}>
              {meeting.circuit_image && (
                <img src={meeting.circuit_image} alt={meeting.circuit_short_name} className="w-full h-full object-contain p-8" />
              )}
              <div className="absolute inset-x-0 bottom-0 h-16" style={{ background: "linear-gradient(to top, rgba(15,15,15,1), transparent)" }} />

              {/* Close button */}
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal content */}
            <div className="px-6 pb-6">

              {/* Flag + country */}
              <div className="flex items-center gap-2 mb-2">
                {meeting.country_flag && (
                  <img src={meeting.country_flag} alt={meeting.country_name} className="h-4 rounded-sm object-cover" style={{ width: "26px" }} />
                )}
                <span className="text-xs text-gray-400 uppercase tracking-widest">{meeting.country_name} · {meeting.country_code}</span>
              </div>

              {/* Official name */}
              <h2 className="text-white font-black text-lg leading-tight mb-1">{meeting.meeting_official_name}</h2>
              <p className="text-gray-500 text-sm mb-5">{meeting.location} · {meeting.circuit_short_name}</p>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Circuit Type", value: meeting.circuit_type },
                  { label: "GMT Offset", value: `UTC +${meeting.gmt_offset?.slice(0, 5)}` },
                  { label: "Date Start", value: formatDate(meeting.date_start) },
                  { label: "Date End", value: formatDate(meeting.date_end) },
                  { label: "Season", value: String(meeting.year) },
                  { label: "Status", value: past ? "Completed" : "Upcoming" },
                ].map(item => (
                  <div
                    key={item.label}
                    className="rounded-xl px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">{item.label}</p>
                    <p className="text-sm text-white font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Sessions */}
              {meeting.sessions && meeting.sessions.length > 0 && (
                <>
                  <p className="text-xs text-gray-600 uppercase tracking-widest mb-3">Sessions</p>
                  <div className="flex flex-col gap-2">
                    {meeting.sessions.map(session => (
                      <div
                        key={session.session_key}
                        className="flex items-center justify-between rounded-xl px-4 py-3"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: sessionColor[session.session_name] ?? "#6b7280" }}
                          />
                          <span className="text-sm font-semibold text-white">{session.session_name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">{formatDate(session.date_start)}</p>
                          <p className="text-xs text-gray-600">{formatTime(session.date_start)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Circuit info link */}
              {meeting.circuit_info_url && (
                <a
                  href={meeting.circuit_info_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.01]"
                  style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.25)", color: "#fca5a5" }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Circuit Info
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};