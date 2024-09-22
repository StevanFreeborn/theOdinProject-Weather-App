import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { createApp, retrieveForecast } from '../src/main';

describe('createApp', () => {
  let dom: JSDOM;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
  });

  it('should return false if #app element is not found', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = createApp();
    expect(result).toBe(false);
    expect(spy).toHaveBeenCalledWith('Unable to find app element');
  });

  it('should return true and modify #app element if found', () => {
    const appDiv = document.createElement('div');
    appDiv.id = 'app';
    document.body.appendChild(appDiv);

    const result = createApp();
    expect(result).toBe(true);
    expect(appDiv.innerHTML).toContain('<div class="spinner"></div>');
    expect(appDiv.innerHTML).toContain('<pre id="display" class="hidden"><pre>');
  });
});

describe('retrieveForecast', () => {
  const getPositionMock = vi.fn();
  let originalGeolocation: Geolocation;

  beforeAll(() => {
    originalGeolocation = navigator.geolocation;
    (navigator as any).geolocation = {
      getCurrentPosition: getPositionMock,
    } as unknown as Geolocation;
  });

  afterAll(() => {
    (navigator as any).geolocation = originalGeolocation;
  });

  it('should call successHandler when getCurrentPosition is successful', () => {
    const successHandler = vi.fn();
    const errorHandler = vi.fn();
    const mockPosition = { coords: { latitude: 0, longitude: 0 } };

    getPositionMock.mockImplementationOnce((successCallback) => successCallback(mockPosition));

    retrieveForecast(successHandler, errorHandler);

    expect(successHandler).toHaveBeenCalledWith(mockPosition);
    expect(errorHandler).not.toHaveBeenCalled();
  });

  it('should call errorHandler when getCurrentPosition fails', () => {
    const successHandler = vi.fn();
    const errorHandler = vi.fn();
    const mockError = { code: 1, message: 'User denied geolocation' };

    getPositionMock.mockImplementationOnce((_, errorCallback) => errorCallback(mockError));

    retrieveForecast(successHandler, errorHandler);

    expect(errorHandler).toHaveBeenCalledWith(mockError);
    expect(successHandler).not.toHaveBeenCalled();
  });
});