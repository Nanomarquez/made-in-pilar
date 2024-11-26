import { adminAuth } from "@/lib/firebaseAdmin";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import bcrypt from "bcrypt";

export async function POST(req) {
  const { username, password } = await req.json();

  try {
    // Buscar al usuario en la base de datos
    const userDoc = await getDoc(doc(db, "users", username));
    if (!userDoc.exists()) {
      return new Response(
        JSON.stringify({ error: "Usuario no encontrado" }),
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    const userData = userDoc.data();

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ error: "Contraseña incorrecta" }),
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // Generar token personalizado
    const token = await adminAuth.createCustomToken(userDoc.id);

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error al generar el token:", error);
    return new Response(
      JSON.stringify({ error: "Error al generar el token" }),
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
