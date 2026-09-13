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
assert(FILTER_HEADER_H === 58, `FILTER_HEADER_H está alinhado com o respiro de 58px do Sobre (obtido: ${FILTER_HEADER_H})`);
assert(DIMENSIONS.tipo_obra.gridY === 58 && DIMENSIONS.material.gridY === 58, "Cards superiores de filtros iniciam em y = 58");
assert(DIMENSIONS.estetico.gridY === 158 && DIMENSIONS.tecnicas.gridY === 158, "Cards inferiores de filtros iniciam em y = 158");

assert(Array.isArray(VIEWS_CONFIG), "VIEWS_CONFIG está definido");
assert(VIEWS_CONFIG.length === 4, "VIEWS_CONFIG contém as 4 visualizações");

assert(Array.isArray(NAV_CONFIG), "NAV_CONFIG é um array");
assert(NAV_CONFIG.length === 4, "NAV_CONFIG contém 4 itens de navegação");
for (const nav of NAV_CONFIG) {
  assert(nav.id && nav.label && typeof nav.y === "number", `Item de navegação '${nav.id}' é válido`);
  if (["filtros", "exportar", "sobre"].includes(nav.id)) {
    assert(nav.iconSize === 30, `Item de navegação '${nav.id}' possui tamanho reduzido iconSize === 30 (obtido: ${nav.iconSize})`);
  }
}

assert(Array.isArray(DETAIL_TABS), "DETAIL_TABS é um array");
assert(DETAIL_TABS.length === 3, "DETAIL_TABS contém 3 dimensões para o painel de detalhes");

assert(Array.isArray(EXPORT_FORMATS), "EXPORT_FORMATS é um array");
assert(EXPORT_FORMATS.includes("PDF") && EXPORT_FORMATS.includes("JPG") && EXPORT_FORMATS.includes("SVG"), "EXPORT_FORMATS suporta PDF, JPG e SVG");
assert(typeof TIMELINE_TRACK_INSET === "number" && TIMELINE_TRACK_INSET > 0, "TIMELINE_TRACK_INSET é um número positivo");

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
  assert(pArtesanal.tooltip === "Artesanal", "Tooltip de artesanal é 'Artesanal'");
  const pIndustrial = getProductionInfo("Fabricação industrial em série");
  assert(pIndustrial.iconKey === "industrial", "getProductionInfo identifica 'industrial'");
  assert(pIndustrial.tooltip === "Industrial", "Tooltip de industrial é 'Industrial'");
  const pAssinado = getProductionInfo("Design assinado edição limitada");
  assert(pAssinado.iconKey === "assinado", "getProductionInfo identifica 'assinado'");
  assert(pAssinado.tooltip === "Design assinado", "Tooltip de assinado é 'Design assinado'");
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

console.log("\n=== 7. Validando Limites da Timeline (ui_timeline.js) ===");
global.visualX = () => 100;
global.visualW = () => 800;
global.height = 600;
global.map = (v, a, b, c, d) => c + ((v - a) / (b - a)) * (d - c);
global.constrain = (v, min, max) => Math.min(Math.max(v, min), max);

const uiTimelineContent = fs.readFileSync(path.join(ROOT_DIR, "ui_timeline.js"), "utf8");
vm.runInThisContext(uiTimelineContent);

assert(typeof timelineTrackBounds === "function", "timelineTrackBounds está definida");
const bounds = timelineTrackBounds();
assert(bounds.tx === 140, `timelineTrackBounds.tx é 140 (visualX + 40), obtido: ${bounds.tx}`);
assert(bounds.tw === 720, `timelineTrackBounds.tw é 720 (visualW - 80), obtido: ${bounds.tw}`);
assert(bounds.ty === 600 - TIMELINE_H / 2, `timelineTrackBounds.ty está no centro da timeline: ${bounds.ty}`);

