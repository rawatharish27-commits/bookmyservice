import { useState, useEffect, useCallback, useRef } from 'react';

interface GeoLocation {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  city: string | null;
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocation>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
    city: null,
  });

  // N18 fix — track mounted state for cleanup
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const initGeo = () => {
      if (!navigator.geolocation) {
        if (mountedRef.current) {
          setLocation(prev => ({
            ...prev,
            error: 'Geolocation is not supported by your browser',
            loading: false,
          }));
        }
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let city: string | null = null;

          // Try reverse geocoding using free Nominatim API
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              { headers: { 'Accept-Language': 'en', 'User-Agent': 'BookYourService/1.0 (https://bookyourservice.co.in)' } }
            );
            if (res.ok) {
              const data = await res.json();
              city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || null;
            }
          } catch {
            // Reverse geocoding failed, that's OK
          }

          if (mountedRef.current) {
            setLocation({
              latitude,
              longitude,
              error: null,
              loading: false,
              city,
            });
          }
        },
        (err) => {
          if (mountedRef.current) {
            setLocation(prev => ({
              ...prev,
              error: err.message,
              loading: false,
            }));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    };

    initGeo();
    return () => { mountedRef.current = false; };
  }, []);

  // N19 fix — wrap refreshLocation in useCallback, N20 fix — add geolocation check
  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }));
      return;
    }
    setLocation(prev => ({ ...prev, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let city: string | null = null;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'BookYourService/1.0 (https://bookyourservice.co.in)' } }
          );
          if (res.ok) {
            const data = await res.json();
            city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || null;
          }
        } catch {
          // Reverse geocoding failed, that's OK
        }
        if (mountedRef.current) {
          setLocation({ latitude, longitude, error: null, loading: false, city });
        }
      },
      (err) => {
        if (mountedRef.current) {
          setLocation(prev => ({ ...prev, error: err.message, loading: false }));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return { ...location, refreshLocation };
}
