import type { Metadata } from "next";
import { Typography } from "@/components/ui/typography";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in · Ash's Card Album" };

export default function LoginPage() {
  return (
    <main className="binder-desk flex flex-1 items-center justify-center p-4">
      <div className="binder-paper flex w-full max-w-sm flex-col gap-4 rounded-md p-6 shadow-md">
        <Typography variant="h2" as="h1">
          Ash&apos;s Card Album
        </Typography>
        <Typography variant="caption" as="p">
          Enter the album password to continue.
        </Typography>
        <LoginForm />
      </div>
    </main>
  );
}
