const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');

function readJson(packageName) {
  return JSON.parse(
    fs.readFileSync(path.join(root, 'vendor', packageName, 'package.json'), 'utf8')
  );
}

test('decode-uri-component stays a function for query-string', () => {
  const decode = require('decode-uri-component');
  const queryString = require('query-string');
  assert.equal(readJson('decode-uri-component').version, '0.5.1+cjs.1');
  assert.equal(typeof decode, 'function');
  assert.equal(decode('a%20b'), 'a b');
  assert.equal(decode('%'), '%');
  assert.equal(decode('%80x'), '%80x');
  assert.equal(decode('%C2'), '\uFFFD');
  assert.equal(decode('%FE%FF'), '\uFFFD\uFFFD');
  assert.throws(() => decode(1), TypeError);
  const parsed = queryString.parse('a=b%20c&x=1');
  assert.equal(parsed.a, 'b c');
  assert.equal(parsed.x, '1');

  const malformed = '%'.repeat(4000);
  const manyRuns = Array.from({length: 4000}, (_, index) => {
    const lead = (index & 255).toString(16).padStart(2, '0');
    const next = ((index >> 8) & 255).toString(16).padStart(2, '0');
    return `%${lead}%${next}x`;
  }).join('');
  const started = Date.now();
  assert.equal(typeof decode(malformed), 'string');
  assert.equal(typeof decode(manyRuns), 'string');
  assert.ok(Date.now() - started < 1000);
});
