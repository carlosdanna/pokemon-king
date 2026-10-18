"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  checkPassword,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
} from "@/lib/session";

export async function login(_: string | null, form: FormData) {
  const password = form.get("password");
  if (typeof password !== "string" || !checkPassword(password))
    return "Wrong password. Try again.";
  (await cookies()).set(SESSION_COOKIE, signSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect("/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
