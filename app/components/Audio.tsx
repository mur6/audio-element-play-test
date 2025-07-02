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

  // TODO:
  // - このコンポーネントは、生成されたタイミングから、常にSILENT_SOUND_PATHのサウンドを再生し続ける。
  // - ただし、`ref`を通じて、外部から `playlist` (音声ファイルのリスト)が与えられたら、その音声ファイルを、リスト順に再生する。
  // - `ref`を通じて、`play`メソッドを公開する。
  // - `play`メソッドは、引数として受け取った `playlist` の音声ファイルを順番に再生する。
  // - `playlist`の再生が終了したら、再びSILENT_SOUND_PATHの音声を再生する。

  return (
      <audio ref={audioRef} autoPlay preload="auto" style={{ display: 'none' }} />
  );
}
