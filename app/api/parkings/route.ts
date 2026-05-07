import { NextResponse } from 'next/server';

export async function GET() {
  const url = "https://data.agglo-melunvaldeseine.fr/api/explore/v2.1/catalog/datasets/stationnement-en-ouvrage-temps-reel/records?limit=20";

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 10 } 
    });

    if (!res.ok) throw new Error('API Melun injoignable');

    const data = await res.json();
    return NextResponse.json(data.results || []);

  } catch (error) {
    console.log("⚠️ Mode secours : API Melun hors ligne");
    
    // DONNÉES DE SECOURS (Vrais parkings de Melun, positions exactes)
    const fallbackData = [
      {
        nom: "Parking Gambetta",
        disponibilite: 42,
        etat: "OUVERT",
        geo_point_2d: { lat: 48.5391, lon: 2.6605 }
      },
      {
        nom: "Parking Porte de Paris",
        disponibilite: 0,
        etat: "COMPLET",
        geo_point_2d: { lat: 48.5422, lon: 2.6558 }
      },
      {
        nom: "Place Saint-Jean",
        disponibilite: 15,
        etat: "OUVERT",
        geo_point_2d: { lat: 48.5385, lon: 2.6588 }
      }
    ];

    return NextResponse.json(fallbackData);
  }
}