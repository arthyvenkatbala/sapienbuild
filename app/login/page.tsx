import { redirect } from "next/navigation";

// Deprecated — the welcome/sign-in screen now lives at the root route.
export default function LoginPage() {
  redirect("/");
}
