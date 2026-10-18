import type { NextRequest } from "next/server";
import { getCard } from "@/lib/collection";

/** The cards for a few ids, for the homepage pins (D-041); the proxy checks the session. */
export function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .filter(Boolean)
    .slice(0, 100);
  return Response.json(ids.flatMap((id) => getCard(id)?.card ?? []));
}
