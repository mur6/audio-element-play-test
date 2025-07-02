import { useEffect, useImperativeHandle, useRef, useState } from "react";

const SILENT_SOUND_PATH = "/audio/silent.mp3";
const HIGH_BEEP_SOUND_PATH = "/audio/high_beep.mp3";

type Playlist = string[];

interface AutoPlayAudioRef {
  play: (playlist: Playlist) => void;
}

interface AutoPlayAudioProps {
  ref: React.Ref<AutoPlayAudioRef>;
}

function initAudioElemAttributes(audio: HTMLAudioElement) {
  audio.pause();
  audio.src = "";
  audio.currentTime = 0;
  audio.loop = false;
}

export function AutoPlayAudio({ ref }: AutoPlayAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  useImperativeHandle(ref, () => ({
    play: (playlist: Playlist) => {
      if (audioRef.current) {
        initAudioElemAttributes(audioRef.current);
      }
      setCurrentPlaylist(playlist);
      setCurrentTrackIndex(0);
    },
  }));

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const handleAudioEnded = () => {
        if (currentTrackIndex + 1 < currentPlaylist.length) {
          setCurrentTrackIndex(currentTrackIndex + 1);
        } else {
          audio.src = SILENT_SOUND_PATH;
          audio.loop = true;
          audio.load();
          audio.play().catch(console.error);
        }
      };

      audio.addEventListener("ended", handleAudioEnded);

      return () => {
        audio.removeEventListener("ended", handleAudioEnded);
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [currentTrackIndex, currentPlaylist]);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      audio.pause();
      audio.currentTime = 0;
      
      audio.src = currentPlaylist[currentTrackIndex];
      audio.load();

      audio.addEventListener("canplaythrough", () => {
        audio.play().catch(console.error);
      }, { once: true });
    }
  }, [currentTrackIndex, currentPlaylist]);

  return (
    <audio ref={audioRef} autoPlay preload="auto" style={{ display: "none" }} />
  );
}
