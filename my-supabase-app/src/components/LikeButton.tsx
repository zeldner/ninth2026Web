// Ilya Zeldner
"use client";

import { incrementLikes } from "@/app/actions"; // The Action that updates the Database

// pass the student's ID and current likes as "props"
export default function LikeButton({
  id,
  initialLikes,
}: {
  id: string;
  initialLikes: number;
}) {
  return (
    <button
      onClick={async () => {
        // This is where the PURE FRONT (Click) talks to the BACK (Action)
        await incrementLikes(id);
      }}
      className="bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1 rounded-full text-sm border border-red-200 transition"
    >
      ❤️ {initialLikes} {initialLikes === 1 ? "like" : "likes"}
    </button>
  );
}
