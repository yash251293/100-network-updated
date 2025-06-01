import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to explore page as the main page
  redirect("/auth/login")

  return null
}
