import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
import { configError, supabase, type RSVPRow } from "./lib/supabase";


class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="center-screen">
          <div className="message-card">
            <p className="message-monogram">J&amp;L</p>
            <p className="error-msg" style={{ marginTop: 16 }}>
              Something went wrong loading the dashboard:
              <br />
              <code style={{ wordBreak: "break-word" }}>{this.state.error.message}</code>
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Dashboard() {
  const [rows, setRows] = useState<RSVPRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [bump, setBump] = useState(false);

  const fetchAll = async () => {
    if (configError) {
      setError(configError);
      setRows([]);
      return;
    }
    setError(null);
    const { data, error } = await supabase
      .from("rsvps")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Couldn't load responses. Check your connection and try again.");
      return;
    }
    setRows(data ?? []);
  };

  useEffect(() => {
    fetchAll();

    if (configError) return;

    const channel = supabase
      .channel("rsvps-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "rsvps" },
        (payload) => {
          setRows((prev) => (prev ? [payload.new as RSVPRow, ...prev] : [payload.new as RSVPRow]));
          setBump(true);
          setTimeout(() => setBump(false), 650);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalGuests = useMemo(() => {
    return (rows ?? [])
      .filter((r) => r.attending)
      .reduce((sum, r) => sum + (r.guest_count || 0), 0);
  }, [rows]);

  const filteredRows = useMemo(() => {
    const list = rows ?? [];
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (r) => r.name.toLowerCase().includes(q) || (r.message ?? "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const downloadExcel = async () => {
    const list = rows ?? [];
    const XLSX = await import("xlsx");
    const sheetData = list.map((r) => ({
      Name: r.name,
      Status: r.attending ? "Attending" : "Declined",
      Guests: r.guest_count,
      Message: r.message ?? "",
      "Submitted At": formatDate(r.created_at),
    }));
    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    worksheet["!cols"] = [{ wch: 24 }, { wch: 12 }, { wch: 9 }, { wch: 50 }, { wch: 20 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RSVPs");
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `rsvp-responses-${today}.xlsx`);
  };

  return (
    <div className="dash-shell">
      <div className="topbar">
        <div>
          <h1> RSVP Dashboard</h1>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total Guests</p>
          <p className={`stat-value ${bump ? "bump" : ""}`}>{totalGuests}</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search by name or message…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-gold btn-download" style={{ width: "auto" }} onClick={downloadExcel} disabled={!rows || rows.length === 0}>
          Download Excel
        </button>
      </div>

      <div className="table-wrap">
        {error ? (
          <div className="retry-row">
            <p className="error-msg">{error}</p>
            <button className="btn-ghost" onClick={fetchAll} style={{ marginTop: 10 }}>
              Try Again
            </button>
          </div>
        ) : rows === null ? (
          <p className="loading-state">Loading responses…</p>
        ) : filteredRows.length === 0 ? (
          <p className="empty-state">
            {rows.length === 0 ? "No responses yet — they'll appear here the moment guests reply." : "No matches for that search."}
          </p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Guests</th>
                  <th>Message</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>
                      <span className={`pill ${r.attending ? "pill-accept" : "pill-decline"}`}>
                        {r.attending ? "Attending" : "Declined"}
                      </span>
                    </td>
                    <td>{r.guest_count}</td>
                    <td className="msg-cell">{r.message || "—"}</td>
                    <td className="date-cell">{formatDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Root ----------

export default function App() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}