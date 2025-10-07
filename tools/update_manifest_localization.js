const fs = require('fs');
const path = require('path');
const recast = require('recast');
const parser = require('recast/parsers/babel');

const { builders: b } = recast.types;

const BASE_DIR = path.join(__dirname, '..');
const manifestPath = path.join(BASE_DIR, 'dungeontypes', 'manifest.json.js');

function isIdentifierName(node, name) {
  if (!node) return false;
  if (node.type === 'Identifier') return node.name === name;
  if (node.type === 'Literal' || node.type === 'StringLiteral') return node.value === name;
  return false;
}

function findProperty(obj, name) {
  return obj.properties.find(prop => prop.type === 'ObjectProperty' && isIdentifierName(prop.key, name));
}

function sanitizeId(id) {
  return id.replace(/[^A-Za-z0-9]+/g, '_').toLowerCase();
}

function ensureProperty(obj, key, value, afterKey) {
  if (findProperty(obj, key)) return;
  const prop = b.objectProperty(b.identifier(key), b.stringLiteral(value));
  if (afterKey) {
    const idx = obj.properties.findIndex(prop => prop.type === 'ObjectProperty' && isIdentifierName(prop.key, afterKey));
    if (idx >= 0) {
      obj.properties.splice(idx + 1, 0, prop);
      return;
    }
  }
  obj.properties.push(prop);
}

function removeProperty(obj, key) {
  const idx = obj.properties.findIndex(prop => prop.type === 'ObjectProperty' && isIdentifierName(prop.key, key));
  if (idx >= 0) obj.properties.splice(idx, 1);
}

function main() {
  const source = fs.readFileSync(manifestPath, 'utf8');
  const ast = recast.parse(source, { parser });

  recast.visit(ast, {
    visitAssignmentExpression(path) {
      const { node } = path;
      if (node.left.type === 'MemberExpression' && node.left.object.type === 'Identifier' && node.left.object.name === 'window' && isIdentifierName(node.left.property, 'DUNGEONTYPE_MANIFEST')) {
        const right = node.right;
        if (right.type === 'ArrayExpression') {
          right.elements.forEach(element => {
            if (!element || element.type !== 'ObjectExpression') return;
            const idProp = findProperty(element, 'id');
            if (!idProp || idProp.value.type !== 'StringLiteral') return;
            const packId = sanitizeId(idProp.value.value);
            ensureProperty(element, 'nameKey', `dungeon.packs.${packId}.name`, 'name');
            if (findProperty(element, 'description')) {
              ensureProperty(element, 'descriptionKey', `dungeon.packs.${packId}.description`, 'description');
            } else {
              removeProperty(element, 'descriptionKey');
            }
          });
        }
      }
      this.traverse(path);
    }
  });

  const output = recast.print(ast, { lineTerminator: '\n' }).code;
  fs.writeFileSync(manifestPath, output);
}

if (require.main === module) {
  main();
}
