import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  let q;
  if (username) {
    q = query(
      collection(db, "reservations"),
      where("userId", "==", username),
      where("status", "==", "pending")
    );
  } else {
    q = query(
      collection(db, "reservations"),
      where('status',"==","pending")
    );
  }

  try {
    const snapshot = await getDocs(q);
    const reservations = snapshot.docs.map(reservation=>{
      console.log(reservation);
      return reservation.data();
    })
    console.log(reservations);
    console.log(snapshot.docs);
    const size = snapshot.size;

    return new Response(JSON.stringify(size), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
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
          "Access-Control-Allow-Methods": "GET, OPTIONS",
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
