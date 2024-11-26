import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  const q = query(collection(db, "users"), where("username", "not-in", ["Admin"]));
  const snapshot = await getDocs(q);
  const users = snapshot.docs.map((doc) => {

    const id = doc.id;

    const createdAt = doc.data().createdAt;

    return {id,createdAt};
  });

  return NextResponse.json(users);
}
