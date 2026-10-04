import { redirect } from "next/navigation";

export default function Home() {
  // Yeh line screen render hone se pehle hi user ko admin par phenk degi
  redirect("/admin");

  return null; // Jab redirect ho raha ho toh kuch bhi screen par dikhane ki zaroorat nahi
}