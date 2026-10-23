import { redirect } from "next/navigation";

// ulaz u aplikaciju; zaštićeni layout dalje šalje na /login ako nema sesije
export default function Home() {
  redirect("/dashboard");
}
