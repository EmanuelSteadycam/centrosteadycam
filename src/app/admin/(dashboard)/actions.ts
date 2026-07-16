"use server";

import { deleteSubscriberFromList } from "@/lib/brevo";

export async function deleteSubscriber(email: string): Promise<{ error: string | null }> {
  try {
    await deleteSubscriberFromList(email);
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Errore eliminazione" };
  }
}
