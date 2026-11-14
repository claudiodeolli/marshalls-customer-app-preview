import test from 'node:test';
import assert from 'node:assert/strict';

import {
  decodeEntities,
  estimateWordDurationMs,
  joinTokens,
  normalizeToken,
  stripAnnotations,
  tokenize,
} from '../src/shared/text.mjs';

test('decodeEntities handles named and numeric entities', () => {
  assert.equal(decodeEntities('don&#39;t &amp; can&apos;t'), "don't & can't");
  assert.equal(decodeEntities('a&nbsp;b &#x41;'), 'a b A');
  assert.equal(decodeEntities('&amp;#39;'), "'");
});

test('stripAnnotations removes non-speech annotations', () => {
  assert.equal(stripAnnotations('[Music] Hello (Audience) world'), 'Hello world');
  assert.equal(stripAnnotations('(Laughter) that was funny'), 'that was funny');
  assert.equal(stripAnnotations('(whispering) stay'), '(whispering) stay');
});

test('normalizeToken ignores case, punctuation and curly apostrophes', () => {
  assert.equal(normalizeToken('Hello,'), 'hello');
  assert.equal(normalizeToken('DON\u2019T'), "don't");
  assert.equal(normalizeToken('"test"'), 'test');
  assert.equal(normalizeToken('...'), '');
});

test('tokenize keeps display punctuation and splits hyphens/dashes', () => {
  const tokens = tokenize('Well-known fact \u2014 isn\'t it?');
  assert.deepEqual(
    tokens.map((token) => token.display),
    ['Well', 'known', 'fact', "isn't", 'it?'],
  );
  assert.deepEqual(
    tokens.map((token) => token.norm),
    ['well', 'known', 'fact', "isn't", 'it'],
  );
});

test('tokenize drops music tags and punctuation-only tokens', () => {
  assert.deepEqual(tokenize('[Applause] -- hello ...'), [{ display: 'hello', norm: 'hello' }]);
  assert.deepEqual(tokenize(''), []);
});

test('joinTokens keeps closing punctuation attached', () => {
  assert.equal(
    joinTokens([{ display: 'Hello,' }, { display: 'world.' }, { display: 'How' }, { display: 'are' }, { display: 'you?' }]),
    'Hello, world. How are you?',
  );
  assert.equal(joinTokens(['(hello)', 'world']), '(hello) world');
});

test('estimateWordDurationMs stays within sane bounds', () => {
  assert.ok(estimateWordDurationMs('a') >= 180);
  assert.ok(estimateWordDurationMs('extraordinarily') <= 950);
  assert.ok(estimateWordDurationMs('extraordinarily') > estimateWordDurationMs('cat'));
});
