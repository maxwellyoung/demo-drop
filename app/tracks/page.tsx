import { ClientTracksPage } from "./ClientTracksPage";
import pb from "@/lib/pocketbase";
import { RecordModel } from "pocketbase";

async function getPocketBaseTracks(): Promise<RecordModel[]> {
  try {
    const records = await pb.collection("tracks").getFullList({
      sort: "-created",
    });
    return records;
  } catch (error) {
    console.error("Error fetching tracks from PocketBase:", error);
    return [];
  }
}

export default async function TracksPage() {
  const tracks = await getPocketBaseTracks();

  return <ClientTracksPage tracks={tracks} />;
}
