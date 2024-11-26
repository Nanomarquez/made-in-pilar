import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  setDoc,
  doc,
} from "firebase/firestore";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const q = query(
      collection(db, "reservations"),
      where("date", "==", date),
      orderBy("from", "asc")
    );
    const snapshot = await getDocs(q);
    const reservations = snapshot.docs.map((doc) => {
      const data = doc.data();
      const id = doc.id;

      return { id, ...data };
    });

    return new Response(JSON.stringify(reservations), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error en GET:", error);
    return new Response(JSON.stringify({ error: "Error al obtener reservas" }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, date, from, to, status } = body;

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
      if (reservation.status === "rejected") return false;
      return (
        (newStart >= reservationStart && newStart < reservationEnd) || // Empieza dentro de un rango
        (newEnd > reservationStart && newEnd <= reservationEnd) || // Termina dentro de un rango
        (newStart <= reservationStart && newEnd >= reservationEnd) // Abarca todo el rango
      );
    });

    if (hasConflict) {
      return new Response(
        JSON.stringify({ error: "El horario solicitado ya está reservado." }),
        {
          status: 409,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // Crear reserva
    const docRef = await addDoc(collection(db, "reservations"), {
      userId,
      date,
      from,
      to,
      status,
    });

    return new Response(JSON.stringify({ id: docRef.id }), {
      status: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error en POST:", error);
    return new Response(JSON.stringify({ error: "Error al crear reserva" }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();
    const { status } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "No se ha proporcionado el ID de la reserva." }),
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    await setDoc(
      doc(db, "reservations", id),
      { status },
      { merge: true }
    );

    return new Response(JSON.stringify({ status }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error en PUT:", error);
    return new Response(
      JSON.stringify({ error: "Error al actualizar la reserva." }),
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// Helper para convertir tiempo "HH:mm" a minutos desde medianoche
function parseTime(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
