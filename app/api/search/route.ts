import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const plate = searchParams.get("plate")?.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (!plate) return NextResponse.json({ error: "Plaque manquante" }, { status: 400 });

  try {
    const client = await clientPromise;
    const db = client.db("melun-parking");
    
    // On cherche l'utilisateur par sa plaque
    const user = await db.collection("users").findOne({ plate: plate });

    if (!user) {
      return NextResponse.json({ found: false, message: "Véhicule non inscrit à Melun" });
    }

    return NextResponse.json({ 
      found: true, 
      name: user.name, 
      phone: user.phone 
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}