import { NextResponse } from "next/server";


const geocodeCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; 

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  delay = 1000, 
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status >= 400 && response.status < 500) {
        return response;
      }
      if (response.ok) {
        return response;
      }
      
      console.warn(`[Geocode] Attempt ${i + 1} failed: ${response.status}`);
    } catch (error) {
      console.warn(`[Geocode] Attempt ${i + 1} network error:`, error);
    }
    
    if (i < retries - 1) {
      await wait(delay * Math.pow(2, i)); 
    }
  }
  throw new Error("All retry attempts failed");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon") || searchParams.get("lng");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Latitude and longitude are required" },
      { status: 400 },
    );
  }

  
  const roundedLat = parseFloat(lat).toFixed(4);
  const roundedLon = parseFloat(lon).toFixed(4);
  const cacheKey = `${roundedLat},${roundedLon}`;

  
  const cached = geocodeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const response = await fetchWithRetry(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${roundedLat}&lon=${roundedLon}`,
      {
        headers: {
          
          "User-Agent":
            "Boutique-Diary-Ecommerce/1.0 (https://boutique-diary.mg; contact@boutique-diary.mg)",
          "Accept-Language": "fr",
        },
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { error: "Too many requests. Please wait a moment." },
          { status: 429 },
        );
      }
      return NextResponse.json(
        { error: `Nominatim error: ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();

    
    geocodeCache.set(cacheKey, { data, timestamp: Date.now() });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Geocode] Final error:", error);
    return NextResponse.json(
      { error: "Service temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
}
