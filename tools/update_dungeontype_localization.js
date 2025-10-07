const fs = require('fs');
const path = require('path');
const recast = require('recast');
const parser = require('recast/parsers/babel');

const { builders: b } = recast.types;

const BASE_DIR = path.join(__dirname, '..');
const DUNGEON_DIR = path.join(BASE_DIR, 'dungeontypes');

function isIdentifierName(node, name) {
  if (!node) return false;
  if (node.type === 'Identifier') return node.name === name;
  if (node.type === 'Literal') return node.value === name;
  if (node.type === 'StringLiteral') return node.value === name;
  return false;
}

function findProperty(obj, name) {
  return obj.properties.find(prop => prop.type === 'ObjectProperty' && isIdentifierName(prop.key, name));
}

function sanitizeId(id) {
  return id.replace(/[^A-Za-z0-9]+/g, '_');
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
  if (idx >= 0) {
    obj.properties.splice(idx, 1);
  }
}

function processFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const ast = recast.parse(source, { parser });

  recast.visit(ast, {
    visitCallExpression(path) {
      const { node } = path;
      const callee = node.callee;
      if (callee && ((callee.type === 'MemberExpression' && callee.object && callee.object.type === 'Identifier' && callee.object.name === 'window' && callee.property && callee.property.type === 'Identifier' && callee.property.name === 'registerDungeonAddon')
        || (callee.type === 'Identifier' && callee.name === 'registerDungeonAddon'))) {
        const firstArg = node.arguments && node.arguments[0];
        if (firstArg && firstArg.type === 'ObjectExpression') {
          const idProp = findProperty(firstArg, 'id');
          if (idProp && idProp.value && idProp.value.type === 'StringLiteral') {
            const packId = idProp.value.value;
            const packKeyBase = sanitizeId(packId).toLowerCase();
            ensureProperty(firstArg, 'nameKey', `dungeon.packs.${packKeyBase}.name`, 'name');
            if (findProperty(firstArg, 'description')) {
              ensureProperty(firstArg, 'descriptionKey', `dungeon.packs.${packKeyBase}.description`, 'description');
            } else {
              removeProperty(firstArg, 'descriptionKey');
            }
          }
        } else if (firstArg && firstArg.type === 'Identifier') {
          // find variable declaration with same name
          const name = firstArg.name;
          const bindingPath = path.scope.lookup(name);
          if (bindingPath && bindingPath.declarations && bindingPath.declarations.length) {
            const decl = bindingPath.declarations[0].parentPath.node;
            if (decl && decl.init && decl.init.type === 'ObjectExpression') {
              const obj = decl.init;
              const idProp = findProperty(obj, 'id');
              if (idProp && idProp.value && idProp.value.type === 'StringLiteral') {
                const packId = idProp.value.value;
                const packKeyBase = sanitizeId(packId).toLowerCase();
                ensureProperty(obj, 'nameKey', `dungeon.packs.${packKeyBase}.name`, 'name');
                if (findProperty(obj, 'description')) {
                  ensureProperty(obj, 'descriptionKey', `dungeon.packs.${packKeyBase}.description`, 'description');
                } else {
                  removeProperty(obj, 'descriptionKey');
                }
              }
            }
          }
        }
      }
      this.traverse(path);
    },
    visitObjectExpression(path) {
      const obj = path.node;
      const idProp = findProperty(obj, 'id');
      const nameProp = findProperty(obj, 'name');
      const keyProp = findProperty(obj, 'key');

      if (idProp && nameProp && (findProperty(obj, 'algorithm') || findProperty(obj, 'generator') || findProperty(obj, 'create') || findProperty(obj, 'mixin'))) {
        if (idProp.value.type === 'StringLiteral') {
          const typeId = idProp.value.value;
          const typeKeyBase = sanitizeId(typeId).toLowerCase();
          ensureProperty(obj, 'nameKey', `dungeon.types.${typeKeyBase}.name`, 'name');
          if (findProperty(obj, 'description')) {
            ensureProperty(obj, 'descriptionKey', `dungeon.types.${typeKeyBase}.description`, 'description');
          }
        }
      } else if (keyProp && nameProp && findProperty(obj, 'type')) {
        const typeField = findProperty(obj, 'type');
        if (keyProp.value.type === 'StringLiteral' && typeField.value.type === 'StringLiteral') {
          const blockKey = keyProp.value.value;
          const blockType = typeField.value.value;
          const typeKeyBase = sanitizeId(blockType).toLowerCase();
          ensureProperty(obj, 'nameKey', `dungeon.types.${typeKeyBase}.blocks.${blockKey}.name`, 'name');
          if (findProperty(obj, 'description')) {
            ensureProperty(obj, 'descriptionKey', `dungeon.types.${typeKeyBase}.blocks.${blockKey}.description`, 'description');
          }
        }
      }

      this.traverse(path);
    }
  });

  const output = recast.print(ast, { lineTerminator: '\n' }).code;
  fs.writeFileSync(filePath, output);
}

function main() {
  const files = fs.readdirSync(DUNGEON_DIR).filter(f => f.endsWith('.js') && f !== 'manifest.json.js');
  files.forEach(file => {
    const fullPath = path.join(DUNGEON_DIR, file);
    processFile(fullPath);
  });
}

if (require.main === module) {
  main();
}
