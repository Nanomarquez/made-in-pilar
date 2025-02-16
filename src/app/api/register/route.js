import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req) {
  try {
    const { username } = await req.json();

    // Verificar si el usuario ya existe
    const userExist = await getDoc(doc(db, "users", username));
    if (userExist.exists()) {
      return new Response(JSON.stringify({ error: "El usuario ya existe" }), {
        status: 409,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error.message);
    console.error("Stack Trace:", error.stack);

    // Respuesta de error
    return new Response(
      JSON.stringify({ error: "Error al registrar usuario" }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
