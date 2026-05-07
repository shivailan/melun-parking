"use client";

import { AlertCircle, Camera, CheckCircle2, Loader2, MapPin, Phone, Search, User } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Remplace tes imports dynamiques par cette syntaxe plus précise
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { 
  ssr: false 
}) as any; // Le "as any" dit à TS : "Fais-moi confiance, je sais ce que je fais"

const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false }) as any;
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false }) as any;
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false }) as any;

export default function MelunFinalApp() {
  const [activeTab, setActiveTab] = useState('map');
  const [parkings, setParkings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // État inscription
  const [userProfile, setUserProfile] = useState({ name: '', phone: '', plate: '' });
  const [isRegistered, setIsRegistered] = useState(false);

  // ÉTATS POUR LA RECHERCHE
  const [searchPlate, setSearchPlate] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Récupérer le profil local s'il existe
    const savedUser = localStorage.getItem('melun_user');
    if (savedUser) {
      setUserProfile(JSON.parse(savedUser));
      setIsRegistered(true);
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    async function fetchParkings() {
      try {
        const res = await fetch('/api/parkings');
        const data = await res.json();
        if (Array.isArray(data)) setParkings(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchParkings();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile),
      });
      if (res.ok) {
        setIsRegistered(true);
        localStorage.setItem('melun_user', JSON.stringify(userProfile));
      }
    } catch (err) { alert("Erreur d'enregistrement"); }
    finally { setLoading(false); }
  };

  // FONCTION DE RECHERCHE MANUELLE
  const handleSearch = async () => {
    if (!searchPlate) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const res = await fetch(`/api/search?plate=${searchPlate}`);
      const data = await res.json();
      setSearchResult(data);
    } catch (err) {
      alert("Erreur lors de la recherche");
    } finally {
      setSearching(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <style jsx global>{`
        .leaflet-container { height: 100% !important; width: 100% !important; z-index: 1; }
      `}</style>
      
      <header className="bg-blue-700 text-white p-4 shadow-md flex justify-between items-center z-50">
        <h1 className="font-black text-xl tracking-tight uppercase italic">Melun Connect</h1>
        <div className="bg-emerald-500 px-3 py-1 rounded-full text-[10px] font-bold animate-pulse text-white">RÉSEAU ACTIF</div>
      </header>

      <main className="flex-1 relative overflow-y-auto pb-24">
        
        {activeTab === 'map' && (
          <div className="h-full flex flex-col">
             <div className="h-1/2 w-full z-10 border-b">
              <MapContainer center={[48.5404, 2.6595]} zoom={14}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {parkings.map((p, i) => p.geo_point_2d && (
                  <Marker key={i} position={[p.geo_point_2d.lat, p.geo_point_2d.lon]}>
                    <Popup><b>{p.nom}</b><br/>{p.disponibilite} places</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto bg-white h-1/2">
                <h2 className="font-bold flex items-center gap-2"><MapPin size={18} className="text-blue-600"/> Parkings Live</h2>
                <div className="grid grid-cols-1 gap-3">
                    {parkings.map((p, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-2xl border flex justify-between items-center transition hover:border-blue-300">
                            <span className="font-bold text-sm text-slate-700">{p.nom}</span>
                            <span className="text-xl font-black text-blue-600">{p.disponibilite}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'scan' && (
          <div className="p-6 space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Vérifier une plaque</h2>
            
            {/* RECHERCHE MANUELLE */}
            <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-2 tracking-widest">Saisie manuelle</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="AA-123-BB" 
                    className="flex-1 p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 font-mono uppercase text-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    value={searchPlate}
                    onChange={(e) => setSearchPlate(e.target.value)}
                  />
                  <button 
                    onClick={handleSearch}
                    disabled={searching}
                    className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition active:scale-95 disabled:opacity-50"
                  >
                    {searching ? <Loader2 className="animate-spin" /> : <Search />}
                  </button>
                </div>
              </div>
            </div>

            {/* RÉSULTAT DE LA RECHERCHE */}
            {searchResult && (
              <div className={`p-6 rounded-[2.5rem] border animate-in zoom-in duration-300 ${searchResult.found ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                {searchResult.found ? (
                  <div className="space-y-4 text-center">
                    <div className="mx-auto bg-emerald-500 text-white w-12 h-12 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-900 text-lg">Propriétaire trouvé</h3>
                      <p className="text-sm text-emerald-700 italic">Ce véhicule est enregistré à Melun</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-inner space-y-1">
                      <p className="text-xs uppercase font-bold text-slate-400 tracking-tighter text-left">Contact direct</p>
                      <p className="text-left font-bold text-slate-700">{searchResult.name}</p>
                      <a href={`tel:${searchResult.phone}`} className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-xl mt-2 font-black tracking-wide">
                        <Phone size={18} /> {searchResult.phone}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3 py-4">
                    <AlertCircle size={40} className="mx-auto text-rose-500" />
                    <p className="text-rose-900 font-bold leading-tight">{searchResult.message}</p>
                    <p className="text-xs text-rose-600 px-4">Le propriétaire n'est pas encore inscrit sur Melun Connect.</p>
                  </div>
                )}
              </div>
            )}

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-slate-50 px-4 text-slate-400">Ou utiliser la caméra</span></div>
            </div>

            {/* BOUTON CAMERA IA */}
            <label className="flex flex-col items-center justify-center w-full h-44 border-4 border-dashed border-slate-200 rounded-[3rem] bg-white hover:bg-blue-50 transition cursor-pointer group shadow-sm">
              <Camera size={48} className="text-slate-300 mb-2 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Scanner la plaque</span>
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-6 space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-black text-slate-800">Mon Compte</h2>
            
            {!isRegistered ? (
              <form onSubmit={handleRegister} className="bg-white p-6 rounded-[2.5rem] shadow-sm border space-y-4">
                <p className="text-sm text-slate-500 leading-relaxed">Inscrivez votre véhicule pour que les voisins puissent vous prévenir au lieu d'appeler la fourrière.</p>
                <div>
                  <label className="text-[10px] font-bold uppercase ml-2 text-slate-400">Nom complet</label>
                  <input required type="text" placeholder="Ex: Marc de Melun" className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                    onChange={(e)=>setUserProfile({...userProfile, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase ml-2 text-slate-400">Téléphone</label>
                  <input required type="tel" placeholder="06 .. .. .. .." className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e)=>setUserProfile({...userProfile, phone: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase ml-2 text-slate-400">Plaque</label>
                  <input required type="text" placeholder="AA-123-BB" className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 uppercase font-mono text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e)=>setUserProfile({...userProfile, plate: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-200 active:scale-95 transition-all text-lg">
                  {loading ? <Loader2 className="animate-spin mx-auto"/> : "Valider mon profil"}
                </button>
              </form>
            ) : (
              <div className="bg-emerald-50 p-8 rounded-[3rem] border border-emerald-100 text-center space-y-6">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-900 uppercase tracking-tight">Profil Protégé ✅</h3>
                  <p className="text-sm text-emerald-600 italic">Vous êtes joignable par la communauté.</p>
                </div>
                <div className="text-left bg-white/80 backdrop-blur p-5 rounded-2xl space-y-3 shadow-inner">
                  <p className="text-xs font-bold text-slate-400 uppercase">Détails enregistrés</p>
                  <p className="text-sm text-slate-700 flex justify-between border-b pb-2 border-slate-100"><b>Nom :</b> <span>{userProfile.name}</span></p>
                  <p className="text-sm text-slate-700 flex justify-between"><b>Plaque :</b> <span className="font-mono bg-slate-100 px-2 rounded uppercase">{userProfile.plate}</span></p>
                </div>
                <button onClick={() => {setIsRegistered(false); localStorage.removeItem('melun_user');}} className="text-xs text-slate-400 font-bold uppercase tracking-widest hover:text-rose-500 transition">Supprimer mon profil</button>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="bg-white/80 backdrop-blur-md border-t p-4 flex justify-around items-center pb-8 shadow-2xl z-50 fixed bottom-0 w-full">
        <button onClick={() => setActiveTab('map')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'map' ? 'text-blue-700 scale-110' : 'text-slate-400'}`}>
          <MapPin size={24} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Carte</span>
        </button>
        <button onClick={() => setActiveTab('scan')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'scan' ? 'text-blue-700 scale-110' : 'text-slate-400'}`}>
          <Search size={24} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Signalement</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-blue-700 scale-110' : 'text-slate-400'}`}>
          <User size={24} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Moi</span>
        </button>
      </nav>
    </div>
  );
}