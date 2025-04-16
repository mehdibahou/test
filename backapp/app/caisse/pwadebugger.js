"use client";
import { useEffect, useState } from 'react';

const PWADebugger = () => {
  const [debugInfo, setDebugInfo] = useState({
    online: navigator.onLine,
    serviceWorker: '❓ Checking...',
    cacheContents: [],
    localStorage: {},
    lastSync: null,
    pendingActions: 0,
    expanded: false
  });

  const checkServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        setDebugInfo(prev => ({
          ...prev,
          serviceWorker: registration.active ? '✅ Active' : '❌ Not Active'
        }));
      }
    } catch (error) {
      setDebugInfo(prev => ({
        ...prev,
        serviceWorker: `❌ Error: ${error.message}`
      }));
    }
  };

  const checkCache = async () => {
    try {
      const keys = await caches.keys();
      const cacheContents = [];
      
      for (const key of keys) {
        const cache = await caches.open(key);
        const requests = await cache.keys();
        cacheContents.push({
          name: key,
          items: requests.map(req => req.url)
        });
      }

      setDebugInfo(prev => ({ ...prev, cacheContents }));
    } catch (error) {
      console.error('Cache check error:', error);
    }
  };

  const checkLocalStorage = () => {
    try {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        items[key] = localStorage.getItem(key);
      }
      setDebugInfo(prev => ({ ...prev, localStorage: items }));
    } catch (error) {
      console.error('LocalStorage check error:', error);
    }
  };

  useEffect(() => {
    const updateOnlineStatus = () => {
      setDebugInfo(prev => ({
        ...prev,
        online: navigator.onLine,
        lastSync: new Date().toLocaleTimeString()
      }));
    };

    // Initial checks
    checkServiceWorker();
    checkCache();
    checkLocalStorage();

    // Event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Check every 5 seconds
    const interval = setInterval(() => {
      checkCache();
      checkLocalStorage();
    }, 5000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">PWA Debugger</h3>
        <button 
          onClick={() => setDebugInfo(prev => ({ ...prev, expanded: !prev.expanded }))}
          className="bg-gray-200 px-2 rounded"
        >
          {debugInfo.expanded ? '▼' : '▲'}
        </button>
      </div>

      <div className={`space-y-2 ${debugInfo.expanded ? '' : 'hidden'}`}>
        {/* Status en ligne */}
        <div className="flex items-center space-x-2">
          <span>Status:</span>
          <span className={debugInfo.online ? 'text-green-500' : 'text-red-500'}>
            ● {debugInfo.online ? 'En ligne' : 'Hors ligne'}
          </span>
        </div>

        {/* Service Worker */}
        <div>
          <span>Service Worker: {debugInfo.serviceWorker}</span>
        </div>

        {/* Cache */}
        <div>
          <h4 className="font-semibold">Cache:</h4>
          {debugInfo.cacheContents.map((cache, i) => (
            <details key={i} className="ml-2">
              <summary>{cache.name} ({cache.items.length} items)</summary>
              <ul className="ml-4 text-sm">
                {cache.items.slice(0, 5).map((url, j) => (
                  <li key={j} className="truncate">{url}</li>
                ))}
                {cache.items.length > 5 && <li>... et {cache.items.length - 5} autres</li>}
              </ul>
            </details>
          ))}
        </div>

        {/* LocalStorage */}
        <div>
          <h4 className="font-semibold">LocalStorage:</h4>
          <div className="ml-2 text-sm">
            {Object.entries(debugInfo.localStorage).map(([key, value]) => (
              <div key={key} className="truncate">
                {key}: {typeof value === 'string' ? value.slice(0, 50) : value}
              </div>
            ))}
          </div>
        </div>

        {/* Actions de debug */}
        <div className="space-x-2 pt-2">
          <button 
            onClick={checkCache}
            className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
          >
            Refresh Cache
          </button>
          <button 
            onClick={() => {
              localStorage.clear();
              checkLocalStorage();
            }}
            className="bg-red-500 text-white px-2 py-1 rounded text-sm"
          >
            Clear Storage
          </button>
          <button 
            onClick={() => {
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                  registrations.forEach((registration) => {
                    registration.unregister();
                  });
                });
              }
            }}
            className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
          >
            Reset SW
          </button>
        </div>

        <div className="text-xs text-gray-500">
          Dernière mise à jour: {debugInfo.lastSync}
        </div>
      </div>
    </div>
  );
};

export default PWADebugger;