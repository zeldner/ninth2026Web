// Ilya Zeldner
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { addEmail, deleteEmail } from "./actions";
import LikeButton from "@/components/LikeButton";

const Table_Name = "Waitlist2026";
const Ip_Table = "traffic";
export default async function Page() {
  // TRAFFIC LOGIC (The Counter)
  const headerList = await headers(); // Get request headers
  const ip = headerList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1"; // Fallback for local dev

  // Upsert the IP address with the current timestamp
  await supabase
    .from(Ip_Table)
    .upsert(
      { ip_address: ip, last_visit: new Date().toISOString() },
      { onConflict: "ip_address" }
    );

  // DATA FETCHING ---
  const { data: waitlist } = await supabase
    .from(Table_Name)
    .select("*")
    .order("created_at", { ascending: false });

  const { data: trafficLogs } = await supabase
    .from(Ip_Table)
    .select("*")
    .order("last_visit", { ascending: false });

  return (
    <main className="max-w-2xl mx-auto p-10 text-black font-sans">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">Admin Dashboard</h1>

      {/* --- WAITLIST SECTION --- */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Student Waitlist</h2>
        <form action={addEmail} className="flex gap-2 mb-6">
          <input
            name="email"
            type="email"
            placeholder="Student Email"
            required
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Student
          </button>
        </form>

        <ul className="space-y-4">
          {waitlist?.map((user: any) => (
            <li
              key={user.id}
              className="p-4 bg-white border rounded-lg flex justify-between items-center shadow-sm"
            >
              <div className="flex flex-col gap-2">
                <span className="font-medium text-lg">{user.email}</span>
                {/* INDIVIDUAL LIKES: Each student gets their own button linked to their ID */}
                <div className="flex items-center gap-2">
                  <LikeButton id={user.id} initialLikes={user.likes || 0} />
                  <span className="text-xs text-gray-400 italic">
                    Saved in DB
                  </span>
                </div>
              </div>

              <form action={deleteEmail}>
                <input type="hidden" name="studentId" value={user.id} />
                <button
                  type="submit"
                  className="text-red-500 hover:bg-red-50 px-3 py-1 rounded border border-red-100 transition"
                >
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      {/* --- TRAFFIC TABLE --- */}
      <section className="mt-16 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Visitor Traffic
        </h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Last Visit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trafficLogs?.map((log: any) => (
                <tr
                  key={log.id}
                  className="hover:bg-blue-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-mono text-blue-700">
                    {log.ip_address}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(log.last_visit).toLocaleString("he-IL")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
