import type { Route } from "./+types/home";
import { useState, useEffect, useRef } from "react";
import { AutoPlayAudio } from "../components/AutoPlayAudio";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

interface FirstPageProps {
  onClick?: () => void;
}
function FirstPage({ onClick }: FirstPageProps) {
  return (
    <div>
      <div
        style={{ padding: "20px", border: "1px solid #ccc", margin: "20px" }}
      >
        <button
          onClick={onClick}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Start beep
        </button>
      </div>
    </div>
  );
}

interface SecondPageProps {
  onPlayPlaylist: (playlist: string[]) => void;
}
function SecondPage({ onPlayPlaylist }: SecondPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayBeep = () => {
    if (!isPlaying) {
      const playlist = ["/audio/high_beep.mp3", "/audio/low_beep.mp3"];
      onPlayPlaylist(playlist);
      setIsPlaying(true);
    }
  };

  return (
    <div>
      <div
        style={{ padding: "20px", border: "1px solid #ccc", margin: "20px" }}
      >
        <h2>Second Page</h2>
        <p>ビープを再生します。</p>
        <button 
          onClick={handlePlayBeep}
          disabled={isPlaying}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          {isPlaying ? "Playing..." : "Play Beep"}
        </button>
      </div>
    </div>
  );
}

function ThirdPage() {
  return (
    <div>
      <div
        style={{ padding: "20px", border: "1px solid #ccc", margin: "20px" }}
      >
        <h2>Third Page</h2>
        <p>5秒後に自動的に切り替わりました。</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const audioRef = useRef<{ play: (playlist: string[]) => void }>(null);

  const handlePlayPlaylist = (playlist: string[]) => {
    audioRef.current?.play(playlist);
  };

  useEffect(() => {
    if (currentStep === 1) {
      const timer = setTimeout(() => {
        setCurrentStep(2);
        // 5秒後に自動的にビープを再生
        handlePlayPlaylist(["/audio/high_beep.mp3", "/audio/low_beep.mp3"]);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <>
      {currentStep === 0 ? (
        <FirstPage onClick={() => setCurrentStep(1)} />
      ) : currentStep === 1 ? (
        <SecondPage onPlayPlaylist={handlePlayPlaylist} />
      ) : (
        <ThirdPage />
      )}
      
      <AutoPlayAudio ref={audioRef} />
    </>
  );
}
