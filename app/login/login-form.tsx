"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { login } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="flex w-full flex-col gap-3">
      <Typography as="label" variant="small" htmlFor="password">
        Password
      </Typography>
      <Input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        required
        aria-invalid={!!error}
        aria-describedby="login-error"
        className="h-10"
      />
      {/* Always mounted, so screen readers announce the error when it appears. */}
      <div id="login-error" role="alert" className="min-h-5">
        {error && (
          <Typography as="p" variant="small" color="destructive">
            {error}
          </Typography>
        )}
      </div>
      <Button type="submit" size="lg" disabled={pending}>
        <Typography as="span" variant="small" color="inherit">
          {pending ? "Checking…" : "Login"}
        </Typography>
      </Button>
    </form>
  );
}
