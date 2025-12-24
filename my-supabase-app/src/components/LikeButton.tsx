// Ilya Zeldner
"use client";

import { useState } from "react";

export default function LikeButton() {
  const [likes, setLikes] = useState(0);

  return (
    <button
      onClick={() => setLikes(likes + 1)}
      className="bg-pink-100 text-black p-2 rounded"
    >
      ❤️ {likes} Likes
    </button>
  );
}
