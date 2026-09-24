import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('responsive layout rules', () => {
  it('collapses the module grid to one column at the touch breakpoint', () => {
    const css = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), 'styles.css'), 'utf8');

    expect(css).toContain('.module-grid { grid-template-columns: 1fr; }');
  });
});
