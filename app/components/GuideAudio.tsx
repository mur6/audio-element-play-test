import { useEffect, useRef, useState } from 'react';

interface GuideAudioProps {
  playlistOfList: string[][];
  currentPlaylist?: number;
}

export const GuideAudio: React.FC<GuideAudioProps> = ({
  playlistOfList,
  currentPlaylist = 0,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const silentAudioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const currentPlaylistTracks = playlistOfList[currentPlaylist] || [];

  useEffect(() => {
    const initializeAudio = async () => {
      if (silentAudioRef.current && !isInitialized) {
        try {
          silentAudioRef.current.loop = true;
          await silentAudioRef.current.play();
          setIsInitialized(true);
        } catch (error) {
          console.warn('Failed to initialize silent audio:', error);
        }
      }
    };

    initializeAudio();
  }, [isInitialized]);

  useEffect(() => {
    if (currentPlaylistTracks.length > 0 && audioRef.current && isInitialized) {
      const currentTrack = currentPlaylistTracks[currentTrackIndex];
      audioRef.current.src = currentTrack;
      audioRef.current.load();
    }
  }, [currentPlaylistTracks, currentTrackIndex, isInitialized]);

  useEffect(() => {
    setCurrentTrackIndex(0);
  }, [currentPlaylist]);

  const handleTrackEnd = () => {
    if (currentTrackIndex < currentPlaylistTracks.length - 1) {
      setCurrentTrackIndex(prev => prev + 1);
    }
  };

  const playCurrentTrack = async () => {
    if (audioRef.current && isInitialized) {
      try {
        if (silentAudioRef.current) {
          silentAudioRef.current.pause();
        }
        await audioRef.current.play();
      } catch (error) {
        console.warn('Failed to play audio:', error);
      }
    }
  };

  const handleAudioEnd = () => {
    handleTrackEnd();
    if (silentAudioRef.current && currentTrackIndex >= currentPlaylistTracks.length - 1) {
      silentAudioRef.current.play();
    }
  };

  useEffect(() => {
    if (currentPlaylistTracks.length > 0 && isInitialized) {
      playCurrentTrack();
    }
  }, [currentTrackIndex, isInitialized, currentPlaylistTracks.length]);

  return (
    <>
      <audio
        ref={silentAudioRef}
        src="/audio/silent.mp3"
        preload="auto"
        style={{ display: 'none' }}
      />
      <audio
        ref={audioRef}
        preload="auto"
        onEnded={handleAudioEnd}
        style={{ display: 'none' }}
      />
    </>
  );
};