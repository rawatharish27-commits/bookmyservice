import { useState, useEffect, useCallback, useRef } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface GeoLocation {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  city: string | null;
  permissionState: PermissionState | 'unknown';
  isSpoofed: boolean;
  accuracy: number | null;
}

interface CachedPosition {
  latitude: number;
  longitude: number;
  city: string | null;
  timestamp: number;
}

interface PositionBufferEntry {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface PermissionRequestResult {
  needsManualEnable: boolean;
  instruction: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const CACHE_KEY = 'bys_geo_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const POSITION_BUFFER_SIZE = 5;
const DRIFT_DISTANCE_METERS = 500;
const DRIFT_AGE_THRESHOLD_MS = 2000; // 2 seconds
const SPOOF_DISTANCE_METERS = 100_000; // 100 km
const SPOOF_TIME_THRESHOLD_MS = 60_000; // 60 seconds
const IP_GEOLOCATION_URL = 'https://ipapi.co/json/';

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Haversine distance between two lat/lng points in meters.
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6_371_000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Median of an array of numbers.
 */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Try to read a cached position from sessionStorage.
 */
function readCache(): CachedPosition | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedPosition = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

/**
 * Write a position to sessionStorage cache.
 */
function writeCache(pos: Omit<CachedPosition, 'timestamp'>): void {
  try {
    const entry: CachedPosition = { ...pos, timestamp: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // sessionStorage unavailable — ignore
  }
}

/**
 * Reverse-geocode lat/lng to a city name via Nominatim.
 */
async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'BookYourService/1.0 (https://bookyourservice.co.in)',
        },
      },
    );
    if (res.ok) {
      const data = await res.json();
      return data.address?.city || data.address?.town || data.address?.village || data.address?.county || null;
    }
  } catch {
    // Reverse geocoding failed — that's OK
  }
  return null;
}

/**
 * IP-based geolocation fallback via ipapi.co.
 */
