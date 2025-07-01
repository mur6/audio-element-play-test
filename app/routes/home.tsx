import type { Route } from "./+types/home";
import { useState, useEffect, use, useRef } from "react";
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
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const testPlaylistOfList: string[][] = [
    ["/audio/high_beep.mp3", "/audio/low_beep.mp3"],
    ["/audio/high_beep.mp3", "/audio/low_beep.mp3"],
  ];
  const playlist = testPlaylistOfList[0];
  const playlist2 = testPlaylistOfList[1];

  useEffect(() => {
    if (currentStep === 1) {
      // 無音のmp3を再生開始
      if (silentAudioRef.current) {
        silentAudioRef.current.currentTime = 0;
        silentAudioRef.current.play();
      }

      const timer = setTimeout(() => {
        // 無音のmp3を停止
        if (silentAudioRef.current) {
          silentAudioRef.current.pause();
          silentAudioRef.current.currentTime = 0;
        }
        setCurrentStep(2);
      }, 5000); // 5秒後に自動的に切り替え

      return () => {
        clearTimeout(timer);
        // クリーンアップ時も無音のmp3を停止
        if (silentAudioRef.current) {
          silentAudioRef.current.pause();
          silentAudioRef.current.currentTime = 0;
        }
      };
    }
  }, [currentStep]);
  return (
    <>
      {/* 無音のmp3ファイル用の隠しaudio要素 */}
      <audio
        ref={silentAudioRef}
        src="/audio/silent.mp3"
        loop
        style={{ display: 'none' }}
      />
      
      {currentStep === 0 ? (
        <FirstPage onClick={() => setCurrentStep(1)} />
      ) : currentStep === 1 ? (
        <SecondPage playlist={playlist}/>
      ) : (
        <ThirdPage playlist={playlist2} />
      )}
    </>
  );
}
