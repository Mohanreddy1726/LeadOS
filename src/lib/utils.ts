import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizePhone(phone: string = "") {
  return phone.replace(/\D/g, "").replace(/^0+/, "").replace(/^91+/, "");
}
