"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteMail } from "./actions";

type Mail = {
  id: number;
  slug: string;
  title: string;
  modified: string | null;
  date: string;
  featured_image_url: string | null;
  newsletter_sent_at: string | null;
};

export default function MailRow({ mail }: { mail: Mail }) {
  const [isPending, startTransition] = useTransition();
  const [deleted, setDeleted] = useState(false);

  if (deleted) return null;

  const handleDelete = () => {
    if (!confirm(`Eliminare "${mail.title}"?`)) return;
    startTransition(async () => {
      const result = await deleteMail(mail.id);
      if (!result.error) setDeleted(true);
      else alert(result.error);
    });
  };

  return (
    <div className="px-5 py-3 flex items-center gap-4">
      <div className="w-14 h-10 rounded overflow-hidden shrink-0 bg-gray-100">
        {mail.featured_image_url ? (
          <img src={mail.featured_image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{mail.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {mail.newsletter_sent_at
            ? `Inviata il ${new Date(mail.newsletter_sent_at).toLocaleDateString("it-IT")}`
            : `Modificata il ${new Date(mail.modified ?? mail.date).toLocaleDateString("it-IT")}`}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full ${
            mail.newsletter_sent_at ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {mail.newsletter_sent_at ? "Inviata" : "Bozza"}
        </span>
        <Link
          href={`/admin/mail-inviate/${mail.id}`}
          className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 px-2 py-1 rounded transition-colors"
        >
          Modifica
        </Link>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-300 px-2 py-1 rounded transition-colors disabled:opacity-40"
        >
          Elimina
        </button>
      </div>
    </div>
  );
}
