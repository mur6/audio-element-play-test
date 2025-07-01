import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SimpleAudio } from '../app/components/Audio'

// Audio Context Mock
const mockAudioBufferSourceNode = {
  buffer: null,
  onended: null,
  start: vi.fn(),
  stop: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
}

const mockAudioContext = {
  state: 'running',
  destination: {},
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  createBufferSource: vi.fn().mockReturnValue(mockAudioBufferSourceNode),
  decodeAudioData: vi.fn().mockResolvedValue({
    length: 1000,
    sampleRate: 44100,
    numberOfChannels: 2,
    duration: 1.0,
  }),
}

describe('SimpleAudio Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock Web Audio API
    global.AudioContext = vi.fn().mockImplementation(() => mockAudioContext) as any
    ;(global as any).webkitAudioContext = vi.fn().mockImplementation(() => mockAudioContext)
    
    // Mock fetch for audio files
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('.mp3')) {
        return Promise.resolve({
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
        })
      }
      return Promise.reject(new Error('Not found'))
    }) as any
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize AudioContext when component mounts', () => {
    render(<SimpleAudio playlist={['/audio/test1.mp3']} />)
    
    expect(global.AudioContext).toHaveBeenCalledTimes(1)
  })

  it('should play first audio in playlist on mount', async () => {
    const playlist = ['/audio/test1.mp3', '/audio/test2.mp3']
    render(<SimpleAudio playlist={playlist} />)
    
    // AudioContext が作成されることを確認
    expect(global.AudioContext).toHaveBeenCalled()
    
    // 最初のオーディオファイルがフェッチされることを確認
    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/audio/test1.mp3')
    })
    
    // AudioBufferSourceNode が作成され、再生が開始されることを確認
    await vi.waitFor(() => {
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled()
      expect(mockAudioBufferSourceNode.start).toHaveBeenCalledWith(0)
    })
  })

  it('should advance to next audio when current audio ends', async () => {
    const playlist = ['/audio/test1.mp3', '/audio/test2.mp3']
    render(<SimpleAudio playlist={playlist} />)
    
    // 最初のオーディオが開始されるまで待つ
    await vi.waitFor(() => {
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled()
    })
    
    // onended コールバックをシミュレート
    const onendedCallback = mockAudioBufferSourceNode.onended
    expect(onendedCallback).toBeDefined()
    
    if (onendedCallback) {
      onendedCallback(new Event('ended'))
    }
    
    // 次のオーディオファイルがフェッチされることを確認
    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/audio/test2.mp3')
    })
    
    // 新しい AudioBufferSourceNode が作成されることを確認
    await vi.waitFor(() => {
      expect(mockAudioContext.createBufferSource).toHaveBeenCalledTimes(2)
    })
  })

  it('should handle suspended AudioContext by resuming it', async () => {
    mockAudioContext.state = 'suspended'
    
    render(<SimpleAudio playlist={['/audio/test1.mp3']} />)
    
    await vi.waitFor(() => {
      expect(mockAudioContext.resume).toHaveBeenCalled()
    })
  })

  it('should stop and disconnect audio source when component unmounts', async () => {
    const { unmount } = render(<SimpleAudio playlist={['/audio/test1.mp3']} />)
    
    // AudioBufferSourceNode が作成されるまで待つ
    await vi.waitFor(() => {
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled()
    })
    
    // コンポーネントをアンマウント
    unmount()
    
    // オーディオソースが停止・切断されることを確認
    expect(mockAudioBufferSourceNode.stop).toHaveBeenCalled()
    expect(mockAudioBufferSourceNode.disconnect).toHaveBeenCalled()
    expect(mockAudioContext.close).toHaveBeenCalled()
  })

  it('should handle audio loading errors gracefully', async () => {
    // fetch を失敗させる
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as any
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<SimpleAudio playlist={['/audio/nonexistent.mp3']} />)
    
    // エラーが適切にログ出力されることを確認
    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error loading audio file:', expect.any(Error))
    })
    
    consoleSpy.mockRestore()
  })

  it('should handle audio decoding errors gracefully', async () => {
    // decodeAudioData を失敗させる
    mockAudioContext.decodeAudioData = vi.fn().mockRejectedValue(new Error('Decode error'))
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<SimpleAudio playlist={['/audio/corrupt.mp3']} />)
    
    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error loading audio file:', expect.any(Error))
    })
    
    consoleSpy.mockRestore()
  })

  it('should cache audio buffers to avoid redundant loading', async () => {
    const playlist = ['/audio/test1.mp3', '/audio/test1.mp3'] // 同じファイルを2回
    render(<SimpleAudio playlist={playlist} />)
    
    // 最初のオーディオが再生されるまで待つ
    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/audio/test1.mp3')
      expect(mockAudioContext.decodeAudioData).toHaveBeenCalled()
    })
    
    // onended をトリガーして次のオーディオに進む
    const onendedCallback = mockAudioBufferSourceNode.onended
    if (onendedCallback) {
      onendedCallback(new Event('ended'))
    }
    
    // 同じファイルなので、fetch は再度呼ばれないが、decodeAudioData も再度呼ばれない
    await vi.waitFor(() => {
      // fetch は最初の1回のみ
      expect(global.fetch).toHaveBeenCalledTimes(1)
      // decodeAudioData も最初の1回のみ（キャッシュが効いている）
      expect(mockAudioContext.decodeAudioData).toHaveBeenCalledTimes(1)
    })
  })

  it('should handle empty playlist gracefully', () => {
    render(<SimpleAudio playlist={[]} />)
    
    // AudioContext は作成されるが、オーディオの再生は試行されない
    expect(global.AudioContext).toHaveBeenCalled()
    expect(global.fetch).not.toHaveBeenCalled()
    expect(mockAudioContext.createBufferSource).not.toHaveBeenCalled()
  })

  it('should handle playlist changes correctly', async () => {
    const { rerender } = render(<SimpleAudio playlist={['/audio/test1.mp3']} />)
    
    // 最初のオーディオが再生されることを確認
    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/audio/test1.mp3')
    })
    
    // プレイリストを変更
    rerender(<SimpleAudio playlist={['/audio/test2.mp3']} />)
    
    // 古いオーディオが停止され、新しいオーディオが再生されることを確認
    await vi.waitFor(() => {
      expect(mockAudioBufferSourceNode.stop).toHaveBeenCalled()
      expect(global.fetch).toHaveBeenCalledWith('/audio/test2.mp3')
    })
  })
})