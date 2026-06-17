import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from '../../core/parser/html.js';

const GENERIC_HTML = `<!DOCTYPE html>
<html>
<head>
<style>
  .hero { background: linear-gradient(to right, #6366f1, #8b5cf6); }
  .card { border-radius: 8px; }
</style>
</head>
<body>
  <section class="hero">
    <h1>Transform Your Business</h1>
    <p>The innovative solution for seamless excellence</p>
    <button class="btn-primary">Get Started Free</button>
    <a href="/demo">Book a Demo</a>
  </section>
  <section class="features">
    <div class="card feature-card"><h3>Feature One</h3></div>
    <div class="card feature-card"><h3>Feature Two</h3></div>
    <div class="card feature-card"><h3>Feature Three</h3></div>
  </section>
  <section class="testimonials">
    <blockquote>★★★★★ Amazing service — John S., CEO</blockquote>
    <blockquote>★★★★★ Life changing — Sarah M., Founder</blockquote>
  </section>
</body>
</html>`;

test('extracts headings', () => {
  const r = parseHTML(GENERIC_HTML, 'test.html');
  assert.ok(r.headings.includes('Transform Your Business'));
  assert.ok(r.headings.some((h) => h.includes('Feature One')));
});

test('extracts CTA button texts', () => {
  const r = parseHTML(GENERIC_HTML, 'test.html');
  assert.ok(r.ctaTexts.some((t) => t.toLowerCase().includes('get started')));
  assert.ok(r.ctaTexts.some((t) => t.toLowerCase().includes('book a demo')));
});

test('detects hero section', () => {
  const r = parseHTML(GENERIC_HTML, 'test.html');
  assert.ok(r.sectionTypes.has('hero'));
});

test('detects features section', () => {
  const r = parseHTML(GENERIC_HTML, 'test.html');
  assert.ok(r.sectionTypes.has('features'));
});

test('detects testimonials section', () => {
  const r = parseHTML(GENERIC_HTML, 'test.html');
  assert.ok(r.sectionTypes.has('testimonials'));
});

test('counts testimonials', () => {
  const r = parseHTML(GENERIC_HTML, 'test.html');
  assert.ok(r.testimonialCount >= 2);
});

test('counts feature cards', () => {
  const r = parseHTML(GENERIC_HTML, 'test.html');
  assert.ok(r.featureCardCount >= 3);
});

test('collects CSS classes', () => {
  const r = parseHTML(GENERIC_HTML, 'test.html');
  assert.ok(r.cssClasses.has('hero'));
  assert.ok(r.cssClasses.has('card'));
  assert.ok(r.cssClasses.has('feature-card'));
});

test('extracts inline styles', () => {
  const r = parseHTML(GENERIC_HTML, 'test.html');
  assert.ok(r.inlineStyles.includes('linear-gradient'));
});

test('body text does not include style tag content', () => {
  const r = parseHTML(GENERIC_HTML, 'test.html');
  assert.ok(!r.bodyText.includes('border-radius'));
});

test('detects English language', () => {
  const r = parseHTML(GENERIC_HTML, 'test.html');
  assert.equal(r.lang, 'en');
});

test('detects Spanish language', () => {
  const html = `<html><body><h1>Bienvenido</h1><p>Ofrecemos los mejores servicios para su empresa con excelencia y dedicación.</p></body></html>`;
  const r = parseHTML(html, 'es.html');
  assert.equal(r.lang, 'es');
});

test('extracts stat patterns', () => {
  const html = `<html><body><p>Over 5,000+ clients trust us. 98% satisfaction rate.</p></body></html>`;
  const r = parseHTML(html, 'test.html');
  assert.ok(r.statPatterns.length >= 1);
});
