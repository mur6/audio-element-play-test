import type { Route } from "./+types/home";
import { useState, useEffect } from "react";
import { SimpleAudio } from "../components/Audio";

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
  playlist: string[];
  onComplete?: () => void;
}
function SecondPage({ playlist, onComplete }: SecondPageProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div>
      <div
        style={{ padding: "20px", border: "1px solid #ccc", margin: "20px" }}
      >
        <h2>Second Page</h2>
        <p>ビープを再生します。</p>
        <SimpleAudio playlist={playlist} />
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
  // const [currentPlaylist, setCurrentPlaylist] = useState(-1);
  const [currentStep, setCurrentStep] = useState(0);
  const testPlaylistOfList: string[][] = [
    ["/audio/high_beep.mp3", "/audio/low_beep.mp3"],
    ["/audio/high_beep.mp3", "/audio/low_beep.mp3"],
  ];
  const playlist = testPlaylistOfList[0];

  return (
    <>
      {currentStep === 0 ? (
        <FirstPage onClick={() => setCurrentStep(1)} />
      ) : currentStep === 1 ? (
        <SecondPage playlist={playlist} onComplete={() => setCurrentStep(2)} />
      ) : (
        <ThirdPage />
      )}
    </>
  );
}