const x1880 = yearToX(YEAR_MIN);
const x2010 = yearToX(YEAR_MAX);
assert(x1880 === bounds.tx, "yearToX(1880) mapeia para o início do track");
assert(x2010 === bounds.tx + bounds.tw, "yearToX(2010) mapeia para o fim do track");
assert(xToYear(bounds.tx) === 1880, "xToYear reverte início para 1880");
assert(xToYear(bounds.tx + bounds.tw) === 2010, "xToYear reverte fim para 2010");

console.log("\n=== 8. Validando Despacho Declarativo de Visões (ui_center.js) ===");
// Mock canvas drawingContext and missing p5 helpers for ui_center
global.drawingContext = {
  save: () => {},
  beginPath: () => {},
  rect: () => {},
  clip: () => {},
  restore: () => {},
};
global.fontes = {
  afacad: {},
  robotoCondensed: {},
  roboto: {},
};
global.selectedTags = () => [];
global.visibleProducts = () => [];
global.productsShownInCircular = () => [];
global.themeLineColor = () => "#000000";
global.colorAlpha = (c, a) => c;
global.noStroke = () => {};
global.fill = () => {};
global.textFont = () => {};
global.textSize = () => {};
global.textAlign = () => {};
global.text = () => {};

const uiCenterContent = fs.readFileSync(path.join(ROOT_DIR, "ui_center.js"), "utf8");
vm.runInThisContext(uiCenterContent);

assert(typeof VIEW_RENDERERS === "object" && VIEW_RENDERERS !== null, "VIEW_RENDERERS está definido");
for (const view of VIEWS_CONFIG) {
  assert(
    typeof VIEW_RENDERERS[view.id] === "function",
    `VIEW_RENDERERS possui função para a visão '${view.label}' (id: ${view.id})`,
  );
}

console.log("\n=== 9. Validando Novas Funções de UI e Dados (ui_right.js e ui_left.js) ===");
// Carrega ui_left.js
const uiLeftContent = fs.readFileSync(path.join(ROOT_DIR, "ui_left.js"), "utf8");
vm.runInThisContext(uiLeftContent);

// Teste de FONTS_CONFIG e STORAGE_KEYS
assert(typeof FONTS_CONFIG === "object" && FONTS_CONFIG !== null, "FONTS_CONFIG está definido");
for (const [fkey, fpath] of Object.entries(FONTS_CONFIG)) {
  assert(fs.existsSync(path.join(ROOT_DIR, fpath)), `Arquivo de fonte '${fkey}' existe: ${fpath}`);
}
assert(typeof STORAGE_KEYS === "object" && STORAGE_KEYS.savedProducts === "tagrafia-saved-products", "STORAGE_KEYS.savedProducts está configurado");

// Teste de getProductDetailsForDimension
assert(typeof getProductDetailsForDimension === "function", "getProductDetailsForDimension está definida");
const testProd = products[0];
const matDetails = getProductDetailsForDimension(testProd, "material");
assert(typeof matDetails === "string" && matDetails.length > 0, "getProductDetailsForDimension retorna descrição de material");
const tecDetails = getProductDetailsForDimension(testProd, "tecnicas");
assert(typeof tecDetails === "string" && tecDetails.length > 0, "getProductDetailsForDimension retorna descrição de técnicas");
const estDetails = getProductDetailsForDimension(testProd, "estetico");
assert(typeof estDetails === "string" && estDetails.length > 0, "getProductDetailsForDimension retorna descrição de estético");

// Teste de getFilterCategoryOptions
assert(typeof getFilterCategoryOptions === "function", "getFilterCategoryOptions está definida");
const catOpts = getFilterCategoryOptions("material");
assert(Array.isArray(catOpts) && catOpts.length >= 2, "getFilterCategoryOptions retorna opções de categorias para 'material'");
assert(catOpts[0].value === -2 && catOpts[1].value === -1, "Opções incluem 'Tags disponíveis' (-2) e 'Tags ativas' (-1)");

// Teste de drawProductHeaderTooltip
assert(typeof drawProductHeaderTooltip === "function", "drawProductHeaderTooltip está definida");

// Teste de drawCollapseButton
assert(typeof drawCollapseButton === "function", "drawCollapseButton está definida");

