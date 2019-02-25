import {HandlerListener} from '../handlers/handler-listener';
import {HttpContainer} from './http-container';
import express = require('express');

jest.mock('express');
jest.mock('../handlers/handler-listener');

describe('HttpContainer', () => {
    it('Should create http server', () => {
        const mockApp = {
            use: () => {}
        };
        express.mockImplementationOnce(() => {
            return mockApp;
        });

        new HttpContainer(123, false);

        expect(express).toBeCalledWith();
    });

    it('Should call handleListen when no server exists', done => {
        const appReturn = {
            use: () => {}
        };
        express.mockImplementationOnce(() => appReturn);
        const mockListen = jest.fn();
        HandlerListener.mockImplementationOnce(() => {
            return {
                listen: mockListen
            };
        });

        new HttpContainer(123, false).acquire().then((app) => {
            expect(mockListen).toHaveBeenCalled();
            expect(mockListen).toHaveBeenCalledTimes(1);
            expect(app).toEqual(appReturn);
            done();
        });
    });

    it('Should handle handleListen fail', done => {
        const appReturn = {
            use: () => {}
        };
        express.mockImplementationOnce(() => appReturn);
        HandlerListener.mockImplementationOnce(() => {
            return {
                listen: jest.fn(() => Promise.reject('reason'))
            };
        });

        new HttpContainer(123, false).acquire().catch((err) => {
            expect(err).toEqual('reason');
            done();
        });
    });

    it('Should not recall handleListen when no server exists', done => {
        const appReturn = {
            use: () => {}
        };
        express.mockImplementationOnce(() => appReturn);
        const mockListen = jest.fn();
        HandlerListener.mockImplementationOnce(() => {
            return {
                listen: mockListen
            };
        });

        const httpContainer = new HttpContainer(123, false);
        httpContainer.acquire().then(() => {
            httpContainer.acquire().then(() => {

                expect(mockListen).toHaveBeenCalledTimes(1);
                done();
            });
        });
    });

    it('Should call onClose immediately when no server exists', () => {
        express.mockImplementationOnce(() => {
            return {
                use: () => {}
            };
        });

        const onCloseMock = jest.fn();
        new HttpContainer(123, false).release(onCloseMock);

        expect(onCloseMock).toHaveBeenCalled();
    });
});
