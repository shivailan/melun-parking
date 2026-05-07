"use client";

import { Camera, Car, Loader2, MapPin, Newspaper, Send } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import Tesseract from 'tesseract.js';

// --- Types pour notre application ---
interface Parking {
  name: string;
  places: number;
  total: number;
  type: "Payant" | "Zone Bleue" | "Gratuit";
  status: "disponible" | "quasi-plein" | "complet";
}

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  category: string;
}

export default function MelunSmartCity() {
  const [activeTab, setActiveTab] = useState<'map' | 'scan' | 'news'>('map');
  const [loading, setLoading] = useState<boolean>(false);
  const [plate, setPlate] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState<string>("");

  // Données typées pour Melun
  const parkings: Parking[] = [
    { name: "Parking Gambetta", places: 12, total: 150, type: "Payant", status: "disponible" },
    { name: "Parking Porte de Paris", places: 0, total: 200, type: "Payant", status: "complet" },
    { name: "Place Saint-Jean", places: 3, total: 30, type: "Zone Bleue", status: "quasi-plein" },
    { name: "Gare de Melun (Dépose minute)", places: 8, total: 20, type: "Gratuit", status: "disponible" },
  ];

  const news: NewsItem[] = [
    { id: 1, title: "Travaux Pont de Fer", summary: "Circulation alternée dès lundi.", category: "Travaux" },
    { id: 2, title: "Escale à Melun", summary: "Le programme des festivités est sorti !", category: "Événement" },
  ];

  // Logique du Scanner avec typage
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatusMsg("Lecture de la plaque par l'IA...");
    
    try {
      const result = await Tesseract.recognize(file, 'eng');
      const detectedText = result.data.text.replace(/[^A-Z0-9-]/g, "").toUpperCase();
      setPlate(detectedText);
      setStatusMsg(detectedText ? "Plaque identifiée !" : "Plaque illisible, réessayez.");
    } catch (error) {
      console.error(error);
      setStatusMsg("Erreur technique de lecture.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen pb-24 shadow-2xl font-sans text-slate-900">
      {/* Header Dynamique */}
      <header className="bg-indigo-600 text-white p-6 rounded-b-[2rem] shadow-lg mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black tracking-tight">MELUN PARK</h1>
            <p className="text-indigo-100 text-xs">Vivre la ville plus simplement</p>
          </div>
          <div className="bg-indigo-500 p-2 rounded-full">
            <Car size={20} />
          </div>
        </div>
      </header>

      <main className="px-5">
        {/* SECTION CARTE & PLACES */}
        {activeTab === 'map' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MapPin size={18} className="text-indigo-600" /> Parkings à proximité
            </h2>
            {parkings.map((p, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-slate-800">{p.name}</h3>
                  <p className="text-xs text-slate-400">{p.type} • {p.total} places</p>
                </div>
                <div className="text-right">
                  <span className={`text-xl font-black ${p.places === 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {p.places}
                  </span>
                  <p className="text-[10px] uppercase font-bold text-slate-400">libres</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION SIGNALEMENT (SCAN) */}
        {activeTab === 'scan' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold">Un véhicule gêne ?</h2>
              <p className="text-sm text-slate-500">Scannez la plaque pour envoyer un SMS d'alerte au propriétaire enregistré.</p>
            </div>

            <div className="relative group">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-indigo-300 rounded-3xl bg-indigo-50/50 hover:bg-indigo-50 transition-colors cursor-pointer">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {loading ? (
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-12 h-12 text-indigo-600 mb-3" />
                      <p className="text-sm font-medium text-indigo-600">Scanner maintenant</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={loading} />
              </label>
            </div>

            {plate && (
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-indigo-100 text-center animate-in zoom-in-95">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Résultat du scan</span>
                <div className="text-3xl font-mono font-black py-3 text-slate-800 tracking-tighter">
                  {plate}
                </div>
                <button 
                  onClick={() => alert(`Notification envoyée pour : ${plate}`)}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                  <Send size={18} /> Prévenir le conducteur
                </button>
              </div>
            )}
            <p className="text-center text-xs text-slate-400 font-medium">{statusMsg}</p>
          </div>
        )}

        {/* SECTION ACTUS */}
        {activeTab === 'news' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Newspaper size={18} className="text-indigo-600" /> Melun Infos
            </h2>
            {news.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <span className="text-[10px] px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-bold uppercase">
                  {item.category}
                </span>
                <h3 className="font-bold mt-2">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{item.summary}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Navigation Mobile Tab Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/80 backdrop-blur-md border border-white shadow-2xl rounded-3xl flex justify-around items-center p-3">
        <button onClick={() => setActiveTab('map')} className={`p-3 rounded-2xl transition-all ${activeTab === 'map' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
          <MapPin size={24} />
        </button>
        <button onClick={() => setActiveTab('scan')} className={`p-4 rounded-2xl transition-all ${activeTab === 'scan' ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg' : 'text-slate-400'}`}>
          <Camera size={28} />
        </button>
        <button onClick={() => setActiveTab('news')} className={`p-3 rounded-2xl transition-all ${activeTab === 'news' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
          <Newspaper size={24} />
        </button>
      </nav>
    </div>
  );
}