console.log("\n=== 10. Validando getCircularVisualProducts e countProductsWithTagInCurrentType (data_manager.js) ===");
vm.runInThisContext(dmContent);
assert(typeof getCircularVisualProducts === "function", "getCircularVisualProducts está definida");
const sampleTag = tagsByDimension.material[0];
selectedTagKeys.clear();
selectedTagKeys.add(sampleTag.key);
_cachedSelectedTags = null;
const circularItems = getCircularVisualProducts();
assert(Array.isArray(circularItems) && circularItems.length > 0, `getCircularVisualProducts retornou ${circularItems.length} itens para a tag '${sampleTag.label}'`);
assert(circularItems[0].product && circularItems[0].tags, "Itens circulares possuem product e tags associadas");

assert(typeof countProductsWithTagInCurrentType === "function", "countProductsWithTagInCurrentType está definida");
_cachedTagCounts = null;
const tagCount = countProductsWithTagInCurrentType(sampleTag);
assert(tagCount > 0, `countProductsWithTagInCurrentType retornou contagem correta (${tagCount}) para a tag '${sampleTag.label}'`);
selectedTagKeys.clear();
_cachedSelectedTags = null;
_cachedTagCounts = null;

console.log("\n=== 11. Validando Sistema de Interatividade, Animações e Cursores ===");
// Carrega sketch.js
global.HAND = "pointer";
global.TEXT = "text";
global.ARROW = "default";
const sketchContent = fs.readFileSync(path.join(ROOT_DIR, "sketch.js"), "utf8");
vm.runInThisContext(sketchContent);
assert(typeof requestCursor === "function", "requestCursor está definida");
currentFrameCursor = global.ARROW;
requestCursor("pointer");
assert(currentFrameCursor === global.HAND, "requestCursor('pointer') define cursor para HAND");
requestCursor("text");
assert(currentFrameCursor === global.TEXT, "requestCursor('text') define cursor para TEXT");
assert(typeof triggerClickRipple === "function", "triggerClickRipple está definida");
assert(typeof drawClickRipples === "function", "drawClickRipples está definida");
assert(typeof exportDropdownAnim === "number", "exportDropdownAnim está definida no state");
assert(tagClickAnim instanceof Map, "tagClickAnim é uma instância de Map");
assert(Array.isArray(clickRipples), "clickRipples é um array");
const initialRipplesCount = clickRipples.length;
triggerClickRipple(150, 200);
assert(clickRipples.length === initialRipplesCount + 1, "triggerClickRipple registra novo efeito de ripple");

console.log("\n=== 12. Validando Controle de Visibilidade do Menu Estendido ===");
assert(typeof leftPanelExtendedOpen === "boolean", "leftPanelExtendedOpen está definido no estado");
assert(leftPanelExtendedOpen === true, "leftPanelExtendedOpen é inicialmente true (menu aberto)");

global.width = 1200;
leftPanelExtendedOpen = true;
const fullW = filterPanelW();
assert(fullW === LAYOUT_NAV_W + LAYOUT_FILTRO_W, `filterPanelW com menu aberto é ${LAYOUT_NAV_W + LAYOUT_FILTRO_W} (obtido: ${fullW})`);

leftPanelExtendedOpen = false;
const collapsedW = filterPanelW();
assert(collapsedW === LAYOUT_NAV_W, `filterPanelW com menu recolhido é ${LAYOUT_NAV_W} (obtido: ${collapsedW})`);

// Validação de estabilidade do menu direito
leftPanelExtendedOpen = true;
const scaleOpen = layoutScale();
const rightWOpen = productPanelW();

leftPanelExtendedOpen = false;
const scaleClosed = layoutScale();
const rightWClosed = productPanelW();

assert(scaleOpen === scaleClosed, `layoutScale permanece estável ao abrir/fechar menu esquerdo (${scaleOpen} === ${scaleClosed})`);
assert(rightWOpen === rightWClosed, `productPanelW permanece estável ao abrir/fechar menu esquerdo (${rightWOpen} === ${rightWClosed})`);

