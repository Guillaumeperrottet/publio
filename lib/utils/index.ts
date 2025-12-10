// Utilitaires de formatage et helpers
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes avec gestion des conflits
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formater un montant en CHF
 */
export function formatCurrency(
  amount: number,
  currency: string = "CHF"
): string {
  return new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Formater une date
 */
export function formatDate(
  date: Date | string,
  format: "short" | "long" = "short"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (format === "long") {
    return new Intl.DateTimeFormat("fr-CH", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(dateObj);
  }

  return new Intl.DateTimeFormat("fr-CH", {
    dateStyle: "short",
  }).format(dateObj);
}

/**
 * Formater une taille de fichier
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Générer un ID anonyme pour les offres
 */
export function generateAnonymousId(): string {
  const num = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");
  return `#${num}`;
}

/**
 * Vérifier si une deadline est passée
 */
export function isDeadlinePassed(deadline: Date | string): boolean {
  const deadlineDate =
    typeof deadline === "string" ? new Date(deadline) : deadline;
  return deadlineDate < new Date();
}

/**
 * Calculer le nombre de jours restants
 */
export function daysUntilDeadline(deadline: Date | string): number {
  const deadlineDate =
    typeof deadline === "string" ? new Date(deadline) : deadline;
  const now = new Date();
  const diff = deadlineDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Sleep utility (pour les tests)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
