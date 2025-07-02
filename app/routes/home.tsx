import type { Route } from "./+types/home";
import { useState, useEffect, useRef } from "react";
import { AutoPlayAudio } from "../components/AutoPlayAudio";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

// interface FirstPageProps {
//   onClick?: () => void;
// }
// function FirstPage({ onClick }: FirstPageProps) {
//   return (
//     <div>
//       <div
//         style={{ padding: "20px", border: "1px solid #ccc", margin: "20px" }}
//       >
//         <button
//           onClick={onClick}
//           style={{ padding: "10px 20px", fontSize: "16px" }}
//         >
//           Start beep
//         </button>
//       </div>
//     </div>
//   );
// }
const playlist = ["/audio/low_beep.mp3", "/audio/high_beep.mp3"];

export default function Home() {
  const milliseconds = 15000; // 5 seconds
  const [played, setPlayed] = useState(false);
  const audioRef = useRef<{ play: (playlist: string[]) => void }>(null);

  // const handlePlayPlaylist = (playlist: string[]) => {
  //   audioRef.current?.play(playlist);
  // };

  //一度再生が完了してから、5秒後に、再度ビープを再生
  useEffect(() => {
    if (!played) return;
    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play(playlist);
      }
    }, milliseconds);

    return () => clearTimeout(timer);
  }, [played]);

  return (
    <>
      <div>
        <h1>Welcome to React Router!</h1>
        <p>This is a simple audio playback example.</p>
        <p>5秒後にビープ音が再生されます。</p>
        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.play(playlist);
            }
            setPlayed(true);
          }}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Play Beep
        </button>
        <AutoPlayAudio ref={audioRef} />
      </div>
    </>
  );
}
