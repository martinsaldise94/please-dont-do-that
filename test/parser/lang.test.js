import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectLang } from '../../core/parser/lang.js';

test('detects English text', () => {
  assert.equal(detectLang('The quick brown fox jumps over the lazy dog and this is a test'), 'en');
});

test('detects Spanish text', () => {
  assert.equal(detectLang('El negocio ofrece soluciones innovadoras para los clientes de la empresa'), 'es');
});

test('returns unknown for very short text', () => {
  assert.equal(detectLang('hi'), 'unknown');
});

test('returns unknown for empty string', () => {
  assert.equal(detectLang(''), 'unknown');
});

test('returns unknown for null', () => {
  assert.equal(detectLang(null), 'unknown');
});

test('detects English landing page copy', () => {
  const text = 'Get started today with our seamless platform. We empower your business to scale.';
  assert.equal(detectLang(text), 'en');
});

test('detects Spanish landing page copy', () => {
  const text = 'Empieza hoy con nuestra plataforma. Ofrecemos las mejores soluciones para tu empresa.';
  assert.equal(detectLang(text), 'es');
});
