import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Frontend Project Configuration', () => {
  const rootDir = path.resolve(__dirname, '../../');

  it('should have standard configuration files', () => {
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'next.config.js'
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(rootDir, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  it('should have Cozy Forest theme CSS variables in globals.css', () => {
    const cssPath = path.join(rootDir, 'src/app/globals.css');
    expect(fs.existsSync(cssPath)).toBe(true);

    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Cozy Forest Theme variables check
    expect(cssContent).toContain('#F4F7F5');
    expect(cssContent).toContain('#FAF7F2');
    expect(cssContent).toContain('#1B3B2B');
    expect(cssContent).toContain('#2D5A27');
    expect(cssContent).toContain('#EAA89B');
  });

  it('should have layout.tsx and page.tsx in the app directory', () => {
    const appDir = path.join(rootDir, 'src/app');
    expect(fs.existsSync(path.join(appDir, 'layout.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(appDir, 'page.tsx'))).toBe(true);
  });
});