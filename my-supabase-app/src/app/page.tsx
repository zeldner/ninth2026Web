// Ilya Zeldner
import { supabase } from "@/lib/supabase";
import { addEmail, deleteEmail } from "./actions";

const TABLE_NAME = "Waitlist2026"; // Supabase Table Name
export default async function Page() {
  // Fetch Data and Count
  const { data: entries, count } = await supabase
    .from(TABLE_NAME)
    .select("*", { count: "exact" }) // Get exact count
    .order("created_at", { ascending: false });
  // The * (Star) : This represents "All Columns."
  // When we write .select('*'), we are telling Supabase: "I want every piece of information for each row." This includes the id, the email, and the created_at timestamp.
  // It is the standard way to fetch the full record of each student in your waitlist.
  // The count: 'exact'
  // This is a special instruction for the Database Engine. Usually, a database just returns the rows of data. However, by adding { count: 'exact' }, you are asking Supabase to perform two jobs at once:
  // 1.Fetch the rows (the list of emails).
  // 2. Calculate the total (the exact number of rows in the table).
  // This returns a separate variable called count. It is much faster to let the database count the rows in Frankfurt than to download thousands of emails and count them in your code using .length.

  return (
    <main className="p-10 max-w-lg mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-2">Waitlist 2026</h1>
      <p className="text-gray-500 mb-8">
        Current Students: <span className="font-bold text-black">{count}</span>
      </p>

      {/* CREATE FORM */}
      <form action={addEmail} className="flex gap-2 mb-10">
        <input
          name="email"
          type="email"
          placeholder="Enter student email"
          className="border p-2 rounded flex-1 text-black"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Join
        </button>
      </form>

      {/* READ & DELETE LIST */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider">
            Registrations ({count})
          </h2>
        </div>

        <ul className="divide-y divide-gray-100">
          {entries?.map((entry) => (
            <li
              key={entry.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-gray-900 font-medium">{entry.email}</span>
                {/* Format the date nicely */}
                <span className="text-xs text-gray-400">
                  Added:{" "}
                  {new Date(entry.created_at).toLocaleDateString("he-IL")}
                </span>
              </div>

              <form
                action={deleteEmail.bind(null, entry.id)}
                className="mt-2 sm:mt-0"
              >
                <button className="text-red-500 hover:text-red-700 text-sm font-semibold p-1">
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