async function ipGeolocationFallback(): Promise<{
  latitude: number;
  longitude: number;
  city: string | null;
} | null> {
  try {
    const res = await fetch(IP_GEOLOCATION_URL);
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city || data.region || null,
        };
      }
    }
  } catch {
    // IP geolocation failed
  }
  return null;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocation>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
    city: null,
    permissionState: 'unknown',
    isSpoofed: false,
    accuracy: null,
  });

  const mountedRef = useRef(true);

  // GPS drift protection: buffer of last N positions
  const positionBufferRef = useRef<PositionBufferEntry[]>([]);

  // Spoof detection tracking
  const lastPositionTimeRef = useRef<number | null>(null);
  const lastPositionCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const isSpoofedRef = useRef(false);

  // ── Permission state tracking ──────────────────────────────────────────────

  const updatePermissionState = useCallback(async (): Promise<PermissionState | 'unknown'> => {
    if (!navigator.permissions) return 'unknown';
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      return status.state as PermissionState;
    } catch {
      return 'unknown';
    }
  }, []);

  // ── Drift protection ───────────────────────────────────────────────────────

  const applyDriftProtection = useCallback(
    (
      latitude: number,
      longitude: number,
      accuracy: number,
      positionAgeMs: number,
    ): { latitude: number; longitude: number; accuracy: number } => {
      const buffer = positionBufferRef.current;

      // Always add the new position to the buffer
      buffer.push({ latitude, longitude, accuracy, timestamp: Date.now() });
      if (buffer.length > POSITION_BUFFER_SIZE) {
        buffer.splice(0, buffer.length - POSITION_BUFFER_SIZE);
      }

      // Need at least 2 positions to compare
      if (buffer.length < 2) {
        return { latitude, longitude, accuracy };
      }

      const prev = buffer[buffer.length - 2];
      const distance = haversineDistance(prev.latitude, prev.longitude, latitude, longitude);

      // If the new position is more than 500m away AND position is < 2s old → drift spike
      if (distance > DRIFT_DISTANCE_METERS && positionAgeMs < DRIFT_AGE_THRESHOLD_MS) {
        // Use median of last 3 positions (or however many we have up to 3)
        const recent = buffer.slice(-3);
        const medianLat = median(recent.map((p) => p.latitude));
        const medianLng = median(recent.map((p) => p.longitude));
        const medianAcc = median(recent.map((p) => p.accuracy));
        return { latitude: medianLat, longitude: medianLng, accuracy: medianAcc };
      }

      return { latitude, longitude, accuracy };
    },
    [],
  );

  // ── Spoof detection ────────────────────────────────────────────────────────

  const checkSpoofing = useCallback(
    (latitude: number, longitude: number): boolean => {
      const now = Date.now();
      const lastTime = lastPositionTimeRef.current;
      const lastCoords = lastPositionCoordsRef.current;

      if (lastTime !== null && lastCoords !== null) {
        const distance = haversineDistance(lastCoords.lat, lastCoords.lng, latitude, longitude);
        const elapsed = now - lastTime;

        if (distance > SPOOF_DISTANCE_METERS && elapsed < SPOOF_TIME_THRESHOLD_MS) {
          isSpoofedRef.current = true;
          return true;
        }
      }

      // Update tracking refs
      lastPositionTimeRef.current = now;
      lastPositionCoordsRef.current = { lat: latitude, lng: longitude };

      // Reset spoof flag if this position looks legitimate
      isSpoofedRef.current = false;
      return false;
    },
    [],
  );

  // ── Core: process a successful geolocation position ────────────────────────

  const processPosition = useCallback(
    async (
      latitude: number,
      longitude: number,
      accuracy: number,
      positionAgeMs: number = 0,
    ) => {
      // 1. Spoof detection
      const spoofed = checkSpoofing(latitude, longitude);

      // 2. GPS drift protection
      const smoothed = applyDriftProtection(latitude, longitude, accuracy, positionAgeMs);

      // 3. Reverse geocode
      const city = await reverseGeocode(smoothed.latitude, smoothed.longitude);

      // 4. Update cache
      writeCache({ latitude: smoothed.latitude, longitude: smoothed.longitude, city });

      // 5. Update state
      if (mountedRef.current) {
        const permState = await updatePermissionState();
        setLocation({
          latitude: smoothed.latitude,
          longitude: smoothed.longitude,
          error: null,
          loading: false,
          city,
          permissionState: permState,
          isSpoofed: spoofed,
          accuracy: smoothed.accuracy,
        });
      }
    },
    [applyDriftProtection, checkSpoofing, updatePermissionState],
  );

  // ── Fallback: IP-based geolocation ─────────────────────────────────────────

  const tryIpFallback = useCallback(
    async (reason: string) => {
      if (!mountedRef.current) return;

      const ipResult = await ipGeolocationFallback();
      if (ipResult && mountedRef.current) {
        writeCache({ latitude: ipResult.latitude, longitude: ipResult.longitude, city: ipResult.city });
        setLocation({
          latitude: ipResult.latitude,
          longitude: ipResult.longitude,
          error: `GPS unavailable (${reason}); using IP-based location (less accurate)`,
          loading: false,
          city: ipResult.city,
          permissionState: 'denied',
          isSpoofed: false,
          accuracy: null, // IP geolocation has no accuracy metric
        });
      } else if (mountedRef.current) {
        setLocation((prev) => ({
          ...prev,
          error: `Geolocation failed (${reason}) and IP fallback also failed`,
          loading: false,
        }));
      }
    },
    [],
  );

  // ── Initialization ─────────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;

    const initGeo = async () => {
      // 1. Check cached position — return immediately
      const cached = readCache();
      if (cached && mountedRef.current) {
        setLocation({
          latitude: cached.latitude,
          longitude: cached.longitude,
          error: null,
          loading: false,
          city: cached.city,
          permissionState: 'unknown',
          isSpoofed: false,
          accuracy: null,
        });
      }

      // 2. Check geolocation support
      if (!navigator.geolocation) {
        if (mountedRef.current) {
          setLocation((prev) => ({
            ...prev,
            error: 'Geolocation is not supported by your browser',
            loading: false,
          }));
        }
        await tryIpFallback('not supported');
        return;
      }

      // 3. Check permission state
      const permState = await updatePermissionState();
      if (mountedRef.current) {
        setLocation((prev) => ({ ...prev, permissionState: permState }));
      }

      // 4. Fetch fresh position (even if we had cache)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (!mountedRef.current) return;
          await processPosition(
            position.coords.latitude,
            position.coords.longitude,
            position.coords.accuracy,
            0, // getCurrentPosition doesn't expose position age directly
          );
        },
        async (err) => {
          if (!mountedRef.current) return;
          // If we already have cached data, don't overwrite with error
          // but still try IP fallback for more accuracy
          const permStateAfter = await updatePermissionState();
          if (mountedRef.current) {
            setLocation((prev) => ({
              ...prev,
              permissionState: permStateAfter,
              loading: false,
              // Keep existing lat/lng if we had cache
              error: prev.latitude ? null : err.message,
            }));
          }
          await tryIpFallback(err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    };

    initGeo();

    return () => {
      mountedRef.current = false;
    };
  }, [processPosition, tryIpFallback, updatePermissionState]);

  // ── refreshLocation ────────────────────────────────────────────────────────

  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) {
      tryIpFallback('not supported');
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (!mountedRef.current) return;
        await processPosition(
          position.coords.latitude,
          position.coords.longitude,
          position.coords.accuracy,
          0,
        );
      },
      async (err) => {
        if (!mountedRef.current) return;
        const permState = await updatePermissionState();
        setLocation((prev) => ({
          ...prev,
          permissionState: permState,
          loading: false,
          error: prev.latitude ? null : err.message,
        }));
        await tryIpFallback(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, [processPosition, tryIpFallback, updatePermissionState]);

  // ── requestPermission ──────────────────────────────────────────────────────

  const requestPermission = useCallback(async (): Promise<PermissionRequestResult> => {
    // Check current permission state
    if (navigator.permissions) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        if (status.state === 'granted') {
          if (mountedRef.current) {
            setLocation((prev) => ({ ...prev, permissionState: 'granted' }));
          }
          return { needsManualEnable: false, instruction: 'Location permission already granted' };
        }

        if (status.state === 'denied') {
          if (mountedRef.current) {
            setLocation((prev) => ({ ...prev, permissionState: 'denied' }));
          }
          return {
            needsManualEnable: true,
            instruction: 'Please enable location in your browser settings',
          };
        }

        // 'prompt' — try requesting by calling getCurrentPosition which triggers the browser prompt
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              if (mountedRef.current) {
                await processPosition(
                  position.coords.latitude,
                  position.coords.longitude,
                  position.coords.accuracy,
                  0,
                );
              }
              resolve({ needsManualEnable: false, instruction: 'Location permission granted' });
            },
            async (err) => {
              if (mountedRef.current) {
                const permState = await updatePermissionState();
                setLocation((prev) => ({ ...prev, permissionState: permState }));
              }
              if (err.code === err.PERMISSION_DENIED) {
                resolve({
                  needsManualEnable: true,
                  instruction: 'Please enable location in your browser settings',
                });
              } else {
                resolve({
                  needsManualEnable: false,
                  instruction: `Location request failed: ${err.message}`,
                });
              }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
          );
        });
      } catch {
        // permissions.query failed — fall through
      }
    }

    // Fallback: just try getCurrentPosition
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          needsManualEnable: true,
          instruction: 'Geolocation is not supported by your browser',
        });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (mountedRef.current) {
            await processPosition(
              position.coords.latitude,
              position.coords.longitude,
              position.coords.accuracy,
              0,
            );
          }
          resolve({ needsManualEnable: false, instruction: 'Location permission granted' });
        },
        (err) => {
          resolve({
            needsManualEnable: err.code === err.PERMISSION_DENIED,
            instruction:
              err.code === err.PERMISSION_DENIED
                ? 'Please enable location in your browser settings'
                : `Location request failed: ${err.message}`,
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }, [processPosition, updatePermissionState]);

  return {
    ...location,
    refreshLocation,
    requestPermission,
  };
}
