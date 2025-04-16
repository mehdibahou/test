"use client";
import React from "react";
import {
  ChevronRight,
  PlusCircle,
  ClipboardList,
  Trophy,
  History,
  LineChart,
  Database,
  List,
} from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Dashboard() {
  const cards = [
    {
      title: "Nouveau Cheval",
      description: "Enregistrer un nouveau cheval ",
      icon: (
        <PlusCircle className="w-8 h-8 text-[#1B4D3E] group-hover:scale-110 transition-transform duration-300" />
      ),
      path: "/options/newhorse",
      borderColor: "border-emerald-200",
      gradient: "from-emerald-50 to-white",
    },
    {
      title: "Suivi médical",
      description: "Effectuer et enregistrer les consultaions des chevaux",
      icon: (
        <ClipboardList className="w-8 h-8 text-[#1B4D3E] group-hover:scale-110 transition-transform duration-300" />
      ),
      path: "/options/choix",
      borderColor: "border-emerald-200",
      gradient: "from-emerald-50 to-white",
    },
    {
      title: "Liste des Chevaux",
      description: "Consulter et gérer tous les chevaux",
      icon: (
        <List className="w-8 h-8 text-[#1B4D3E] group-hover:scale-110 transition-transform duration-300" />
      ),
      path: "/options/horses",
      borderColor: "border-emerald-200",
      gradient: "from-emerald-50 to-white",
    },
    {
      title: "Performance",
      description: "Saisir les résultats et les temps des courses",
      icon: (
        <Trophy className="w-8 h-8 text-[#DC2626] group-hover:scale-110 transition-transform duration-300" />
      ),
      path: "/options/performance",
      borderColor: "border-red-200",
      gradient: "from-red-50 to-white",
    },
    {
      title: "Palmarès",
      description: "Consulter l'historique des performances",
      icon: (
        <Database className="w-8 h-8 text-[#1B4D3E] group-hover:scale-110 transition-transform duration-300" />
      ),
      path: "/options/palmares",
      borderColor: "border-emerald-200",
      gradient: "from-emerald-50 to-white",
    },
    {
      title: "Historique des Consultations",
      description: "Consulter les résultats des consultations précédents",
      icon: (
        <History className="w-8 h-8 text-[#1B4D3E] group-hover:scale-110 transition-transform duration-300" />
      ),
      path: "/options/doc",
      borderColor: "border-emerald-200",
      gradient: "from-emerald-50 to-white",
    },
    {
      title: "Tableau de Bord",
      description: "Aperçu et statistiques",
      icon: (
        <LineChart className="w-8 h-8 text-[#1B4D3E] group-hover:scale-110 transition-transform duration-300" />
      ),
      path: "/options/dashboard",
      borderColor: "border-emerald-200",
      gradient: "from-emerald-50 to-white",
    },
  ];

  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.replace("/options");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className=" mx-10 px-6 py-7">
        {/* Enhanced Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card) => (
            <a
              key={card.path}
              href={card.path}
              className="group relative block"
            >
              <div
                className={`
                relative overflow-hidden rounded-2xl border-2 
                bg-gradient-to-br ${card.gradient}
                transition-all duration-500 
                shadow-sm hover:shadow-xl
                border-opacity-50 hover:border-opacity-100 ${card.borderColor}
                transform hover:-translate-y-1
              `}
              >
                <div className="p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      {/* Enhanced Icon Container */}
                      <div
                        className="p-3 rounded-xl bg-white shadow-md ring-1 ring-black/5 inline-block
                                    group-hover:shadow-lg group-hover:ring-black/10 transition-all duration-300"
                      >
                        {card.icon}
                      </div>

                      {/* Enhanced Card Content */}
                      <h2
                        className="text-2xl font-semibold text-gray-800 mt-6 
                                   group-hover:text-[#1B4D3E] transition-colors duration-300"
                      >
                        {card.title}
                      </h2>
                      <p className="text-gray-600 mt-2 leading-relaxed text-sm">
                        {card.description}
                      </p>
                    </div>

                    {/* Enhanced Arrow Animation */}
                    <ChevronRight
                      className="w-6 h-6 text-gray-400 
                                           group-hover:text-[#1B4D3E] group-hover:translate-x-1 
                                           transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Enhanced Hover Effect */}
                <div
                  className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r 
                              from-transparent via-[#1B4D3E] to-transparent opacity-0 
                              group-hover:opacity-100 transition-all duration-500"
                ></div>

                {/* New Corner Decoration */}
                <div
                  className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-black/5 to-transparent 
                              opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-bl-3xl"
                ></div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