leftPanelExtendedOpen = true; // restaurar estado inicial

console.log("\n=== 13. Validando Adaptação Multi-Resolução, Ultrawide e Escalas DPI ===");

// 1. Resolução Notebook Padrão (1366 x 768 / viewport ~1366 x 650)
global.width = 1366;
global.height = 650;
const scaleNotebook = filterPanelScale();
assert(scaleNotebook === 1.0, `Notebook 1366x650 mantém filterPanelScale === 1.0 (obtido: ${scaleNotebook})`);
const prodWNotebook = productPanelW();
assert(prodWNotebook >= 250 && prodWNotebook <= 405, `productPanelW em notebook 1366x650 fica em faixa ergonômica (obtido: ${prodWNotebook})`);
const visWNotebook = visualW();
assert(filterPanelW() + visWNotebook + prodWNotebook === 1366, "Layout 1366x650 preenche exatamente a largura da tela");

// 2. Notebook com Escala Windows 125% (FHD 1920x1080 -> CSS 1536 x ~700)
global.width = 1536;
global.height = 700;
const scaleLaptopDpi = filterPanelScale();
assert(scaleLaptopDpi === 1.0, `Notebook FHD 125% (1536x700) mantém filterPanelScale === 1.0 (obtido: ${scaleLaptopDpi})`);
const topBoundsFHD125 = productPanelTopBounds(layoutScale());
assert(topBoundsFHD125.imageH + topBoundsFHD125.titleH <= (700 - 160) * 0.45 + 2, "Topo do painel direito adapta altura para evitar overflow vertical em 700px");

// 3. Notebook Compacto com Escala Windows 125% (1366x768 -> CSS 1092 x ~500)
global.width = 1092;
global.height = 500;
const scaleSmallLaptop = filterPanelScale();
assert(scaleSmallLaptop < 1.0 && scaleSmallLaptop >= 0.85, `Notebook compacto 125% (1092x500) reduz escala proporcionalmente (obtido: ${scaleSmallLaptop.toFixed(3)})`);

// 4. Ultrawide 21:9 (2560 x 1080 e 3440 x 1440)
global.width = 2560;
global.height = 950;
leftPanelExtendedOpen = true;
const scaleUltrawide = filterPanelScale();
assert(scaleUltrawide === 1.0, `Ultrawide 2560x950 mantém escala base do filtro (obtido: ${scaleUltrawide})`);
const prodWUltrawide = productPanelW();
assert(prodWUltrawide === LAYOUT_PAINEL_PRODUTO_W, `Painel de produto em ultrawide mantém largura padrão (obtido: ${prodWUltrawide})`);
const track2560 = timelineTrackBounds();
assert(track2560.tw <= 1800, `Track da timeline em 2560px respeita limite máximo (obtido: ${track2560.tw})`);

// Ultrawide 3440 x 1440 (limite superior de track)
global.width = 3440;
global.height = 1350;
const ultrawideTrack = timelineTrackBounds();
assert(ultrawideTrack.tw === 1800, `Track da timeline em Ultrawide 3440px é limitado a 1800px para não deformar (obtido: ${ultrawideTrack.tw})`);
const ultrawideExpectedTx = visualX() + (visualW() - 1800) / 2;
assert(Math.abs(ultrawideTrack.tx - ultrawideExpectedTx) < 0.001, `Track da timeline fica perfeitamente centralizado em Ultrawide (obtido: ${ultrawideTrack.tx})`);

// 5. Monitor 4K UHD (3840 x 2160)
global.width = 3840;
global.height = 2160;
const scale4K = filterPanelScale();
assert(scale4K === 1.25, `Monitor 4K escala legibilidade para 1.25x (obtido: ${scale4K})`);
const lScale4K = layoutScale();
assert(lScale4K === 1.25, `layoutScale escala até 1.25x em tela 4K (obtido: ${lScale4K})`);

console.log("\n==========================================");
console.log(`Resultado dos Testes: ${passed} passaram, ${failed} falharam.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log("Todos os testes passaram com sucesso!");
}
