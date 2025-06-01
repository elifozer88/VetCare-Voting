"use client";

import React, { useEffect, useState } from "react";
import freighterApi from "@stellar/freighter-api";
import { Wallet, Heart, Star, Award, Users, MapPin } from "lucide-react";

interface Veterinarian {
  id: number;
  name: string;
  clinic: string;
  location: string;
  specialty: string;
  votes: number;
  totalDonations: number;
}

export default function VeterinarianVoting() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [votingLoading, setVotingLoading] = useState<number | null>(null);

  const veterinarians: Veterinarian[] = [
    {
      id: 1,
      name: "Dr. Mehmet Öztürk",
      clinic: "Sevgi Veteriner Kliniği",
      location: "Konak, İzmir",
      specialty: "Küçük Hayvan Hekimliği",
      votes: 245,
      totalDonations: 1250.50
    },
    {
      id: 2,
      name: "Dr. Ayşe Demir",
      clinic: "Hayvan Dostları Kliniği",
      location: "Bornova, İzmir",
      specialty: "Egzotik Hayvan Hekimliği",
      votes: 189,
      totalDonations: 980.25
    },
    {
      id: 3,
      name: "Dr. Can Yılmaz",
      clinic: "Mutlu Patiler Veteriner",
      location: "Karşıyaka, İzmir",
      specialty: "Cerrahi & Ortopedi",
      votes: 312,
      totalDonations: 1567.75
    }
  ];

  useEffect(() => {
    const checkFreighter = async () => {
      try {
        const connected = await freighterApi.isConnected();
        if (connected) {
          const { publicKey } = await freighterApi.getUserInfo();
setPublicKey(publicKey);

        }
      } catch (error) {
        console.error("Freighter bağlantı kontrolü hatası:", error);
      }
    };
    checkFreighter();
  }, []);

  const handleConnectWallet = async () => {
    setLoading(true);
    try {
      await freighterApi.setAllowed();
      const { publicKey } = await freighterApi.getUserInfo();
setPublicKey(publicKey);


    } catch (error) {
      console.error("Cüzdan bağlantı hatası:", error);
      alert("Cüzdan bağlanırken hata oluştu. Freighter cüzdanının kurulu olduğundan emin olun.");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (veterinarianId: number, veterinarianName: string) => {
    if (!publicKey) {
      alert("Önce cüzdanınızı bağlayın!");
      return;
    }

    setVotingLoading(veterinarianId);
    
    try {
      // Burada Soroban smart contract çağrısı yapılacak
      // Şimdilik simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`${veterinarianName} için oyunuz başarıyla kaydedildi ve bağış yapıldı!`);
    } catch (error) {
      console.error("Oylama hatası:", error);
      alert("Oylama sırasında hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setVotingLoading(null);
    }
  };

  const formatXLM = (amount: number) => {
    return `${amount.toFixed(2)} XLM`;
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="header">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 animate-fade-in-up">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">VetCare Voting</h1>
                <p className="text-slate-400 text-sm">İzmir Veterinerlerini Destekle</p>
              </div>
            </div>
            
            {publicKey ? (
              <div className="wallet-connected animate-slide-down">
                <Wallet className="h-5 w-5 mr-2" />
                <span className="wallet-address">{truncateAddress(publicKey)}</span>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={loading}
                className="btn-primary focus-ring"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    <span>Bağlanıyor...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="h-5 w-5 mr-2" />
                    <span>Cüzdan Bağla</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Info Section */}
        <div className="card mb-8">
          <div className="text-center">
            <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Veteriner Hekim Memnuniyet Oylaması</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              İzmir'deki veteriner hekimlere oy vererek onları destekleyin. Her oy ile birlikte 
              veteriner hekime 10 XLM bağış yapılır. Toplum olarak değerli veterinerlerimizi destekleyelim!
            </p>
          </div>
        </div>

        {/* Voting Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {veterinarians.map((vet) => (
            <div key={vet.id} className="vote-card">
              <div className="text-center mb-6">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{vet.name}</h3>
                <p className="text-blue-400 font-medium mb-2">{vet.clinic}</p>
                <div className="flex items-center justify-center text-slate-400 text-sm mb-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {vet.location}
                </div>
                <p className="text-slate-300 text-sm">{vet.specialty}</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-slate-300">Toplam Oy</span>
                  </div>
                  <span className="text-white font-semibold">{vet.votes}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-slate-300">Toplam Bağış</span>
                  </div>
                  <span className="text-green-400 font-semibold">{formatXLM(vet.totalDonations)}</span>
                </div>
              </div>

              <button
                onClick={() => handleVote(vet.id, vet.name)}
                disabled={!publicKey || votingLoading === vet.id}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  !publicKey 
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {votingLoading === vet.id ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Oy Veriliyor...
                  </div>
                ) : (
                  <>
                    <Heart className="inline h-4 w-4 mr-2" />
                    Oy Ver & Bağış Yap (10 XLM)
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Nasıl Çalışır?</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-300">
            <div>
              <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold">1</span>
              </div>
              <p>Freighter cüzdanınızı bağlayın</p>
            </div>
            <div>
              <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold">2</span>
              </div>
              <p>Beğendiğiniz veterinere oy verin</p>
            </div>
            <div>
              <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold">3</span>
              </div>
              <p>Otomatik 10 XLM bağış yapılır</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}