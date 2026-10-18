import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { error: vi.fn() }),
}));

const json = (body: unknown) => Response.json(body);
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

it("server set replaces the local mirror when sync is on", async () => {
  localStorage.setItem("favourites", '["old-1"]');
  fetchMock.mockResolvedValueOnce(json({ synced: true, ids: ["base1-4"] }));
  const { useFavourites } = await import("./favourites");
  const { result } = renderHook(() => useFavourites());
  await waitFor(() => expect([...result.current]).toEqual(["base1-4"]));
  expect(localStorage.getItem("favourites")).toBe('["base1-4"]');
});

it("pins optimistically and rolls back when the server refuses", async () => {
  fetchMock.mockResolvedValueOnce(json({ synced: true, ids: [] }));
  const { useFavourites, toggleFavourite } = await import("./favourites");
  const { result } = renderHook(() => useFavourites());
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

  let release: (res: Response) => void = () => {};
  fetchMock.mockReturnValueOnce(new Promise((r) => (release = r)));
  let done: Promise<void> = Promise.resolve();
  act(() => {
    done = toggleFavourite("base1-4");
  });
  expect(result.current.has("base1-4")).toBe(true);
  await act(async () => {
    release(new Response(null, { status: 500 }));
    await done;
  });
  expect(result.current.has("base1-4")).toBe(false);
});

it("keeps pins local without sync and makes no writes", async () => {
  fetchMock.mockResolvedValueOnce(json({ synced: false, ids: [] }));
  const { useFavourites, toggleFavourite } = await import("./favourites");
  const { toast } = await import("sonner");
  const { result } = renderHook(() => useFavourites());
  await waitFor(() => expect(toast).toHaveBeenCalledTimes(1));
  await act(() => toggleFavourite("base1-4"));
  expect(result.current.has("base1-4")).toBe(true);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem("favourites")).toBe('["base1-4"]');
});

it("keeps a pin made before the first load and still saves it", async () => {
  let release: (res: Response) => void = () => {};
  fetchMock.mockReturnValueOnce(new Promise((r) => (release = r)));
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
  const { useFavourites, toggleFavourite } = await import("./favourites");
  const { result } = renderHook(() => useFavourites());
  let done: Promise<void> = Promise.resolve();
  act(() => {
    done = toggleFavourite("base1-4");
  });
  await act(async () => {
    release(json({ synced: true, ids: ["base2-1"] }));
    await done;
  });
  expect([...result.current].sort()).toEqual(["base1-4", "base2-1"]);
  expect(fetchMock).toHaveBeenLastCalledWith(
    "/api/favourites",
    expect.objectContaining({ method: "POST" }),
  );
});
