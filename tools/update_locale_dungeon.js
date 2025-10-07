const fs = require('fs');
const path = require('path');
const recast = require('recast');
const parser = require('recast/parsers/babel');

const enData = JSON.parse(fs.readFileSync('/tmp/dungeon_locale_en.json', 'utf8'));
const jaData = JSON.parse(fs.readFileSync('/tmp/dungeon_locale_ja.json', 'utf8'));

function toAst(value, b) {
  if (value === null) return b.nullLiteral();
  if (Array.isArray(value)) {
    return b.arrayExpression(value.map(v => toAst(v, b)));
  }
  switch (typeof value) {
    case 'string':
      return b.stringLiteral(value);
    case 'number':
      return b.numericLiteral(value);
    case 'boolean':
      return b.booleanLiteral(value);
    case 'object': {
      const props = Object.entries(value).map(([key, val]) => b.objectProperty(b.stringLiteral(key), toAst(val, b)));
      return b.objectExpression(props);
    }
    default:
      return b.stringLiteral(String(value));
  }
}

function updateFile(filePath, localeKey, data) {
  const source = fs.readFileSync(filePath, 'utf8');
  const ast = recast.parse(source, { parser });
  const { builders: b } = recast.types;

  recast.visit(ast, {
    visitAssignmentExpression(path) {
      const { node } = path;
      if (
        node.left.type === 'MemberExpression' &&
        node.left.object.type === 'Identifier' &&
        node.left.object.name === 'store' &&
        ((node.left.property.type === 'StringLiteral' && node.left.property.value === localeKey) ||
          (node.left.property.type === 'Literal' && node.left.property.value === localeKey))
      ) {
        if (node.right.type === 'ObjectExpression') {
          const dungeonPropIndex = node.right.properties.findIndex(
            prop => prop.type === 'ObjectProperty' &&
              ((prop.key.type === 'Identifier' && prop.key.name === 'dungeon') ||
               (prop.key.type === 'StringLiteral' && prop.key.value === 'dungeon'))
          );
          const dungeonProp = b.objectProperty(b.identifier('dungeon'), toAst(data, b));
          if (dungeonPropIndex >= 0) {
            node.right.properties[dungeonPropIndex] = dungeonProp;
          } else {
            // insert before achievements if exists
            const achievementsIndex = node.right.properties.findIndex(prop =>
              prop.type === 'ObjectProperty' &&
              ((prop.key.type === 'Identifier' && prop.key.name === 'achievements') ||
                (prop.key.type === 'StringLiteral' && prop.key.value === 'achievements'))
            );
            if (achievementsIndex >= 0) {
              node.right.properties.splice(achievementsIndex, 0, dungeonProp);
            } else {
              node.right.properties.push(dungeonProp);
            }
          }
        }
      }
      this.traverse(path);
    }
  });

  const output = recast.print(ast, { lineTerminator: '\n' }).code;
  fs.writeFileSync(filePath, output);
}

const baseDir = path.join(__dirname, '..', 'js', 'i18n', 'locales');
updateFile(path.join(baseDir, 'en.json.js'), 'en', enData);
updateFile(path.join(baseDir, 'ja.json.js'), 'ja', jaData);
