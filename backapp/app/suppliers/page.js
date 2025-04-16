"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function SuppliersList() {
  const [isOnline, setIsOnline] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Cache suppliers
  const cacheSuppliers = async (data) => {
    if ("caches" in window) {
      try {
        const cache = await caches.open("suppliers-cache");
        const responseToCache = new Response(JSON.stringify(data));
        await cache.put(
          window.location.origin + "/api/suppliers",
          responseToCache
        );
      } catch (error) {
        console.error("Caching error:", error);
      }
    }
  };

  const loadCachedSuppliers = async () => {
    try {
      const cachedResponse = await caches.match("/api/suppliers");
      if (cachedResponse) {
        const data = await cachedResponse.json();
        setSuppliers(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error loading cached suppliers:", error);
      return false;
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers");
      if (!response.ok) throw new Error("Failed to fetch suppliers");
      const data = await response.json();
      setSuppliers(data);
      await cacheSuppliers(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleOnlineStatus = () => setIsOnline(navigator.onLine);
      window.addEventListener("online", handleOnlineStatus);
      window.addEventListener("offline", handleOnlineStatus);
      setIsOnline(navigator.onLine);

      async function initializeSuppliers() {
        try {
          if (!navigator.onLine) {
            const loadedFromCache = await loadCachedSuppliers();
            if (!loadedFromCache) setError("No cached data available offline");
          } else {
            await fetchSuppliers();
          }
        } catch (error) {
          setError(error.message);
          await loadCachedSuppliers();
        } finally {
          setLoading(false);
        }
      }

      initializeSuppliers();

      return () => {
        window.removeEventListener("online", handleOnlineStatus);
        window.removeEventListener("offline", handleOnlineStatus);
      };
    }
  }, []);

  const handleSupplierClick = (supplierId) => {
    router.push(`/marketplace/${supplierId}`);
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (typeof window === "undefined") return null;

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Loading suppliers...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    );

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Our Suppliers</h1>

        {!isOnline && (
          <div className="bg-yellow-100 p-4 mb-8 rounded-lg">
            Offline Mode - Some features may be limited
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-8">
              No suppliers found
            </p>
          ) : (
            filteredSuppliers.map((supplier) => (
              <Card
                key={supplier._id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleSupplierClick(supplier._id)}
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={supplier.image}
                    alt={supplier.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold mb-2">
                    {supplier.name}
                  </h2>
                  {supplier.description && (
                    <p className="text-gray-600 line-clamp-2">
                      {supplier.description}
                    </p>
                  )}
                  {supplier.contactInfo && (
                    <p className="text-sm text-gray-500 mt-2">
                      {supplier.contactInfo}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
