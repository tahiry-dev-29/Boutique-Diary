import { NextResponse } from "next/server";

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

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
      {
        headers: {
          "User-Agent": "Boutique-Diary-Ecommerce/1.0",
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
        { error: "Failed to fetch address from Nominatim" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
