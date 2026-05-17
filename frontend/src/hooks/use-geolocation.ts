import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const initGeo = () => {
      if (!navigator.geolocation) {
        setLocation(prev => ({
          ...prev,
          error: 'Geolocation is not supported by your browser',
          loading: false,
        }));
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
              { headers: { 'Accept-Language': 'en' } }
            );
            if (res.ok) {
              const data = await res.json();
              city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || null;
            }
          } catch {
            // Reverse geocoding failed, that's OK
          }

          setLocation({
            latitude,
            longitude,
            error: null,
            loading: false,
            city,
          });
        },
        (err) => {
          setLocation(prev => ({
            ...prev,
            error: err.message,
            loading: false,
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // Cache for 1 minute
        }
      );
    };

    queueMicrotask(initGeo);
  }, []);

  const refreshLocation = () => {
    setLocation(prev => ({ ...prev, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let city: string | null = null;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || null;
          }
        } catch {
          // Reverse geocoding failed, that's OK
        }
        setLocation({ latitude, longitude, error: null, loading: false, city });
      },
      (err) => {
        setLocation(prev => ({ ...prev, error: err.message, loading: false }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return { ...location, refreshLocation };
}
