// Ilya Zeldner
"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const TABLE_NAME = "Waitlist2026"; // Supabase Table Name

// Protection Schema (Using Regex to avoid the 'email' deprecation warning)
const EmailSchema = z
  .string()
  .min(1, "Email is required")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format");

// Add a new student to the waitlist
export async function addEmail(formData: FormData): Promise<void> {
  const rawEmail = formData.get("email") as string;

  // Zod Validation (The Firewall)
  const validated = EmailSchema.safeParse(rawEmail);

  if (!validated.success) {
    console.error("❌ Validation Failed:", validated.error.issues[0].message);
    return;
  }

  // Database Insert (The Frankfurt Connection)
  const { error } = await supabase
    .from(TABLE_NAME)
    .insert([{ email: validated.data }]);

  if (error) {
    // Handle the "Unique" error (Postgres code 23505)
    if (error.code === "23505") {
      console.error("❌ Error: This student is already on the list!");
    } else {
      console.error("❌ Supabase Error:", error.message);
    }
    return;
  }

  console.log("✅ Success: Added", validated.data);

  // Refresh the UI
  revalidatePath("/");
}

// Remove a student from the waitlist

export async function deleteEmail(id: number): Promise<void> {
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

  if (error) {
    console.error("❌ Delete Error:", error.message);
    return;
  }

  revalidatePath("/"); // Refresh the UI
}
