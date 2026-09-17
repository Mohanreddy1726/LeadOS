import dbConnect from './db';
import SyncLog from './models/SyncLog';

export async function logMetaSync(message: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') {
  try {
    await dbConnect();
    await SyncLog.create({
      level,
      message,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error('Failed to write to SyncLog database:', err);
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
