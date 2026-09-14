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

test('body text separates adjacent block elements but keeps inline words whole', () => {
  const html = `<html><body><ul><li>dry needling</li><li>shockwave</li></ul><p>Get<strong>ting</strong> started</p></body></html>`;
  const r = parseHTML(html, 'test.html');
  assert.equal(r.bodyText, 'dry needling shockwave Getting started');
});

test('extracts stat patterns', () => {
  const html = `<html><body><p>Over 5,000+ clients trust us. 98% satisfaction rate.</p></body></html>`;
  const r = parseHTML(html, 'test.html');
  assert.ok(r.statPatterns.length >= 1);
});

test('headings and CTA texts collapse internal whitespace from line breaks', () => {
  const html = `<html><body><h1>Streamline Your<br/><span>Workflow Forever</span></h1>
    <button>Get
      Started</button></body></html>`;
  const r = parseHTML(html, 'test.html');
  assert.deepEqual(r.headings, ['Streamline Your Workflow Forever']);
  assert.ok(r.ctaTexts.includes('Get Started'));
});

test('stat patterns keep decimal percentages whole', () => {
  const html = `<html><body><p>99.9% uptime and 98% satisfaction.</p></body></html>`;
  const r = parseHTML(html, 'test.html');
  assert.deepEqual(r.statPatterns, ['99.9%', '98%']);
});

test('stat patterns require a number before the social-proof noun', () => {
  const html = `<html><body><p>All your tools, teams, and tasks. Loved by 1,200 clients.</p></body></html>`;
  const r = parseHTML(html, 'test.html');
  assert.deepEqual(r.statPatterns, ['1,200 clients']);
});

test('stat patterns keep spanish thousands separators and feminine nouns whole', () => {
  const html = `<html><body><p>Reserva Tu Sesión +8.000 Clientas Felices</p></body></html>`;
  const r = parseHTML(html, 'es.html');
  assert.deepEqual(r.statPatterns, ['8.000 Clientas']);
});

test('a plan limit like "5 team members" is not a social-proof stat', () => {
  const html = `<html><body><ul><li>5 team members</li></ul><p>Used by 300 teams.</p></body></html>`;
  const r = parseHTML(html, 'test.html');
  assert.deepEqual(r.statPatterns, ['300 teams']);
});
