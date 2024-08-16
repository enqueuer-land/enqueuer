import { HandlerListener } from './handler-listener';
import * as net from 'net';

export class StreamInputHandler {
  private readonly handlerListener: HandlerListener;
  private readonly server: net.Server;
  private handler: string | number;

  public constructor(handler: string | number) {
    this.server = net.createServer();
    this.handler = handler;
    this.handlerListener = new HandlerListener(this.server);
  }

  public async subscribe(onMessageReceived: (requisition: any) => void): Promise<void> {
    return this.handlerListener.listen(this.handler).then(() => {
      this.handler = this.handlerListener.getHandler();
      this.server.on('connection', (stream: any) => {
        stream.on('data', (msg: any) =>
          onMessageReceived({
            message: this.stringifyPayloadReceived(msg.payload || msg),
            stream: stream
          })
        );
      });
    });
  }

  public getHandler(): string | number {
    return this.handler;
  }

  public async unsubscribe(): Promise<void> {
    if (this.server) {
      this.server.close();
      // @ts-ignore
      delete this.server;
    }
  }

  public sendResponse(stream: any, message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const strMsg = this.stringifyPayloadToSend(message);
      try {
        stream.write(strMsg, () => resolve());
      } catch (err) {
        reject(`Error sending input handler: ${err}`);
      }
    });
  }

  public close(stream: any) {
    stream.end();
    stream = null;
  }

  private stringifyPayloadReceived(message: string | Buffer): string {
    const messageType = typeof message;
    if (messageType == 'string') {
      return message as string;
    }
    return Buffer.from(message as Buffer).toString();
  }

  private stringifyPayloadToSend(payload: any): string | Buffer {
    if (typeof payload == 'string' || Buffer.isBuffer(payload)) {
      return payload;
    }
    return JSON.stringify(payload || {});
  }
}
