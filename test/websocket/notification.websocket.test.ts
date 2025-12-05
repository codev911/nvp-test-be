import { initNotificationWebsocket, publishNotification } from '../../src/websocket/notification.websocket';

let mockConnectionHandler: any;

jest.mock('ws', () => {
  const mockClients = new Set<any>();
  class MockSocket {
    static OPEN = 1;
    readyState = MockSocket.OPEN;
    sent: any[] = [];
    send(data: any) {
      this.sent.push(data);
    }
    close() {
      this.readyState = 3;
    }
  }
  return {
    __esModule: true,
    default: MockSocket,
    WebSocketServer: class {
      clients = mockClients;
      constructor() {
        this.clients = mockClients;
      }
      on(event: string, cb: Function) {
        if (event === 'connection') {
          mockConnectionHandler = cb;
        }
      }
    },
    OPEN: MockSocket.OPEN,
  };
});

const mockVerifyToken = jest.fn();
jest.mock('../../src/services/jwt.service', () => ({
  verifyToken: (...args: any[]) => mockVerifyToken(...args),
}));

describe('notification.websocket', () => {
  beforeEach(() => {
    mockConnectionHandler = null;
    jest.clearAllMocks();
  });

  it('initializes websocket server and publishes notifications', () => {
    const server = {} as any;
    initNotificationWebsocket(server);
    mockVerifyToken.mockReturnValue({ sub: '1' });
    const socket: any = new (require('ws').default)();
    mockConnectionHandler?.(socket, { url: '/ws/notifications?token=good' });

    publishNotification({
      id: '1',
      title: 't',
      message: 'm',
      createdAt: new Date().toISOString(),
      read: false,
    });

    expect(socket.sent.length).toBeGreaterThan(0);
  });

  it('rejects invalid token', () => {
    const server = {} as any;
    initNotificationWebsocket(server);
    mockVerifyToken.mockImplementation(() => {
      throw new Error('bad');
    });
    const socket: any = new (require('ws').default)();
    mockConnectionHandler?.(socket, { url: '/ws/notifications?token=bad' });
    expect(socket.readyState).not.toBe((require('ws').default as any).OPEN);
  });

  it('rejects missing token', () => {
    const server = {} as any;
    initNotificationWebsocket(server);
    const socket: any = new (require('ws').default)();
    mockConnectionHandler?.(socket, { url: '/ws/notifications' });
    expect(socket.readyState).not.toBe((require('ws').default as any).OPEN);
  });

  it('ignores publish when websocket not initialized', () => {
    expect(() =>
      publishNotification({
        id: '1',
        title: 't',
        message: 'm',
        createdAt: new Date().toISOString(),
        read: false,
      }),
    ).not.toThrow();
  });
});
