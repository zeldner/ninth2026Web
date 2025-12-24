// Ilya Zeldner
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { addEmail, deleteEmail } from "./actions";
import LikeButton from "@/components/LikeButton";

const TABLE_NAME = "Waitlist2026";
const IP_Table = "traffic";

export default async function Page() {
  // CAPTURE IP
  const headerList = await headers(); // Get request headers
  const ip = headerList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1"; // Fallback IP

  // TRAFFIC LOGIC
  try {
    const { data: existing } = await supabase
      .from(IP_Table)
      .select("*") // Select all columns
      .eq("ip_address", ip) // Filter by IP address
      .single(); // Expect a single record

    if (existing) {
      await supabase
        .from(IP_Table)
        .update({
          visit_count: (existing.visit_count || 0) + 1,
          last_visit: new Date().toISOString(),
        }) // Update visit count and last visit
        .eq("ip_address", ip);
    } else {
      await supabase.from(IP_Table).insert([
        {
          ip_address: ip, // Insert new record
          visit_count: 1, // Initial visit count
          last_visit: new Date().toISOString(), // Current timestamp
        },
      ]);
    }
  } catch (e) {
    console.error("Traffic Log Error:", e);
  }

  // DATA FETCHING
  const { data: waitlist } = await supabase
    .from(TABLE_NAME) // Select from waitlist table
    .select("*") // Select all columns
    .order("created_at", { ascending: false }); // Order by creation date descending

  const { data: trafficLogs, error: trafficError } = await supabase
    .from(IP_Table)
    .select("*")
    .order("last_visit", { ascending: false });

  return (
    <main className="max-w-4xl mx-auto p-10 font-sans text-black">
      <div className="flex justify-between items-center border-b pb-6 mb-10">
        <h1 className="text-3xl font-black text-blue-700 uppercase tracking-tighter">
          Admin Portal
        </h1>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-400">CURRENT VISITOR IP</p>
          <p className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {ip}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT: WAITLIST (2 Columns wide) */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            Student Waitlist
          </h2>

          <form
            action={addEmail}
            className="flex gap-2 mb-8 bg-gray-50 p-4 rounded-xl border"
          >
            <input
              name="email"
              type="email"
              placeholder="student@example.com"
              required
              className="flex-1 p-3 rounded-lg border border-gray-300"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Add
            </button>
          </form>

          <div className="grid gap-4">
            {waitlist?.map((user: any) => (
              <div
                key={user.id}
                className="p-5 border rounded-xl flex justify-between items-center hover:shadow-md transition bg-white"
              >
                <div>
                  <p className="font-bold text-lg">{user.email}</p>
                  <LikeButton id={user.id} initialLikes={user.likes || 0} />
                </div>
                <form action={deleteEmail}>
                  <input type="hidden" name="studentId" value={user.id} />
                  <button
                    type="submit"
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition"
                  >
                    DELETE
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: TRAFFIC (1 Column wide) */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl h-fit shadow-2xl">
          <h2 className="text-lg font-bold mb-6 text-blue-400">Live Traffic</h2>

          {trafficError && (
            <p className="text-red-400 text-xs">
              Error: {trafficError.message}
            </p>
          )}

          <div className="space-y-4">
            {trafficLogs?.map((log: any) => (
              <div
                key={log.id}
                className="border-b border-slate-700 pb-3 last:border-0"
              >
                <p className="font-mono text-sm text-blue-300">
                  {log.ip_address}
                </p>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">
                    Visits: {log.visit_count}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(log.last_visit).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {(!trafficLogs || trafficLogs.length === 0) && (
              <p className="text-slate-500 italic text-sm text-center py-10">
                No traffic recorded.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
