// app/api/register/route.ts
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("melun-parking"); // Nom de ta base
    const body = await req.json();

    // On vérifie que les données sont là
    if (!body.plate || !body.phone) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const result = await db.collection("users").insertOne({
      name: body.name,
      phone: body.phone,
      plate: body.plate.toUpperCase().replace(/[^A-Z0-9]/g, ""),
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}