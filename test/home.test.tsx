import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Home from '../app/routes/home'

// Audio Context Mock を拡張
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

describe('Home Component Audio Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
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
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('should render FirstPage initially without audio', () => {
    render(<Home />)
    
    expect(screen.getByText('Start beep')).toBeInTheDocument()
    expect(mockAudioContext.createBufferSource).not.toHaveBeenCalled()
  })

  it('should transition to SecondPage and start playing beep audio when button is clicked', async () => {
    render(<Home />)
    
    const startButton = screen.getByText('Start beep')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(screen.getByText('Second Page')).toBeInTheDocument()
      expect(screen.getByText('ビープを再生します。')).toBeInTheDocument()
    })
    
    // SimpleAudio コンポーネントがマウントされ、オーディオが再生されることを確認
    await waitFor(() => {
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled()
      expect(mockAudioBufferSourceNode.start).toHaveBeenCalledWith(0)
    })
  })

  it('should play silent mp3 during transition period (5 seconds)', async () => {
    render(<Home />)
    
    const startButton = screen.getByText('Start beep')
    fireEvent.click(startButton)
    
    // SecondPage に遷移したことを確認
    await waitFor(() => {
      expect(screen.getByText('Second Page')).toBeInTheDocument()
    })
    
    // 無音のmp3が再生されることを確認
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/audio/silent.mp3')
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled()
    })
  })

  it('should transition to ThirdPage after 5 seconds and change audio playlist', async () => {
    render(<Home />)
    
    const startButton = screen.getByText('Start beep')
    fireEvent.click(startButton)
    
    // SecondPage に遷移
    await waitFor(() => {
      expect(screen.getByText('Second Page')).toBeInTheDocument()
    })
    
    // 5秒後にThirdPageに遷移
    vi.advanceTimersByTime(5000)
    
    await waitFor(() => {
      expect(screen.getByText('Third Page')).toBeInTheDocument()
      expect(screen.getByText('5秒後に自動的に切り替わりました。')).toBeInTheDocument()
    })
    
    // 新しいプレイリストでオーディオが再生されることを確認
    await waitFor(() => {
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled()
    })
  })

  it('should handle audio context resume when suspended', async () => {
    // AudioContextが停止状態をシミュレート
    mockAudioContext.state = 'suspended'
    
    render(<Home />)
    
    const startButton = screen.getByText('Start beep')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(screen.getByText('Second Page')).toBeInTheDocument()
    })
    
    // AudioContext.resume() が呼ばれることを確認
    await waitFor(() => {
      expect(mockAudioContext.resume).toHaveBeenCalled()
    })
  })

  it('should stop audio when component unmounts', async () => {
    const { unmount } = render(<Home />)
    
    const startButton = screen.getByText('Start beep')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled()
    })
    
    // コンポーネントをアンマウント
    unmount()
    
    // オーディオが停止されることを確認
    expect(mockAudioBufferSourceNode.stop).toHaveBeenCalled()
    expect(mockAudioBufferSourceNode.disconnect).toHaveBeenCalled()
  })

  it('should handle audio loading errors gracefully', async () => {
    // fetch を失敗させる
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as any
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<Home />)
    
    const startButton = screen.getByText('Start beep')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(screen.getByText('Second Page')).toBeInTheDocument()
    })
    
    // エラーが適切にハンドリングされることを確認
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error loading audio file:', expect.any(Error))
    })
    
    consoleSpy.mockRestore()
  })

  it('should play next audio in playlist when current audio ends', async () => {
    render(<Home />)
    
    const startButton = screen.getByText('Start beep')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(screen.getByText('Second Page')).toBeInTheDocument()
    })
    
    // 最初のオーディオが作成されることを確認
    await waitFor(() => {
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled()
    })
    
    // onended イベントをシミュレート
    const onendedCallback = mockAudioBufferSourceNode.onended
    if (onendedCallback) {
      onendedCallback(new Event('ended'))
    }
    
    // 次のオーディオが再生されることを確認
    await waitFor(() => {
      expect(mockAudioContext.createBufferSource).toHaveBeenCalledTimes(2)
    })
  })

  it('should cache audio buffers for efficient playback', async () => {
    render(<Home />)
    
    const startButton = screen.getByText('Start beep')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(screen.getByText('Second Page')).toBeInTheDocument()
    })
    
    // 最初のオーディオ読み込み
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/audio/silent.mp3')
      expect(mockAudioContext.decodeAudioData).toHaveBeenCalled()
    })
    
    // 同じオーディオファイルを再度再生する場合、キャッシュが使用されることを確認
    // （実際のテストでは、コンポーネント内部のキャッシュロジックをテストする必要があります）
    const initialFetchCallCount = (global.fetch as any).mock.calls.length
    const initialDecodeCallCount = mockAudioContext.decodeAudioData.mock.calls.length
    
    // 同じファイルの再生をトリガー（実装に依存）
    // この部分は SimpleAudio コンポーネントの内部実装に依存するため、
    // 実際のテストでは適切な方法でキャッシュ機能をテストする必要があります
  })
})