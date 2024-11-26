import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date"); // Ejemplo: "2024-11"
  const id = searchParams.get("id"); // Ejemplo: "2024-11"

  if (!date) {
    return new Response(
      JSON.stringify({ error: "No se ha proporcionado una fecha válida." }),
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

  const [year, month] = date.split("-").map(Number);

  if (!year || !month) {
    return new Response(
      JSON.stringify({
        error: "El formato de fecha no es válido. Debe ser 'YYYY-MM'.",
      }),
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

  // Calcular rango de fechas del mes
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0) // último día del mes
    .toISOString()
    .split("T")[0]; // Formato "YYYY-MM-DD"

  let q;
  if (id) {
    q = query(
      collection(db, "reservations"),
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      where("userId", "==", id),
      where("status", "==", "pending"),
      orderBy("date", "asc"),
      orderBy("from", "asc")
    );
  } else {
    q = query(
      collection(db, "reservations"),
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "asc"),
      orderBy("from", "asc")
    );
  }

  try {
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
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Error al obtener las reservas." }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}
