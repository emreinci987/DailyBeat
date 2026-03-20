/**
 * @file simple.test.js
 * @description DailyBeat — Temel Fonksiyon Testleri
 */

import { getMoodProfile, lerp } from '../../services/recommendation/engine.js';
import { toDateKey }            from '../../services/mood/historyFormatter.js';

// ── lerp ──────────────────────────────────────────────────────────────────────
describe('lerp()', () => {
  test('0 verince başlangıcı döndürür',  () => expect(lerp(0, 100, 0)).toBe(0));
  test('1 verince bitişi döndürür',      () => expect(lerp(0, 100, 1)).toBe(100));
  test('0.5 verince ortayı döndürür',    () => expect(lerp(0, 100, 0.5)).toBe(50));
});

// ── getMoodProfile ────────────────────────────────────────────────────────────
describe('getMoodProfile()', () => {
  test('1 → düşük valence',  () => expect(getMoodProfile(1).valence).toBeLessThan(0.2));
  test('5 → orta valence',   () => expect(getMoodProfile(5).valence).toBeCloseTo(0.5, 1));
  test('10 → yüksek valence',() => expect(getMoodProfile(10).valence).toBeGreaterThan(0.9));
  test('etiket dönüyor',     () => expect(getMoodProfile(7)).toHaveProperty('label'));
  test('geçersiz giriş hata',() => expect(() => getMoodProfile(11)).toThrow());
});

// ── toDateKey ─────────────────────────────────────────────────────────────────
describe('toDateKey()', () => {
  test('YYYY-MM-DD formatında dönüyor', () => {
    expect(toDateKey(new Date('2024-01-15'))).toBe('2024-01-15');
  });
  test('ay tek haneliyse sıfır ekliyor', () => {
    expect(toDateKey(new Date('2024-03-07'))).toBe('2024-03-07');
  });
});
