import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  const reservationsSnapshot = await getDocs(
    query(collection(db, "reservations"), where("date", "==", date), where("status", "not-in", ["rejected"]))
  );

  const reservedSlots = reservationsSnapshot.docs.map((doc) => doc.data());
  const allSlots = generateTimeSlots("12:00", "26:00", 60)

  const availableSlots = allSlots.filter((slot) => {
    return !reservedSlots.some(
      (res) =>
        (slot.from >= res.from && slot.from < res.to) ||
        (slot.to > res.from && slot.to <= res.to) ||
        (slot.from <= res.from && slot.to >= res.to) 
    );
  });



  const updatedSlots = availableSlots.map(slot => {
    if (slot.from === "25:00") {
      return { ...slot, from: "" }; // O puedes usar null
    }
    return slot;
  });
  
  return NextResponse.json(updatedSlots);
}

// Generador de horarios disponibles
function generateTimeSlots(start: string, end: string, step: number) {
  const slots = [];
  let current = parseTime(start);
  const endTime = parseTime(end); // Manejo de medianoche como 24:00

  while (current + step <= endTime) {
    const from = formatTime(current);
    const to = formatTime(current + step);
    slots.push({ from, to });
    current += step;
  }
  return slots;
}

function parseTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}
