import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";
import { getCard } from "@/lib/collection";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const KEY = "favourites";
// The Vercel Marketplace integration injects the KV_* names (D-041).
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const unauthorized = (request: NextRequest) =>
  !verifySession(request.cookies.get(SESSION_COOKIE)?.value);

export async function GET(request: NextRequest) {
  if (unauthorized(request))
    return Response.json({ error: "Not signed in" }, { status: 401 });
  if (!redis) return Response.json({ synced: false, ids: [] });
  return Response.json({ synced: true, ids: await redis.smembers(KEY) });
}

async function change(request: NextRequest, add: boolean) {
  if (unauthorized(request))
    return Response.json({ error: "Not signed in" }, { status: 401 });
  if (!redis)
    return Response.json({ error: "Sync is not set up" }, { status: 503 });
  const body: unknown = await request.json().catch(() => null);
  const id =
    body && typeof body === "object" && "id" in body ? body.id : undefined;
  if (typeof id !== "string" || !getCard(id))
    return Response.json({ error: "Unknown card" }, { status: 400 });
  await (add ? redis.sadd(KEY, id) : redis.srem(KEY, id));
  return new Response(null, { status: 204 });
}

export const POST = (request: NextRequest) => change(request, true);
export const DELETE = (request: NextRequest) => change(request, false);
