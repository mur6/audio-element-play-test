import { useEffect, useRef, useState } from "react";

// playlistの型を定義

type Playlist = string[];

interface SimpleAudioRef {
  start: () => void;
  play: (playlist: Playlist) => void;
}

interface PlaylistProps {
  playlist: Playlist;
}

export function SimpleAudio({ playlist }: PlaylistProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const handleAudioEnded = () => {
        if (currentIndex + 1 < playlist.length) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // Uncomment this block if you want to loop the playlist
          // setCurrentIndex(0)
          // Uncomment the next line if you want to pause at the end of the playlist
          // audio.pause()
          // audio.currentTime = 0
        }
      };

      audio.addEventListener("ended", handleAudioEnded);

      return () => {
        audio.removeEventListener("ended", handleAudioEnded);
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [currentIndex, playlist]);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.src = playlist[currentIndex];
      audio.load();
      audio.play();
    }
  }, [currentIndex, playlist]);

  return <audio autoPlay controls ref={audioRef} style={{ display: "none" }} />;
}
