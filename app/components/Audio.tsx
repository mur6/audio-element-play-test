import { useEffect, useImperativeHandle, useRef, useState } from "react";


type Playlist = string[];

interface SimpleAudioRef {
  play: (playlist: Playlist) => void;
}

interface PlaylistProps {
  ref: React.Ref<SimpleAudioRef>;
}

export function SimpleAudio({ ref }: PlaylistProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useImperativeHandle(ref, () => ({
    play: (playlist) => {
      if (audioRef.current) {
        audioRef.current.src = playlist[0];
        audioRef.current.play();
      }
    },
  }));

  return <audio autoPlay controls ref={audioRef} style={{ display: "none" }} />;
}
