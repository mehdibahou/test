"use client";
import { useEffect, useState } from 'react';
import Caisseelements from "./with_image_overlay_and_add_button";
import Cart from "./slide_over";
import Pop from "./popover";
import useCartStore from '../store/cart/cartstore';
import PWADebugger from './pwadebugger';

export default function Caisse() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const { products, setProducts } = useCartStore();

  useEffect(() => {
    // Vérifier si on est côté client
    if (typeof window !== 'undefined') {
      // Register service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => console.log('SW registered:', registration))
          .catch((error) => console.log('SW registration failed:', error));
      }

      // Initialize online status
      setIsOnline(navigator.onLine);

      // Handle online/offline status
      const handleOnlineStatus = () => setIsOnline(navigator.onLine);
      window.addEventListener('online', handleOnlineStatus);
      window.addEventListener('offline', handleOnlineStatus);

      // Handle PWA installation
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      });

      // Load cached products when offline
      if (!navigator.onLine) {
        caches.match('/api/caisse')
          .then(response => response?.json())
          .then(data => {
            if (data) setProducts(data);
          })
          .catch(error => console.error('Error loading cached products:', error));
      }

      return () => {
        window.removeEventListener('online', handleOnlineStatus);
        window.removeEventListener('offline', handleOnlineStatus);
      };
    }
  }, [setProducts]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  // Render différent pour le serveur
  if (typeof window === 'undefined') {
    return (
      <>
        <Pop />
        <Caisseelements />
      </>
    );
  }

  // Render côté client
  return (
    <>
      {!isOnline && (
        <div className="bg-yellow-100 p-4">
          Mode hors ligne - Certaines fonctionnalités peuvent être limitées
        </div>
      )}
      
      {isInstallable && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-lg shadow-lg"
        >
          Installer l'application
        </button>
      )}
      
      <Pop/>
      <Caisseelements />
      <PWADebugger />
    </>
  );
}