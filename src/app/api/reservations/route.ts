import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, setDoc, doc } from "firebase/firestore";

// Mapa de estados en inglés a español

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  const q = query(collection(db, "reservations"), where("date", "==", date), orderBy("from", "asc"));
  const snapshot = await getDocs(q);
  const reservations = snapshot.docs.map((doc) => {
    const data = doc.data();
    const id = doc.id;

    return {id,...data};
  });

  return NextResponse.json(reservations);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, date, from, to , status } = body;

  const reservationsSnapshot = await getDocs(
    query(collection(db, "reservations"), where("date", "==", date))
  );

  // Validar conflictos
  const hasConflict = reservationsSnapshot.docs.some((doc) => {
    const reservation = doc.data();
    const reservationStart = parseTime(reservation.from);
    const reservationEnd = parseTime(reservation.to);
    const newStart = parseTime(from);
    const newEnd = parseTime(to);
    if(reservation.status === "rejected") return false;
    return (
      (newStart >= reservationStart && newStart < reservationEnd) || // Empieza dentro de un rango
      (newEnd > reservationStart && newEnd <= reservationEnd) || // Termina dentro de un rango
      (newStart <= reservationStart && newEnd >= reservationEnd) // Abarca todo el rango
    );
  });

  if (hasConflict) {
    return NextResponse.json(
      { error: "El horario solicitado ya está reservado." },
      { status: 409 }
    );
  }

  //crear id unico
  const docRef = await addDoc(collection(db, "reservations"), {
    userId,
    date,
    from,
    to,
    status,
  });

  return NextResponse.json({ id: docRef.id });
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const body = await request.json();
  const { status } = body;
 console.log("test");
  if(!id) {
    return NextResponse.json(
      { error: "No se ha proporcionado el ID de la reserva." },
      { status: 400 }
    );
  }

  try {
    await setDoc(
      doc(db, "reservations", id),
      {
        status
      },
      { merge: true }
    );
  
    return NextResponse.json({ status });
    
  } catch (err) {
      console.error(err);
      return NextResponse.json(
        { error: "Error al actualizar la reserva." },
        { status: 400 }
      );
  }

}

// Helper para convertir tiempo "HH:mm" a minutos desde medianoche
function parseTime(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
