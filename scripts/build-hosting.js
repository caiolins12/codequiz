const { spawn } = require('child_process');
const path = require('path');

const SWC_WARNING_PATTERNS = [
  /Attempted to load .*@next[\\/]+swc-win32-x64-msvc/i,
  /next-swc\.win32-x64-msvc\.node/i
];

function shouldSuppressLine(line) {
  if (process.platform !== 'win32') return false;
  return SWC_WARNING_PATTERNS.some((pattern) => pattern.test(line));
}

function streamWithFilter(stream, writer, onDone) {
  let pending = '';
  stream.on('data', (chunk) => {
    const text = pending + String(chunk || '');
    const lines = text.split(/\r?\n/);
    pending = lines.pop() || '';
    lines.forEach((line) => {
      if (!shouldSuppressLine(line)) writer.write(`${line}\n`);
    });
  });
  stream.on('end', () => {
    if (pending && !shouldSuppressLine(pending)) writer.write(`${pending}\n`);
    onDone();
  });
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      shell: false
    });

    let stdoutEnded = false;
    let stderrEnded = false;
    const maybeResolve = () => {
      if (stdoutEnded && stderrEnded) resolve();
    };

    streamWithFilter(child.stdout, process.stdout, () => {
      stdoutEnded = true;
      maybeResolve();
    });
    streamWithFilter(child.stderr, process.stderr, () => {
      stderrEnded = true;
      maybeResolve();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
      }
    });
  });
}

async function main() {
  const nodeBin = process.execPath;
  const generateScript = path.join('scripts', 'generate-build-meta.js');
  const nextCli = path.join('node_modules', 'next', 'dist', 'bin', 'next');

  await run(nodeBin, [generateScript]);
  await run(nodeBin, [nextCli, 'build']);
}

main().catch((error) => {
  process.stderr.write(`${error?.message || error}\n`);
  process.exit(1);
});
