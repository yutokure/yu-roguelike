const fs = require('fs');
const path = require('path');
const recast = require('recast');
const parser = require('recast/parsers/babel');

const BASE_DIR = path.join(__dirname, '..');
const DUNGEON_DIR = path.join(BASE_DIR, 'dungeontypes');
const BLOCKDATA_JSON = path.join(BASE_DIR, 'blockdata.json');

function sanitizeId(id) {
  return id.replace(/[^A-Za-z0-9]+/g, '_').toLowerCase();
}

function isIdentifierName(node, name) {
  if (!node) return false;
  if (node.type === 'Identifier') return node.name === name;
  if (node.type === 'Literal' || node.type === 'StringLiteral') return node.value === name;
  return false;
}

function findProperty(obj, name) {
  return obj.properties.find(prop => prop.type === 'ObjectProperty' && isIdentifierName(prop.key, name));
}

function literalValue(node) {
  if (!node) return null;
  if (node.type === 'StringLiteral' || node.type === 'Literal') return node.value;
  return null;
}

function extractFromFile(filePath, packs, types, tags) {
  const source = fs.readFileSync(filePath, 'utf8');
  const ast = recast.parse(source, { parser });

  recast.visit(ast, {
    visitCallExpression(path) {
      const { node } = path;
      const callee = node.callee;
      if (callee && ((callee.type === 'MemberExpression' && callee.object.type === 'Identifier' && callee.object.name === 'window' && isIdentifierName(callee.property, 'registerDungeonAddon')) || (callee.type === 'Identifier' && callee.name === 'registerDungeonAddon'))) {
        const firstArg = node.arguments[0];
        let obj = null;
        if (firstArg && firstArg.type === 'ObjectExpression') obj = firstArg;
        else if (firstArg && firstArg.type === 'Identifier') {
          const binding = path.scope.lookup(firstArg.name);
          if (binding && binding.declarations && binding.declarations.length) {
            const decl = binding.declarations[0].parentPath.node;
            if (decl && decl.init && decl.init.type === 'ObjectExpression') obj = decl.init;
          }
        }
        if (obj) {
          const idProp = findProperty(obj, 'id');
          const nameProp = findProperty(obj, 'name');
          const descProp = findProperty(obj, 'description');
          const id = idProp ? literalValue(idProp.value) : null;
          const name = nameProp ? literalValue(nameProp.value) : null;
          const description = descProp ? literalValue(descProp.value) : null;
          if (id && name) {
            packs[sanitizeId(id)] = { id, name, description: description || null };
          }
        }
      }
      this.traverse(path);
    },
    visitObjectExpression(path) {
      const obj = path.node;
      const idProp = findProperty(obj, 'id');
      const nameProp = findProperty(obj, 'name');
      const algorithmProp = findProperty(obj, 'algorithm') || findProperty(obj, 'create') || findProperty(obj, 'generator');
      const mixinProp = findProperty(obj, 'mixin');
      if (idProp && nameProp && algorithmProp) {
        const id = literalValue(idProp.value);
        const name = literalValue(nameProp.value);
        if (id && name) {
          const typeKey = sanitizeId(id);
          if (!types[typeKey]) types[typeKey] = { id, name, description: null, blocks: {}, tags: [] };
          const descProp = findProperty(obj, 'description');
          if (descProp) {
            const description = literalValue(descProp.value);
            if (description) types[typeKey].description = description;
          }
          if (mixinProp && mixinProp.value && mixinProp.value.type === 'ObjectExpression') {
            const mixinObj = mixinProp.value;
            const tagsProp = findProperty(mixinObj, 'tags');
            if (tagsProp && tagsProp.value.type === 'ArrayExpression') {
              tagsProp.value.elements.forEach(el => {
                if (!el) return;
                const tag = literalValue(el);
                if (tag) {
                  if (!types[typeKey].tags.includes(tag)) types[typeKey].tags.push(tag);
                  tags.add(tag);
                }
              });
            }
          }
        }
      } else {
        const keyProp = findProperty(obj, 'key');
        const typeProp = findProperty(obj, 'type');
        if (keyProp && nameProp && typeProp) {
          const blockKey = literalValue(keyProp.value);
          const blockName = literalValue(nameProp.value);
          const blockType = literalValue(typeProp.value);
          if (blockKey && blockName && blockType) {
            const typeKey = sanitizeId(blockType);
            if (!types[typeKey]) {
              types[typeKey] = { id: blockType, name: null, description: null, blocks: {}, tags: [] };
            }
            const blocks = types[typeKey].blocks;
            if (!blocks[blockKey]) blocks[blockKey] = { key: blockKey, name: blockName, description: null };
            const descProp = findProperty(obj, 'description');
            if (descProp) {
              const description = literalValue(descProp.value);
              if (description) blocks[blockKey].description = description;
            }
          }
        }
      }
      this.traverse(path);
    }
  });
}

function main() {
  const files = fs.readdirSync(DUNGEON_DIR).filter(f => f.endsWith('.js') && f !== 'manifest.json.js');
  const packs = {};
  const types = {};
  const tags = new Set();

  files.forEach(file => {
    extractFromFile(path.join(DUNGEON_DIR, file), packs, types, tags);
  });

  const blockData = JSON.parse(fs.readFileSync(BLOCKDATA_JSON, 'utf8'));
  const blockDim = {};
  Object.keys(blockData).forEach(section => {
    if (!/^blocks\d+$/i.test(section)) return;
    const list = blockData[section];
    if (!Array.isArray(list)) return;
    list.forEach(entry => {
      if (!entry || typeof entry !== 'object') return;
      if (!entry.key || !entry.name) return;
      blockDim[entry.key] = { key: entry.key, name: entry.name, description: entry.description || null };
    });
  });

  const output = {
    packs,
    types,
    tags: Array.from(tags).sort(),
    blockDim
  };

  console.log(JSON.stringify(output, null, 2));
}

if (require.main === module) {
  main();
}
