"use client";
import { useState, useTransition } from "react";
import { setWaitlistEnabled } from "@/app/admin/(dashboard)/eventi/[slug]/actions";

export default function WaitlistToggle({ enabled, eventSlug }: { enabled: boolean; eventSlug: string }) {
  const [active, setActive] = useState(enabled);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = !active;
    setActive(next);
    startTransition(() => setWaitlistEnabled(eventSlug, next));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm px-5 py-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-700">Lista d&apos;attesa</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Rimuove la scelta della data — il form diventa iscrizione alla lista d&apos;attesa
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={isPending}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
          active ? "bg-orange-400" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            active ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
