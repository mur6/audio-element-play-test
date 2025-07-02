import { useEffect, useImperativeHandle, useRef, useState } from "react";

const beep = new Audio("/beep.mp3");
beep.loop = true;
beep.volume = 0.5;

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

  return (
    <div>
      <audio ref={audioRef} onEnded={() => beep.play()} />
      <button
        onClick={() => {
          if (audioRef.current) {
            audioRef.current.play();
          }
        }}
      >
        Play
      </button>
      <button
        onClick={() => {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          beep.pause();
        }
      }>
        Pause
      </button>
      <button
        onClick={() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }
          beep.currentTime = 0;
        }
      }>
        Reset
      </button>
    </div>
  );
}
