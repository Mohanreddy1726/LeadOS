import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'meta-sync.log');

export function logMetaSync(message: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;

  try {
    fs.appendFileSync(LOG_FILE, logMessage, 'utf8');
  } catch (err) {
    console.error('Failed to write to meta-sync log file:', err);
  }

  // Also keep console logging for terminal visibility
  if (level === 'ERROR') {
    console.error(message);
  } else if (level === 'WARN') {
    console.warn(message);
  } else {
    console.log(message);
  }
}
