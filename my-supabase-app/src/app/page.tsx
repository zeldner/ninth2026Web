// Ilya Zeldner
import { supabase } from "@/lib/supabase";
import { addEmail, deleteEmail } from "./actions";
import LikeButton from "@/components/LikeButton";

interface WaitlistEntry {
  // Define the structure of a waitlist entry
  id: string;
  email: string;
  likes: number | 0;
  created_at: string;
}

export default async function Page() {
  const { data } = await supabase
    .from("Waitlist2026")
    .select("*") // Select all columns
    .order("created_at", { ascending: false }); // Order by creation date descending

  const waitlist = data as WaitlistEntry[] | null; // Type assertion

  return (
    <main className="max-w-xl mx-auto p-10 font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold">Student List</h1>
      </div>

      {/* ADD FORM */}
      <section className="mb-10 p-6 bg-gray-50 rounded-lg">
        <form action={addEmail} className="flex gap-2">
          <input
            name="email" //  This MUST match actions.ts
            type="email"
            placeholder="Enter Email"
            required
            className="flex-1 p-2 border rounded text-black"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </form>
      </section>

      {/* LIST SECTION */}
      <ul className="space-y-4">
        {waitlist?.map(
          (
            user // Map over the waitlist data
          ) => (
            <li
              key={user.id} // Unique key for each list item
              className="p-4 border-b flex justify-between items-center"
            >
              <div>
                <p className="text-black font-medium">{user.email}</p>

                {/* The Server Page passes the Database Data (id and likes) 
        into the Client Component.
      */}
                <LikeButton id={user.id} initialLikes={user.likes || 0} />
              </div>

              <form action={deleteEmail}>
                <input type="hidden" name="studentId" value={user.id} />
                <button type="submit" className="text-red-400 text-xs">
                  Delete
                </button>
              </form>
            </li>
          )
        )}
      </ul>
    </main>
  );
}
