import { ShuffleArrayPipe } from './shuffle-array.pipe';

describe('ShuffleArrayPipe', () => {
  let pipe: ShuffleArrayPipe;

  beforeEach(() => {
    pipe = new ShuffleArrayPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  // ─── transform: casos base ───────────────────────────────

  it('transform([]) → should return an empty array', () => {
    const result = pipe.transform([]);
    expect(result).toEqual([]);
  });

  it('transform(list) → result should have the same length as input', () => {
    const input = [1, 2, 3, 4, 5];
    const result = pipe.transform(input);
    expect(result.length).toBe(input.length);
  });

  it('transform(list) → result should contain the same elements (same items, possibly different order)', () => {
    const input = [10, 20, 30, 40, 50];
    const result = pipe.transform(input);

    // Todos los elementos del input deben estar en el resultado
    input.forEach(item => {
      expect(result).toContain(item);
    });
    // Y viceversa — no hay elementos extra
    result.forEach(item => {
      expect(input).toContain(item);
    });
  });

  it('transform(list) → should NOT mutate the original array', () => {
    const input = [1, 2, 3, 4, 5];
    const inputCopy = [...input];

    pipe.transform(input);

    // El array original debe permanecer intacto
    expect(input).toEqual(inputCopy);
  });

  it('transform([n]) → single-element array returns the same element', () => {
    const result = pipe.transform([42]);
    expect(result).toEqual([42]);
  });
});
