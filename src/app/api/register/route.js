import { NextResponse } from "next/server";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import bcrypt from "bcrypt";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req) {
  const { username, password } = await req.json();
  try {
    const userExist = await getDoc(doc(db, "users", username));
    if (userExist.exists()) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 409 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await setDoc(doc(db, "users", username), {
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    });
    const userDoc = await getDoc(doc(db, "users", username));

    const token = await adminAuth.createCustomToken(userDoc.id);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error al registrar usuario:", error.message);
    console.error("Stack Trace:", error.stack);
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}
