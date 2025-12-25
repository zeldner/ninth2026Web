// Ilya Zeldner
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { addEmail, deleteEmail } from "./actions";
import LikeButton from "@/components/LikeButton";

const IP_Table = "traffic"; // ip table name
const TABLE_NAME = "Waitlist2026"; // waitlist table name

interface WaitlistEntry {
  id: string; // assuming id is a string
  email: string;
  likes: number;
  created_at: string;
}

export default async function Page() {
  // CAPTURE IP ADDRESS
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0] || // standard header for client IP
    headerList.get("x-real-ip") || // try another common header
    "127.0.0.1"; // Fallback to localhost if no IP found

  // TRAFFIC LOGIC
  try {
    const { data: existing } = await supabase
      .from(IP_Table) // table name
      .select("*") // select all columns
      .eq("ip_address", ip) // filter by captured IP
      .single(); // expect a single record

    if (existing) {
      await supabase
        .from(IP_Table)
        .update({
          // update existing record
          visit_count: (existing.visit_count || 1) + 1, // increment visit count
          last_visit: new Date().toISOString(),
        })
        .eq("ip_address", ip); // filter by IP
    } else {
      await supabase.from(IP_Table).insert([
        {
          ip_address: ip,
          visit_count: 1,
          last_visit: new Date().toISOString(),
        },
      ]);
    }
  } catch (e) {
    console.error("Traffic update skipped or failed:", e);
  }

  // DATA FETCHING
  const { data: waitlist } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("created_at", { ascending: false });

  const { data: trafficLogs } = await supabase
    .from(IP_Table)
    .select("*") // select all columns
    .order("visit_count", { ascending: false }); // order by visit count

  return (
    <main className="max-w-6xl mx-auto p-10 font-sans text-black bg-white min-h-screen">
      {/* HEADER */}
      <div className="border-b border-gray-100 pb-8 mb-10">
        <h1 className="text-4xl font-black text-blue-700 uppercase tracking-tight">
          Classroom Admin <span className="text-gray-300">/</span> 2026
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Hybrid Server/Client Application
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* LEFT: STUDENT MANAGEMENT (Waitlist) */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 underline decoration-blue-500 decoration-4 underline-offset-8">
            Student Waitlist
          </h2>

          {/* Add Student Form */}
          <form
            action={addEmail}
            className="flex gap-2 mb-10 bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm"
          >
            <input
              name="email"
              type="email"
              placeholder="Enter student email..."
              required
              className="flex-1 p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg active:scale-95"
            >
              Add
            </button>
          </form>

          {/* Student List */}
          <div className="grid gap-4">
            {waitlist?.map((user: any) => (
              <div
                key={user.id}
                className="p-5 border border-slate-100 rounded-2xl flex justify-between items-center bg-white shadow-sm hover:shadow-md transition duration-300 group"
              >
                <div>
                  <p className="font-bold text-lg text-slate-800 mb-2">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-3">
                    {/* Unique Like Button for each student */}
                    <LikeButton id={user.id} initialLikes={user.likes || 0} />
                    <span className="text-[10px] text-gray-400 font-mono">
                      Joined:{" "}
                      {new Date(user.created_at).toLocaleDateString("he-IL", {
                        timeZone: "Asia/Jerusalem",
                      })}
                    </span>
                  </div>
                </div>
                <form action={deleteEmail}>
                  <input type="hidden" name="studentId" value={user.id} />
                  <button
                    type="submit"
                    className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Delete
                    </span>
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: TRAFFIC ANALYTICS  */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white rounded-[2rem] shadow-2xl border border-slate-800 sticky top-10 overflow-hidden flex flex-col h-[650px]">
            {/* Header of the Traffic Box */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-blue-400">
                  Live Traffic Feed
                </h2>
                <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                Scroll to view history
              </p>
            </div>

            {/* SCROLLABLE LIST AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {trafficLogs?.map((log: any) => (
                <div
                  key={log.id}
                  className="flex justify-between items-center bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition duration-200"
                >
                  <div className="overflow-hidden">
                    <p className="font-mono text-xs text-blue-300 truncate mb-1">
                      {log.ip_address === "::1" ||
                      log.ip_address === "127.0.0.1"
                        ? "🏠 Ilya Zeldner"
                        : log.ip_address}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold">
                      {new Date(log.last_visit).toLocaleTimeString("he-IL", {
                        timeZone: "Asia/Jerusalem",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* VISITS COUNTER */}
                  <div className="flex flex-col items-center bg-blue-600/10 border border-blue-500/20 rounded-xl px-3 py-1 min-w-[60px]">
                    <span className="text-[8px] text-blue-400 font-black uppercase">
                      Visits
                    </span>
                    <span className="text-xl font-bold text-blue-100 leading-tight">
                      {log.visit_count}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Fixed Footer with Your IP */}
            <div className="p-6 bg-slate-800/50 border-t border-slate-700">
              <p className="text-[9px] text-slate-500 uppercase font-black mb-2 text-center">
                Your Current Network ID
              </p>
              <div className="flex justify-center">
                <code className="text-[11px] font-mono text-blue-400 bg-slate-900 px-4 py-2 rounded-full border border-slate-700 shadow-inner">
                  {ip}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
