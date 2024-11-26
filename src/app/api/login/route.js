import { NextResponse } from "next/server";
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
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    console.log({ userDoc: userDoc.data() });

    console.log({ adminAuth });

    // Generar token personalizado
    const token = await adminAuth.createCustomToken(userDoc.id);

    console.log({ adminAuth });

    console.log({ token });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error al generar el token:", error);
    return NextResponse.json(
      { error: "Error al generar el token" },
      { status: 500 }
    );
  }
}
