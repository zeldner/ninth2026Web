// Ilya Zeldner
"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
const TABLE_NAME = "Waitlist2026"; // Ensure this matches your actual table name

export async function addEmail(formData: FormData) {
  try {
    const email = formData.get("email") as string; // Must match the input name
    if (!email) throw new Error("Email is missing from form");
    const { error } = await supabase.from(TABLE_NAME).insert([{ email }]);
    if (error) throw error;
    revalidatePath("/"); // Refresh the UI
  } catch (err) {
    console.error("ADD ACTION ERROR:", err);
  }
}

export async function incrementLikes(id: string) {
  // simple increment logic
  const { data } = await supabase
    .from(TABLE_NAME)
    .select("likes") // Select only the likes column
    .eq("id", id)
    .single(); // Get a single record

  if (data) {
    // If the record exists
    await supabase
      .from(TABLE_NAME)
      .update({ likes: (data.likes || 0) + 1 }) // Increment likes
      .eq("id", id); // Update the specific record
  }

  revalidatePath("/"); // Refresh the UI
}

export async function deleteEmail(formData: FormData) {
  try {
    const id = formData.get("studentId") as string; // Must match the input name
    if (!id) throw new Error("ID is missing from form");
    const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id); // Delete by ID
    if (error) throw error;
    revalidatePath("/");
  } catch (err) {
    console.error("DELETE ACTION ERROR:", err);
  }
}
