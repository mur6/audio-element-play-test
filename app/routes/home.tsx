import type { Route } from "./+types/home";
import { useState, useEffect, use } from "react";
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
}
function SecondPage({ playlist }: SecondPageProps) {
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

interface ThirdPageProps {
  playlist: string[];
}
function ThirdPage({ playlist }: ThirdPageProps) {
  return (
    <div>
      <div
        style={{ padding: "20px", border: "1px solid #ccc", margin: "20px" }}
      >
        <h2>Third Page</h2>
        <p>5秒後に自動的に切り替わりました。</p>
        <SimpleAudio playlist={playlist} />
      </div>
    </div>
  );
}

export default function Home() {
  // const [currentPlaylist, setCurrentPlaylist] = useState(-1);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPlaylist, setCurrentPlaylist] = useState<string[]>([]);
  const testPlaylistOfList: string[][] = [
    ["/audio/high_beep.mp3", "/audio/low_beep.mp3"],
    ["/audio/high_beep.mp3", "/audio/low_beep.mp3"],
  ];
  const playlist = testPlaylistOfList[0];
  const playlist2 = testPlaylistOfList[1];
  const silentPlaylist = ["/audio/silent.mp3"];

  useEffect(() => {
    if (currentStep === 0) {
      setCurrentPlaylist([]);
    } else if (currentStep === 1) {
      // 5秒間無音のmp3を再生
      setCurrentPlaylist(silentPlaylist);
      
      const timer = setTimeout(() => {
        setCurrentStep(2);
      }, 5000); // 5秒後に自動的に切り替え

      return () => clearTimeout(timer);
    } else if (currentStep === 2) {
      setCurrentPlaylist(playlist2);
    }
  }, [currentStep]);
  return (
    <>
      {currentStep === 0 ? (
        <FirstPage onClick={() => setCurrentStep(1)} />
      ) : currentStep === 1 ? (
        <SecondPage playlist={playlist}/>
      ) : (
        <ThirdPage playlist={playlist2} />
      )}
      
      {/* 常に同じSimpleAudioコンポーネントを維持 */}
      {currentPlaylist.length > 0 && (
        <SimpleAudio key="main-audio" playlist={currentPlaylist} />
      )}
    </>
  );
}
