"use client";

import { CircleHelp } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { openShortcuts } from "./keyboard-shortcuts";

export function ShortcutsButton() {
  return (
    <button
      type="button"
      onClick={openShortcuts}
      aria-label="Keyboard shortcuts"
      aria-keyshortcuts="?"
      title="Keyboard shortcuts (?)"
      className={buttonVariants({ variant: "ghost", size: "icon-lg" })}
    >
      <CircleHelp aria-hidden />
    </button>
  );
}
