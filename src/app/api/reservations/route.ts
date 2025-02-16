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
  deleteDoc,
} from "firebase/firestore";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); // Fecha en formato ISO string
    const usernameParam = searchParams.get("username"); // Fecha en formato ISO string

    if (!dateParam) {
      return new Response(
        JSON.stringify({ error: "Se requiere el parámetro 'date'." }),
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

    const date = new Date(dateParam);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1); // Inicio del mes
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999); // Fin del mes

    let q;
    
    if(usernameParam){
      q = query(
        collection(db, "reservations"),
        where('userId', "==", usernameParam),
        where("from", ">=", startOfMonth), // Inicia dentro del mes
        where("from", "<=", endOfMonth), // Termina dentro del mes
        orderBy("from", "asc") // Ordenar por fecha de inicio
      );
    }else{
      q = query(
        collection(db, "reservations"),
        where("from", ">=", startOfMonth), // Inicia dentro del mes
        where("from", "<=", endOfMonth), // Termina dentro del mes
        orderBy("from", "asc") // Ordenar por fecha de inicio
      );
    }

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
    const { userId, from, to, status } = body;

    const newStart = new Date(from);
    const newEnd = new Date(to);

    const reservationsSnapshot = await getDocs(
      query(collection(db, "reservations"))
    );

    // Validar conflictos
    const hasConflict = reservationsSnapshot.docs.some((doc) => {
      const reservation = doc.data();
      const reservationStart = reservation.from.toDate(); // Convierte Timestamp a Date
      const reservationEnd = reservation.to.toDate(); // Convierte Timestamp a Date
      
      // Imprimir para depuración
      console.log("New reservation start:", newStart);
      console.log("New reservation end:", newEnd);
      console.log("Existing reservation start:", reservationStart);
      console.log("Existing reservation end:", reservationEnd);
    
      if (reservation.status === "rejected") return false; // Ignorar reservas rechazadas
    
      // Verificar superposición de fechas
      return (
        (newStart >= reservationStart && newStart < reservationEnd) || // Empieza dentro del rango existente
        (newEnd > reservationStart && newEnd <= reservationEnd) || // Termina dentro del rango existente
        (newStart <= reservationStart && newEnd >= reservationEnd) // Abarca todo el rango existente
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
      from: newStart,
      to: newEnd,
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

    if (status === "delete") {
      await deleteDoc(doc(db, "reservations", id));
      return new Response(
        JSON.stringify({ message: `Reserva con ID ${id} eliminada.` }),
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }else{
      await setDoc(
        doc(db, "reservations", id),
        { status },
        { merge: true }
      );
    }


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