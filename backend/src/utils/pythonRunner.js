import { execSync } from 'child_process';
import { PREFERRED_PYTHON_PATH } from '../config/index.js';

/**
 * Determines the best available Python command to use.
 * Priority: Conda feature-extractor env → system python / python3 / py
 * @returns {string} The Python executable path or command name.
 */
export function getPythonCommand() {
  // 1. Try the preferred Anaconda env first
  try {
    execSync(`"${PREFERRED_PYTHON_PATH}" --version`, { stdio: 'ignore' });
    console.log('[Python] Using feature-extractor conda environment.');
    return PREFERRED_PYTHON_PATH;
  } catch {
    console.warn('[Python] Preferred environment not found, falling back to system Python...');
  }

  // 2. Fall back to whatever is on PATH
  const fallbacks = ['python', 'python3', 'py'];
  for (const cmd of fallbacks) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' });
      console.log(`[Python] Using system command: ${cmd}`);
      return cmd;
    } catch {
      // try next
    }
  }

  console.warn('[Python] No Python found — defaulting to "python" and hoping for the best.');
  return 'python';
}
