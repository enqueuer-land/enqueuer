import { StreamInputHandler } from './stream-input-handler';
import { HandlerListener } from './handler-listener';
import * as net from 'net';
jest.mock('./handler-listener');
jest.mock('net');

describe('StreamInputHandler', () => {
  it('Should create server and listener', () => {
    const server = 'server';
    // @ts-expect-error
    HandlerListener.mockImplementationOnce();
    // @ts-expect-error
    net.createServer.mockImplementationOnce(() => server);

    // @ts-expect-error
    new StreamInputHandler();

    expect(HandlerListener).toHaveBeenCalledWith(server);
    expect(net.createServer).toHaveBeenCalled();
  });

  it('Should call listen', () => {
    const handlerName = 'handlerName';
    const listen = jest.fn(() => new Promise(() => {}));
    // @ts-expect-error
    HandlerListener.mockImplementationOnce(() => {
      return {
        listen: listen,
        getHandler: handlerName
      };
    });

    new StreamInputHandler(handlerName).mount(() => {});

    expect(listen).toHaveBeenCalledWith(handlerName);
  });

  it('Should update handler', done => {
    // @ts-expect-error
    net.createServer.mockImplementationOnce(() => {
      return {
        on: () => {}
      };
    });
    // @ts-expect-error
    HandlerListener.mockImplementationOnce(() => {
      return {
        listen: () => Promise.resolve(),
        getHandler: () => 54321
      };
    });

    const streamInputHandler = new StreamInputHandler('handlerName');
    streamInputHandler
      .mount(() => {})
      .then(() => {
        expect(streamInputHandler.getHandler()).toBe(54321);
        done();
      });
  });

  it('Should close', () => {
    const closeMock = jest.fn();
    // @ts-expect-error
    net.createServer.mockImplementationOnce(() => {
      return {
        close: closeMock
      };
    });

    new StreamInputHandler('handlerName').close();

    expect(closeMock).toBeCalled();
  });

  it('Should close', () => {
    const endMock = jest.fn();
    const stream = {
      end: endMock
    };

    new StreamInputHandler('handlerName').end(stream);

    expect(endMock).toBeCalled();
  });

  it('Should respond object', done => {
    const writeMock = jest.fn((value, cb) => cb());
    const stream = {
      write: writeMock
    };

    const message = {
      cycle: {
        object: 2
      }
    };
    new StreamInputHandler('handlerName').respond(stream, message).then(() => {
      const mockCalls = writeMock.mock.calls;
      const messageSent = mockCalls[0][0];

      expect(JSON.parse(messageSent)).toEqual(message);
      done();
    });
  });

  it('Should respond string', done => {
    const writeMock = jest.fn();
    const stream = {
      write: writeMock
    };

    const message = 'message';
    new StreamInputHandler('handlerName').respond(stream, message);

    expect(writeMock).toHaveBeenCalledWith('message', expect.any(Function));
    done();
  });

  it('Should handler respond error', done => {
    const stream = {
      write: () => {
        throw 'error';
      }
    };

    new StreamInputHandler('handlerName').respond(stream, {}).catch(err => {
      expect(err).toBe('Error sending input handler: error');
      done();
    });
  });
});
