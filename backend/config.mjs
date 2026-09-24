import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(backendDirectory, '..');

function parseBoolean(value, fallback = false) {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

export function loadConfig(env = process.env) {
  return {
    host: env.HOST || '0.0.0.0',
    port: Number(env.PORT || 8000),
    gpioEnabled: parseBoolean(env.GPIO_ENABLED),
    databasePath: env.DATABASE_PATH || path.join(backendDirectory, 'data', 'smart-home.db'),
    frontendDist: env.FRONTEND_DIST || path.join(projectDirectory, 'dist'),
    corsOrigins: String(env.CORS_ORIGINS || '*').split(',').map((origin) => origin.trim()).filter(Boolean),
  };
}

export { projectDirectory };
