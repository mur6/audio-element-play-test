import { useEffect, useImperativeHandle, useRef, useState } from "react";

const SILENT_SOUND_PATH = "/audio/silent.mp3";

type Playlist = string[];

interface AutoPlayAudioRef {
  play: (playlist: Playlist) => void;
}

interface AutoPlayAudioProps {
  ref: React.Ref<AutoPlayAudioRef>;
}

export function AutoPlayAudio({ ref }: AutoPlayAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlayingPlaylist, setIsPlayingPlaylist] = useState(false);

  useImperativeHandle(ref, () => ({
    play: (playlist: Playlist) => {
      setCurrentPlaylist(playlist);
      setCurrentTrackIndex(0);
      setIsPlayingPlaylist(true);
    },
  }));

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (isPlayingPlaylist && currentPlaylist.length > 0) {
        const nextIndex = currentTrackIndex + 1;
        if (nextIndex < currentPlaylist.length) {
          setCurrentTrackIndex(nextIndex);
        } else {
          setIsPlayingPlaylist(false);
          setCurrentPlaylist([]);
          setCurrentTrackIndex(0);
        }
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [isPlayingPlaylist, currentPlaylist]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlayingPlaylist && currentPlaylist.length > 0) {
      audio.src = currentPlaylist[currentTrackIndex];
    } else {
      audio.src = SILENT_SOUND_PATH;
      audio.loop = true;
    }

    audio.load();
    audio.play().catch(console.error);
  }, [isPlayingPlaylist, currentPlaylist, currentTrackIndex]);

  return (
    <audio ref={audioRef} autoPlay preload="auto" style={{ display: "none" }} />
  );
}
