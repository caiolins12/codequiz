const assert = require('node:assert/strict');
const fs = require('node:fs');
const { parse } = require('next/dist/build/swc');

function hasCall(node, name) {
  if (!node || typeof node !== 'object') return false;
  if (node.type === 'CallExpression' && node.callee?.type === 'Identifier' && node.callee.value === name) return true;
  return Object.values(node).some((value) => Array.isArray(value)
    ? value.some((entry) => hasCall(entry, name))
    : hasCall(value, name));
}

// Exercise the component's actual functions and effects without mounting its
// unrelated authentication, audio, storage and network integrations. SWC spans
// select original source bytes; none of the callbacks are copied into tests.
async function loadComponentFragments(filename) {
  const bytes = fs.readFileSync(filename);
  const ast = await parse(bytes.toString('utf8'), { filename });
  const component = ast.body.find((node) => node.type === 'ExportDefaultDeclaration')?.decl;
  assert.ok(component?.body?.stmts, 'expected the exported app component');
  const statements = component.body.stmts;
  const evaluate = (node, scope) => {
    const source = bytes.subarray(node.span.start - 1, node.span.end - 1).toString('utf8');
    return new Function('scope', `with (scope) { return (${source}); }`)(scope);
  };

  return {
    functionNamed(name, scope) {
      const matches = statements.filter((node) => node.type === 'FunctionDeclaration' && node.identifier?.value === name);
      assert.equal(matches.length, 1, `expected one real ${name} function`);
      return evaluate(matches[0], scope);
    },
    effectCalling(name, scope) {
      const matches = statements.filter((node) => node.type === 'ExpressionStatement'
        && node.expression?.type === 'CallExpression'
        && node.expression.callee?.value === 'useEffect'
        && hasCall(node.expression.arguments[0]?.expression, name));
      assert.equal(matches.length, 1, `expected one real useEffect calling ${name}`);
      return evaluate(matches[0].expression.arguments[0].expression, scope);
    }
  };
}

module.exports = { loadComponentFragments };
