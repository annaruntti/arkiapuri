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
  assert.equal(readJson('decode-uri-component').version, '0.5.0+cjs.1');
  assert.equal(typeof decode, 'function');
  assert.equal(decode('a%20b'), 'a b');
  assert.equal(decode('%'), '%');
  assert.throws(() => decode(1), TypeError);
  const parsed = queryString.parse('a=b%20c&x=1');
  assert.equal(parsed.a, 'b c');
  assert.equal(parsed.x, '1');

  const malformed = '%'.repeat(4000);
  const started = Date.now();
  const decoded = decode(malformed);
  assert.equal(typeof decoded, 'string');
  assert.ok(Date.now() - started < 1000);
});
