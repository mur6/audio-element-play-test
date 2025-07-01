import { useEffect, useRef, useState } from 'react'

interface PlaylistProps {
  playlist: string[]
}

export function SimpleAudio({ playlist }: PlaylistProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map())

  // AudioContextの初期化
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop()
        sourceRef.current.disconnect()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // オーディオファイルを読み込む関数
  const loadAudioFile = async (url: string): Promise<AudioBuffer> => {
    if (audioBuffersRef.current.has(url)) {
      return audioBuffersRef.current.get(url)!
    }

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer)
      audioBuffersRef.current.set(url, audioBuffer)
      return audioBuffer
    } catch (error) {
      console.error('Error loading audio file:', error)
      throw error
    }
  }

  // オーディオを再生する関数
  const playAudio = async (url: string) => {
    if (!audioContextRef.current) return

    try {
      // 既存のソースを停止
      if (sourceRef.current) {
        sourceRef.current.stop()
        sourceRef.current.disconnect()
      }

      // AudioContextが停止している場合は再開
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      const audioBuffer = await loadAudioFile(url)
      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)

      // 再生終了時のハンドラ
      source.onended = () => {
        if (currentIndex + 1 < playlist.length) {
          setCurrentIndex(currentIndex + 1)
        } else {
          // プレイリストの最後に到達した場合の処理
          // 必要に応じてループや停止の処理を追加
        }
      }

      sourceRef.current = source
      source.start(0)
    } catch (error) {
      console.error('Error playing audio:', error)
    }
  }

  // プレイリストやインデックスが変更された時の処理
  useEffect(() => {
    if (playlist.length > 0 && currentIndex < playlist.length) {
      playAudio(playlist[currentIndex])
    }

    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop()
        sourceRef.current.disconnect()
        sourceRef.current = null
      }
    }
  }, [currentIndex, playlist])

  return null // Web Audio APIを使用するため、DOM要素は不要
}
