import { useEffect, useImperativeHandle, useRef, useState } from "react";

const beep = new Audio("/audio/silent.mp3");
beep.loop = true;

type Playlist = string[];

interface AutoPlayAudioRef {
  play: (playlist: Playlist) => void;
}

interface AutoPlayAudioProps {
  ref: React.Ref<AutoPlayAudioRef>;
}

export function AutoPlayAudio({ ref }: AutoPlayAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useImperativeHandle(ref, () => ({
    play: (playlist) => {
      if (audioRef.current) {
        audioRef.current.src = playlist[0];
        audioRef.current.play();
      }
    },
  }));

  return (
      <audio ref={audioRef} autoPlay preload="auto" style={{ display: 'none' }} />
  );
}
