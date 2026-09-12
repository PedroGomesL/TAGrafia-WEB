const fs = require('fs');
const data = JSON.parse(fs.readFileSync('figma_node_left.json', 'utf8'));
function extractInfo(node, depth = 0) {
  let indent = '  '.repeat(depth);
  let colorInfo = '';
  if (node.fills && node.fills.length > 0 && node.fills[0].color) {
    const c = node.fills[0].color;
    colorInfo = ` fill:#${Math.round(c.r*255).toString(16).padStart(2,'0')}${Math.round(c.g*255).toString(16).padStart(2,'0')}${Math.round(c.b*255).toString(16).padStart(2,'0')}`;
  }
  let strokeInfo = '';
  if (node.strokes && node.strokes.length > 0 && node.strokes[0].color) {
    const c = node.strokes[0].color;
    strokeInfo = ` stroke:#${Math.round(c.r*255).toString(16).padStart(2,'0')}${Math.round(c.g*255).toString(16).padStart(2,'0')}${Math.round(c.b*255).toString(16).padStart(2,'0')}`;
  }
  let box = node.absoluteBoundingBox;
  let boxInfo = box ? ` x:${Math.round(box.x)} y:${Math.round(box.y)} w:${Math.round(box.width)} h:${Math.round(box.height)}` : '';
  let textInfo = node.characters ? ` '${node.characters.replace(/\n/g, '\\n')}'` : '';
  console.log(`${indent}${node.type} [${node.name}]${boxInfo}${colorInfo}${strokeInfo}${textInfo}`);
  if (node.children) {
    node.children.forEach(child => extractInfo(child, depth + 1));
  }
}
const nodes = data.nodes;
if (nodes) {
  for (let key in nodes) {
    extractInfo(nodes[key].document);
  }
}
