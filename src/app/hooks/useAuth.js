'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get('token');
      
      if (!token && pathname !== '/') {
        router.replace('/');
        setIsAuthenticated(false);
      } else if (token) {
        try {
          const decoded = jwt_decode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            Cookies.remove('token');
            router.replace('/');
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true);
            if (pathname === '/') {
              router.replace('/options');
            }
          }
        } catch (error) {
          console.error('Token validation error:', error);
          Cookies.remove('token');
          router.replace('/');
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  return { isAuthenticated, isLoading };
}