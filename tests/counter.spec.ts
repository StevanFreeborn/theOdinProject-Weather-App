import { expect, test, describe } from 'vitest';
import { setupCounter } from '../src/counter';

describe('setupCounter', () => {
  test('it should require an element', () => {
    expect(() => setupCounter(null!)).toThrow();
  });

  test('it should initialize the counter', () => {
    const element = document.createElement('button');

    setupCounter(element);

    expect(element.innerHTML).toBe('count is 0');
  });

  test('it should add click event listener to element that increments the count and updates the button text', () => {
    const element = document.createElement('button');

    setupCounter(element);

    element.click();

    expect(element.innerHTML).toBe('count is 1');
  });
});
