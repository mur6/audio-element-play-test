import '@testing-library/jest-dom'

// Mock Web Audio API
class MockAudioContext implements Partial<AudioContext> {
  state: AudioContextState = 'running'
  destination: AudioDestinationNode = {} as AudioDestinationNode
  
  constructor() {
    // Mock implementation
  }

  async resume(): Promise<void> {
    this.state = 'running'
    return Promise.resolve()
  }

  async close(): Promise<void> {
    this.state = 'closed'
    return Promise.resolve()
  }

  createBufferSource(): AudioBufferSourceNode {
    const mockSource = {
      buffer: null,
      onended: null,
      start: vi.fn(),
      stop: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as unknown as AudioBufferSourceNode
    
    return mockSource
  }

  async decodeAudioData(audioData: ArrayBuffer): Promise<AudioBuffer> {
    const mockBuffer = {
      length: 1000,
      sampleRate: 44100,
      numberOfChannels: 2,
      duration: 1.0,
    } as AudioBuffer
    
    return Promise.resolve(mockBuffer)
  }
}

// Mock fetch for audio files
global.fetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('.mp3')) {
    const mockArrayBuffer = new ArrayBuffer(1024)
    return Promise.resolve({
      arrayBuffer: () => Promise.resolve(mockArrayBuffer),
    })
  }
  return Promise.reject(new Error('Not found'))
})

// Mock Audio Context
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: MockAudioContext,
})

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: MockAudioContext,
})

// Mock timers for better test control - remove recursive calls
// vi.useFakeTimers() を使用することでタイマーをモック