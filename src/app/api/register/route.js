import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import bcrypt from "bcrypt";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

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

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Registrar el nuevo usuario
    await setDoc(doc(db, "users", username), {
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    });

    const userDoc = await getDoc(doc(db, "users", username));
    const token = await adminAuth.createCustomToken(userDoc.id);

    // Respuesta exitosa con el token
    return new Response(JSON.stringify({ token }), {
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
