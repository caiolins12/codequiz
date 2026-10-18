const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { transformSync } = require('next/dist/build/swc');

// Use the same JSX compiler as the app. Only the remote repository boundary is
// replaced, so the tests execute the real helpers, schedules and match engine.
function createAppLoader(repositoryOverrides = {}) {
  const root = path.resolve(__dirname, '../..');
  const sourceRoot = path.join(root, 'src', 'codequiz');
  const repositoryPath = path.join(sourceRoot, 'lib', 'repository.js');
  const cache = new Map();
  const repository = new Proxy({
    __esModule: true,
    isSystemBotUserId: (id) => /^bot_sys_codequiz_[A-Za-z0-9_]+$/.test(String(id || '').trim()),
    getSystemBotDefaultStrength: () => 'medio',
    ...repositoryOverrides
  }, {
    get(target, key) {
      if (key in target) return target[key];
      return () => {
        throw new Error(`Unexpected repository access in a match test: ${String(key)}`);
      };
    }
  });

  function load(filePath) {
    const filename = require.resolve(path.resolve(root, filePath));
    if (filename === repositoryPath) return repository;
    if (!filename.startsWith(`${sourceRoot}${path.sep}`)) return require(filename);
    if (cache.has(filename)) return cache.get(filename).exports;

    const loaded = new Module(filename, module);
    loaded.filename = filename;
    loaded.paths = Module._nodeModulePaths(path.dirname(filename));
    cache.set(filename, loaded);
    loaded.require = (specifier) => {
      if (!specifier.startsWith('.')) return require(require.resolve(specifier, { paths: loaded.paths }));
      return load(path.resolve(path.dirname(filename), specifier));
    };
    const { code } = transformSync(fs.readFileSync(filename, 'utf8'), {
      filename,
      jsc: {
        parser: { syntax: 'ecmascript', jsx: true },
        target: 'es2022',
        transform: { react: { runtime: 'automatic' } }
      },
      module: { type: 'commonjs' }
    });
    loaded._compile(code, filename);
    loaded.loaded = true;
    return loaded.exports;
  }

  return load;
}

module.exports = { createAppLoader };
