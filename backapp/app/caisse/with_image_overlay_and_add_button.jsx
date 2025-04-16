import { useEffect, useState } from 'react';
import useCartStore from '../store/cart/cartstore';
import CategoryCarousel from './category';
export default function Caisseelements() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  
  const { addProduct } = useCartStore();

  // Cache products
  const cacheProducts = async (data) => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('api-cache'); // Changed to match next-pwa config
        const responseToCache = new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=86400', // 24 hours
          },
          status: 200,
          statusText: 'OK'
        });
  
        // Cache the API response
        await cache.put(window.location.origin + '/api/caisse', responseToCache);  
        // Verify the cache
        const cachedResponse = await cache.match('/api/caisse');
        if (cachedResponse) {
          const cachedData = await cachedResponse.json();
          console.log('Verified cached data:', cachedData);
        }
      } catch (error) {
        console.error('Caching error:', error);
      }
    }
  };

  // Load products from cache
  const loadCachedProducts = async () => {
    try {
      const cachedResponse = await caches.match('/api/caisse');
      if (cachedResponse) {
        const data = await cachedResponse.json();
        console.log('Loaded products from cache:', data);
        setProducts(data);
        setLoading(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading cached products:', error);
      return false;
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/caisse');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
      // Cache the fresh data
      await cacheProducts(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    // Online/offline event handlers
    const handleOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Initial online status
    setIsOnline(navigator.onLine);

    // Initialize products
    async function initializeProducts() {
      try {
        if (!navigator.onLine) {
          // Try to load from cache when offline
          const loadedFromCache = await loadCachedProducts();
          if (!loadedFromCache) {
            setError('No cached data available offline');
          }
        } else {
          // Fetch fresh data when online
          await fetchProducts();
        }
      } catch (error) {
        setError(error.message);
        // Try to load from cache as fallback
        await loadCachedProducts();
      } finally {
        setLoading(false);
      }
    }

    initializeProducts();

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="bg-white">
      {!isOnline && (
        <div className="bg-yellow-100 p-4 text-yellow-800 text-center">
          Mode hors ligne - Affichage des produits en cache
        </div>
      )}
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-4 lg:max-w-6xl lg:px-8">
        <h2 className="text-xl font-bold text-gray-900">Caisse</h2>
<CategoryCarousel/>
        <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div key={product._id} className="flex flex-col h-full">
              <div className="relative flex-grow">
                <div className="relative h-72 w-full overflow-hidden rounded-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="relative mt-4">
                  <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                </div>
                <div className="absolute inset-x-0 top-0 flex h-72 items-end justify-end overflow-hidden rounded-lg p-4">
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black opacity-50"
                  />
                  <p className="relative text-lg font-semibold text-white">${product.price}</p>
                </div>
              </div>
              <div className="mt-6">
                <button
                  className="w-full flex items-center justify-center rounded-md border border-transparent bg-gray-100 px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                  aria-label={`Add ${product.name} to bag`}
                  onClick={() => addProduct(product)}
                >
                  Add to bag<span className="sr-only">, {product.name}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}