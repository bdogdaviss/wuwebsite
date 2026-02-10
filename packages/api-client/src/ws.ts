export interface WakeupEvent {
  type: string
  data: unknown
}

type EventHandler = (data: unknown) => void

export class WakeupSocket {
  private ws: WebSocket | null = null
  private handlers: Map<string, Set<EventHandler>> = new Map()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private url: string = ''
  private token: string = ''
  private shouldReconnect = false

  connect(url: string, token: string): void {
    this.url = url
    this.token = token
    this.shouldReconnect = true
    this.doConnect()
  }

  private doConnect(): void {
    if (this.ws) {
      this.ws.close()
    }

    const wsUrl = `${this.url}?token=${this.token}`
    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      this.emit('connected', null)
    }

    this.ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as WakeupEvent
        this.emit(parsed.type, parsed.data)
      } catch {
        // Ignore malformed messages
      }
    }

    this.ws.onclose = () => {
      this.emit('disconnected', null)
      if (this.shouldReconnect) {
        this.reconnectTimer = setTimeout(() => this.doConnect(), 3000)
      }
    }

    this.ws.onerror = () => {
      // Error will trigger onclose, which handles reconnection
    }
  }

  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
  }

  off(event: string, handler?: EventHandler): void {
    if (!handler) {
      this.handlers.delete(event)
    } else {
      this.handlers.get(event)?.delete(handler)
    }
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.handlers.get(event)
    if (handlers) {
      handlers.forEach((handler) => handler(data))
    }
  }

  disconnect(): void {
    this.shouldReconnect = false
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.handlers.clear()
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
