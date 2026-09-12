// Test suite for TAGrafia-WEB
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log("=== 1. Validando Sintaxe dos Arquivos JS ===");
const jsFiles = [
  "config.js",
  "state.js",
  "data_manager.js",
  "sketch.js",
  "ui_left.js",
  "ui_right.js",
  "ui_center.js",
  "ui_timeline.js",
];

for (const file of jsFiles) {
  const filePath = path.join(ROOT_DIR, file);
  try {
    execSync(`node -c "${filePath}"`, { stdio: "pipe" });
    assert(true, `${file} tem sintaxe JS válida`);
  } catch (err) {
    assert(false, `${file} tem erro de sintaxe: ${err.message}`);
  }
}

console.log("\n=== 2. Validando Existência dos Arquivos de Dados e Fontes ===");
const dataFiles = [
  "data/Produtos brasileiros.tsv",
  "data/Produtos internacionais.tsv",
  "data/Escolas.tsv",
  "data/custom.geo.json",
  "data/image-manifest.json",
  "data/Fontes/AfacadFlux-VariableFont_slnt,wght.ttf",
  "data/Fontes/Roboto-VariableFont_wdth,wght.ttf",
  "data/Fontes/RobotoCondensed-VariableFont_wght.ttf",
];

for (const df of dataFiles) {
  const p = path.join(ROOT_DIR, df);
  assert(fs.existsSync(p), `Arquivo existe: ${df}`);
}

console.log("\n=== 3. Validando Configurações e Registros ===");
const vm = require("vm");
// Carrega config.js no contexto global
const configContent = fs.readFileSync(path.join(ROOT_DIR, "config.js"), "utf8");
vm.runInThisContext(configContent);

assert(typeof ICONS_CONFIG === "object" && ICONS_CONFIG !== null, "ICONS_CONFIG está definido");
if (typeof ICONS_CONFIG === "object" && ICONS_CONFIG !== null) {
  let allIconsExist = true;
  for (const [key, iconPath] of Object.entries(ICONS_CONFIG)) {
    const fullPath = path.join(ROOT_DIR, iconPath);
    if (!fs.existsSync(fullPath)) {
      allIconsExist = false;
      console.error(`    Arquivo de ícone não encontrado: ${iconPath} (chave: ${key})`);
    }
  }
  assert(allIconsExist, "Todos os ícones em ICONS_CONFIG existem no disco");
}

assert(typeof DIMENSIONS === "object", "DIMENSIONS está definido");
assert(Array.isArray(DIMENSION_ORDER), "DIMENSION_ORDER é um array");
for (const dim of DIMENSION_ORDER) {
  assert(
    DIMENSIONS[dim] && DIMENSIONS[dim].color && DIMENSIONS[dim].pastelColor,
    `Dimensão '${dim}' possui color e pastelColor definidos`,
  );
}

assert(Array.isArray(VIEWS_CONFIG), "VIEWS_CONFIG está definido");
assert(VIEWS_CONFIG.length === 4, "VIEWS_CONFIG contém as 4 visualizações");

console.log("\n=== 4. Validando Parsing e Estrutura de Dados ===");
// Mock básico para simular funções auxiliares de sketch/p5 necessárias em data_manager
global.cleanText = (str) => String(str ?? "").trim();
global.normalizeText = (str) =>
  String(str ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
global.color = (c) => c;

const stateContent = fs.readFileSync(path.join(ROOT_DIR, "state.js"), "utf8");
vm.runInThisContext(stateContent);

const dmContent = fs.readFileSync(path.join(ROOT_DIR, "data_manager.js"), "utf8");
vm.runInThisContext(dmContent);

// Carrega os TSVs reais para teste
sourceLines.productsBR = fs
  .readFileSync(path.join(ROOT_DIR, DATA_PATHS.productsBR), "utf8")
  .split(/\r?\n/);
sourceLines.productsIntl = fs
  .readFileSync(path.join(ROOT_DIR, DATA_PATHS.productsIntl), "utf8")
  .split(/\r?\n/);
sourceLines.schools = fs
  .readFileSync(path.join(ROOT_DIR, DATA_PATHS.schools), "utf8")
  .split(/\r?\n/);

buildData();

assert(products.length > 0, `Produtos carregados com sucesso: ${products.length} itens`);
assert(tagsByKey.size > 0, `Tags indexadas com sucesso: ${tagsByKey.size} tags únicas`);

const brCount = products.filter((p) => p.origin === "brasileiro").length;
const intlCount = products.filter((p) => p.origin === "internacional").length;
assert(brCount > 0 && intlCount > 0, `Mix de origens: ${brCount} BR, ${intlCount} Intl`);

for (const dim of DIMENSION_ORDER) {
  const count = (tagsByDimension[dim] || []).length;
  assert(count > 0, `Tags por dimensão '${dim}': ${count} tags`);
}

console.log("\n=== 5. Validando Sistema de Produção ===");
if (typeof getProductionInfo === "function") {
  const pArtesanal = getProductionInfo("Produto artesanal feito à mão");
  assert(pArtesanal.iconKey === "artesanal", "getProductionInfo identifica 'artesanal'");
  const pIndustrial = getProductionInfo("Fabricação industrial em série");
  assert(pIndustrial.iconKey === "industrial", "getProductionInfo identifica 'industrial'");
  const pAssinado = getProductionInfo("Design assinado edição limitada");
  assert(pAssinado.iconKey === "assinado", "getProductionInfo identifica 'assinado'");
}

console.log("\n=== 6. Validando Funções de Obras Salvas e Ordenação ===");
// Carrega ui_right.js
const uiRightContent = fs.readFileSync(path.join(ROOT_DIR, "ui_right.js"), "utf8");
// Mock p5 globals needed by ui_right
global.productType = (p) => p && p.tagsByDimension.tipo_obra.length ? p.tagsByDimension.tipo_obra[0].label : "";
global.layoutScale = () => 1;
global.productPanelX = () => 500;
global.productPanelW = () => 350;
vm.runInThisContext(uiRightContent);

// Testa salvar 2 produtos
savedProductKeys = new Set([products[0].key, products[1].key]);
assert(savedProductsFiltered().length === 2, "savedProductsFiltered retorna as obras salvas");

// Testa busca em obras salvas
savedSearch = products[0].name.slice(0, 4);
assert(savedProductsFiltered().some((p) => p.key === products[0].key), "Busca filtra obras salvas por nome");
savedSearch = "";

// Testa ordenação de obras salvas por Ano e Nome
savedSortMode = 1; // Ano
const sortedByYear = savedProductsFiltered();
assert(sortedByYear[0].year <= sortedByYear[1].year, "Ordenação por ano funciona corretamente");

savedSortMode = 0; // Nome
const sortedByName = savedProductsFiltered();
assert(sortedByName[0].name.localeCompare(sortedByName[1].name, "pt-BR") <= 0, "Ordenação por nome funciona");

console.log("\n==========================================");
console.log(`Resultado dos Testes: ${passed} passaram, ${failed} falharam.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log("Todos os testes passaram com sucesso!");
}
