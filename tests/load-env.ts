import fs from 'fs';
import path from 'path';

/**
 * A robust, simple environment variable loader for Playwright.
 * Manually parses .env and .env.local to avoid ESM/CJS interop issues with @next/env.
 */
export function loadEnv() {
  const cwd = process.cwd();
  
  // Order of loading: .env first, then .env.local (which overrides .env)
  const envFiles = [
    path.join(cwd, '.env'),
    path.join(cwd, '.env.local')
  ];

  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      try {
        const content = fs.readFileSync(envFile, 'utf-8');
        const lines = content.split(/\r?\n/);
        
        for (const line of lines) {
          const trimmed = line.trim();
          // Skip empty lines and comments
          if (!trimmed || trimmed.startsWith('#')) continue;
          
          const equalIndex = trimmed.indexOf('=');
          if (equalIndex === -1) continue;
          
          const key = trimmed.substring(0, equalIndex).trim();
          let value = trimmed.substring(equalIndex + 1).trim();
          
          // Remove wrapping quotes if present
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.substring(1, value.length - 1);
          }
          
          // Set environment variable (only if not already set, or override to match local overrides)
          process.env[key] = value;
        }
      } catch (err) {
        // Silent catch
      }
    }
  }
}

// Auto-run on import to mimic next/env loading
loadEnv();
