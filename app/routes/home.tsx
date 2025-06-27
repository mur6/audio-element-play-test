import type { Route } from "./+types/home";
import { useState } from "react";
import { Welcome } from "../welcome/welcome";
import { GuideAudio } from "../components/GuideAudio";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const [currentPlaylist, setCurrentPlaylist] = useState(0);
  
  const testPlaylistOfList: string[][] = [
    ["/audio/high_beep.mp3", "/audio/low_beep.mp3"],
    ["/audio/low_beep.mp3", "/audio/high_beep.mp3", "/audio/high_beep.mp3"]
  ];

  return (
    <div>
      <div style={{ padding: "20px", border: "1px solid #ccc", margin: "20px" }}>
        <h2>GuideAudio Test</h2>
        <p>Current Playlist: {currentPlaylist}</p>
        <p>Tracks in playlist: {testPlaylistOfList[currentPlaylist]?.length || 0}</p>
        <p>Audio will play automatically with 3 second intervals</p>
        <button 
          onClick={() => setCurrentPlaylist(0)}
          style={{ margin: "5px", padding: "10px" }}
        >
          Playlist 0 (High → Low)
        </button>
        <button 
          onClick={() => setCurrentPlaylist(1)}
          style={{ margin: "5px", padding: "10px" }}
        >
          Playlist 1 (Low → High → High)
        </button>
      </div>
      <GuideAudio 
        playlistOfList={testPlaylistOfList}
        currentPlaylist={currentPlaylist}
        intervalSeconds={3}
      />
    </div>
  );
}
