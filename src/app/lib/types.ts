export type Reservation = {
  id: string;
  userId: string;
  date: string; // Format: "YYYY-MM-DD"
  from: string; // Format: "HH:mm"
  to: string;   // Format: "HH:mm"
  status: "pending" | "confirmed" | "rejected";
};