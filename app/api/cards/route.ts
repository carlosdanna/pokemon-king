import type { NextRequest } from "next/server";
import { getAllCards, getCard } from "@/lib/collection";
import { DEFAULT_SEARCH, filterCards, rankCards } from "@/lib/search";

/**
 * The cards for a few ids, for the homepage pins (D-041), or up to 20 best
 * matches (D-048) for the command palette with `q` (D-047); the proxy checks the session.
 */
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q")?.trim().slice(0, 100);
  if (q)
    return Response.json(
      rankCards(
        filterCards(getAllCards(), { ...DEFAULT_SEARCH, q, owned: false }),
        q,
      )
        .slice(0, 20)
        .map(({ id, name, number, setName }) => ({
          id,
          name,
          number,
          set: setName,
        })),
    );
  const ids = (params.get("ids") ?? "")
    .split(",")
    .filter(Boolean)
    .slice(0, 100);
  return Response.json(ids.flatMap((id) => getCard(id)?.card ?? []));
}
