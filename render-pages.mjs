import { readFileSync, writeFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('./course.js', import.meta.url), 'utf8');

function render(moduleNumber) {
  const nodes = new Map();
  const node = (selector) => {
    if (!nodes.has(selector)) nodes.set(selector, {
      innerHTML: '', style: {},
      addEventListener() {},
      setAttribute() {},
      classList: { toggle() {} },
    });
    return nodes.get(selector);
  };
  const document = {
    body: { dataset: { module: String(moduleNumber) } },
    querySelector: node,
    addEventListener() {},
  };
  runInNewContext(source, {
    document,
    localStorage: { getItem: () => '[]', setItem() {} },
    console,
  });
  return node('#course-content').innerHTML;
}

function fillPage(file, moduleNumber) {
  const pagePath = new URL(file, import.meta.url);
  const html = readFileSync(pagePath, 'utf8');
  const marker = '<div id="course-content">';
  const start = html.indexOf(marker);
  const end = html.indexOf('</div></main>', start);
  if (start < 0 || end < 0) throw new Error(`Could not find course content container in ${file}`);
  const rendered = render(moduleNumber);
  const output = html.slice(0, start + marker.length) + rendered + html.slice(end);
  writeFileSync(pagePath, output, 'utf8');
}

fillPage('index.html', 1);
for (let moduleNumber = 2; moduleNumber <= 7; moduleNumber += 1) {
  fillPage(`modules/module0${moduleNumber}.html`, moduleNumber);
}

console.log('Rendered full lesson content into all seven HTML pages.');
