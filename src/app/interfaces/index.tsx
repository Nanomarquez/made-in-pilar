export const statusMap: Record<Status, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  rejected: "Rechazado",
};

export interface ParsedRservations {
  start: Date;
  end: Date;
  title: string;
  status: "pending" | "confirmed" | "rejected";
  id: string;
}

export type User = {
  id: string;
  createdAt: string;
};

export type Reservation = {
  id: string;
  userId: string;
  date: string; // Format: "YYYY-MM-DD"
  from: string; // Format: "HH:mm"
  to: string; // Format: "HH:mm"
  status: "pending" | "confirmed" | "rejected";
};

export interface Time {
  seconds: number;
  nanoseconds: number;
}

export enum Status {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  REJECTED = "rejected",
}

export interface Reservations {
  from: Time;
  to: Time;
  id: string;
  status: Status;
  userId: string;
}
