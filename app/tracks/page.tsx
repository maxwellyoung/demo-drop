import { ClientTracksPage } from "./ClientTracksPage";

interface Track {
  slug: string;
  originalName: string;
  filename: string;
  title: string;
  artist: string;
  uploadedAt: string;
  size: number;
  type: string;
  reactions: {
    fire: number;
    cry: number;
    explode: number;
    broken: number;
  };
}

async function getLocalTracks(): Promise<Track[]> {
  try {
    // Fetch tracks from the local WAVs folder API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/tracks/local`, {
      cache: "no-store", // Always fetch fresh data
    });

    if (!response.ok) {
      console.error("Failed to fetch local tracks:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data.tracks || [];
  } catch (error) {
    console.error("Error fetching local tracks:", error);
    return [];
  }
}

export default async function TracksPage() {
  const tracks = await getLocalTracks();

  return <ClientTracksPage tracks={tracks} />;
}
