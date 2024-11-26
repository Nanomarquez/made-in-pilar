import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  let q;
  if(id){
    q = query(
      collection(db, "reservations"),
      where("userId", "==", id),
      where("status", "==", "pending"),
      orderBy("date", "asc")
    );
  }else{
    q = query(
      collection(db, "reservations"),
      where("status", "==", "pending"),
      orderBy("date", "asc")
    );
  }

  try {
    const snapshot = await getDocs(q);
    const size = snapshot.size;
    
    return NextResponse.json(size);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error al obtener las reservas." },
      { status: 500 }
    );
  }
}
