/**
 * WebSocket Configuration for Real-time Updates
 * Supports Pusher for production, or native WebSocket for development
 */

export interface WebSocketMessage {
  type: 'table-update' | 'order-update' | 'notification' | 'analytics';
  data: any;
  timestamp: Date;
}

export class WebSocketManager {
  private static instance: WebSocketManager;
  private socket: WebSocket | null = null;
  private pusher: any = null;
  private listeners: Map<string, Function[]> = new Map();

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  /**
   * Initialize WebSocket connection
   * In production: Use Pusher for scalability
   * In development: Use native WebSocket
   */
  connect(url: string = 'wss://your-server.com/ws'): void {
    if (process.env.NEXT_PUBLIC_USE_PUSHER === 'true') {
      this.connectPusher();
    } else {
      this.connectNative(url);
    }
  }

  private connectNative(url: string): void {
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.emit('connected', {});
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.emit(message.type, message.data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.socket.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      this.emit('error', { message: 'WebSocket connection error' });
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected', {});
    };
  }

  private connectPusher(): void {
    // Mock Pusher initialization
    // In production: import Pusher from 'pusher-js';
    console.log('Pusher connection configured');
  }

  /**
   * Subscribe to real-time table updates
   */
  subscribeToTableUpdates(tableId: string, callback: (data: any) => void): void {
    this.on('table-update', (data: any) => {
      if (data.tableId === tableId) {
        callback(data);
      }
    });
  }

  /**
   * Subscribe to order updates
   */
  subscribeToOrderUpdates(orderId: string, callback: (data: any) => void): void {
    this.on('order-update', (data: any) => {
      if (data.orderId === orderId) {
        callback(data);
      }
    });
  }

  /**
   * Send message through WebSocket
   */
  send(message: WebSocketMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Register event listener
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((callback) => callback(data));
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}

/**
 * Hook for WebSocket connection
 */
export function useWebSocket() {
  const manager = WebSocketManager.getInstance();

  return {
    connect: (url?: string) => manager.connect(url),
    subscribeToTableUpdates: (tableId: string, callback: Function) =>
      manager.subscribeToTableUpdates(tableId, callback as any),
    subscribeToOrderUpdates: (orderId: string, callback: Function) =>
      manager.subscribeToOrderUpdates(orderId, callback as any),
    send: (message: WebSocketMessage) => manager.send(message),
    disconnect: () => manager.disconnect(),
  };
}
