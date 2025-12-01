// /app/api/spotify/token/route.ts
import {NextRequest, NextResponse} from "next/server";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export async function GET(req: NextRequest) {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return NextResponse.json(
      {error: "Spotify credentials are not set"},
      {status: 500}
    );
  }

  try {
    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
        body: new URLSearchParams({grant_type: "client_credentials"}),
      }
    );

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text();
      console.error("Spotify token fetch failed:", text);
      return NextResponse.json(
        {error: "Failed to fetch Spotify token"},
        {status: tokenResponse.status}
      );
    }

    const data = await tokenResponse.json();
    return NextResponse.json(data); // { access_token, token_type, expires_in }
  } catch (err) {
    console.error("Spotify token error:", err);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
