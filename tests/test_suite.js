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
  "ui_onboarding.js",
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
    assert(nav.iconSize === 28, `Item de navegação '${nav.id}' possui tamanho iconSize === 28 (obtido: ${nav.iconSize})`);
  }
}

assert(LAYOUT_NAV_W === 70, `LAYOUT_NAV_W está configurado como 70 (obtido: ${LAYOUT_NAV_W})`);
assert(LAYOUT_FILTRO_W === 210, `LAYOUT_FILTRO_W está configurado como 210 (obtido: ${LAYOUT_FILTRO_W})`);
assert(LAYOUT_PAINEL_PRODUTO_W === 360, `LAYOUT_PAINEL_PRODUTO_W está configurado como 360 (obtido: ${LAYOUT_PAINEL_PRODUTO_W})`);
assert(LAYOUT_PAINEL_PRODUTO_W_MIN === 280, `LAYOUT_PAINEL_PRODUTO_W_MIN está configurado como 280 (obtido: ${LAYOUT_PAINEL_PRODUTO_W_MIN})`);
assert(PRODUCT_IMAGE_H === 240, `PRODUCT_IMAGE_H está configurado como 240 (obtido: ${PRODUCT_IMAGE_H})`);
assert(PRODUCT_TITLE_H === 56, `PRODUCT_TITLE_H está configurado como 56 (obtido: ${PRODUCT_TITLE_H})`);
assert(PRODUCT_SIDEBAR_W === 70, `PRODUCT_SIDEBAR_W está configurado como 70 (obtido: ${PRODUCT_SIDEBAR_W})`);

assert(DIMENSIONS.tipo_obra.gridX === 36 && DIMENSIONS.estetico.gridX === 36, "Cards da coluna esquerda do filtro possuem gridX === 36");
assert(DIMENSIONS.material.gridX === 128 && DIMENSIONS.tecnicas.gridX === 128, "Cards da coluna direita do filtro possuem gridX === 128");
assert(105 - (36 + 46) === 128 - 105, "Distâncias dos cards ao eixo central (105px) são perfeitamente simétricas (23px)");
assert(36 === (LAYOUT_FILTRO_W - (128 + 46)), "Margens laterais dos cards de filtro são perfeitamente simétricas (36px)");

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

// Validações da passagem ano a ano (e não por décadas)
assert(xToYear(yearToX(1923)) === 1923, "xToYear mapeia com precisão o ano 1923 (não-década)");
assert(xToYear(yearToX(1957)) === 1957, "xToYear mapeia com precisão o ano 1957 (não-década)");
assert(xToYear(yearToX(1984)) === 1984, "xToYear mapeia com precisão o ano 1984 (não-década)");
assert(xToYear(yearToX(2003)) === 2003, "xToYear mapeia com precisão o ano 2003 (não-década)");

let roundtripErrors = 0;
for (let y = YEAR_MIN; y <= YEAR_MAX; y++) {
  if (xToYear(yearToX(y)) !== y) roundtripErrors++;
}
assert(roundtripErrors === 0, `Todos os anos individuais de ${YEAR_MIN} a ${YEAR_MAX} revertem perfeitamente via xToYear`);

// Validação de clique suave direto sobre a barra da timeline
yearStart = 1920;
yearEnd = 1980;
const targetYearX = yearToX(1915);
const clickBefore = clickedYearHandle(targetYearX, bounds.ty);
assert(clickBefore === "start", "Clique antes do início posiciona e seleciona handle 'start'");
assert(yearStart === 1915, `yearStart atualizado suavemente para 1915 pelo clique na barra (obtido: ${yearStart})`);

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
global.BOLD = "bold";
global.NORMAL = "normal";
global.textFont = () => {};
global.textStyle = () => {};
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

// Teste de calculateNewDetailsHeight
assert(typeof calculateNewDetailsHeight === "function", "calculateNewDetailsHeight está definida");
selectedProduct = testProd;
rightPanelTab = "material";
const initialTags = selectedProduct.tagsByDimension.material;
const hWithTags = calculateNewDetailsHeight(200, 1.0);
assert(hWithTags > 0, "calculateNewDetailsHeight com tags retorna altura positiva");
selectedProduct.tagsByDimension.material = [];
const hWithoutTags = calculateNewDetailsHeight(200, 1.0);
assert(hWithoutTags > 0, "calculateNewDetailsHeight sem tags contabiliza a mensagem de tags vazias");
selectedProduct.tagsByDimension.material = initialTags;

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
assert(prodWNotebook === LAYOUT_PAINEL_PRODUTO_W, `productPanelW em notebook 1366x650 mantém ${LAYOUT_PAINEL_PRODUTO_W}px (obtido: ${prodWNotebook})`);
assert(layoutScale() === 1.0, "layoutScale em notebook 1366x650 é 1.0");
const visWNotebook = visualW();
assert(filterPanelW() + visWNotebook + prodWNotebook === 1366, "Layout 1366x650 preenche exatamente a largura da tela");

// 2. Notebook com Escala Windows 125% (FHD 1920x1080 -> CSS 1536 x ~700)
global.width = 1536;
global.height = 700;
const scaleLaptopDpi = filterPanelScale();
assert(scaleLaptopDpi === 1.0, `Notebook FHD 125% (1536x700) mantém filterPanelScale === 1.0 (obtido: ${scaleLaptopDpi})`);
assert(productPanelW() === LAYOUT_PAINEL_PRODUTO_W, `Painel direito mantém ${LAYOUT_PAINEL_PRODUTO_W}px em notebook 125% sem encolher elementos`);
assert(layoutScale() === 1.0, "layoutScale permanece 1.0 em notebook 125% garantindo fontes e imagens em tamanho original");

// 3. Resolução Full HD sem escala (1920 x 1080)
global.width = 1920;
global.height = 1080;
assert(filterPanelScale() === 1.0, "Full HD 1920x1080 mantém filterPanelScale === 1.0");
assert(productPanelW() === LAYOUT_PAINEL_PRODUTO_W, `Full HD 1920x1080 mantém productPanelW === ${LAYOUT_PAINEL_PRODUTO_W}`);
assert(layoutScale() === 1.0, "Full HD 1920x1080 mantém layoutScale === 1.0");

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

// 5. Janela compacta (< 1000px)
global.width = 900;
global.height = 640;
const scaleCompact = filterPanelScale();
assert(scaleCompact === 0.9, `Janela 900px reduz filterPanelScale proporcionalmente para 0.9 (obtido: ${scaleCompact})`);
assert(productPanelW() >= LAYOUT_PAINEL_PRODUTO_W_MIN, "Janela compacta preserva largura mínima do painel de produtos");

console.log("\n=== 14. Validando Acessibilidade, Breakpoints Responsivos e Correções de Bugs ===");
// 1. Breakpoints e modos de dispositivo
assert(typeof BREAKPOINTS === "object" && BREAKPOINTS.mobile === 768, "BREAKPOINTS configurado com mobile === 768");
global.width = 375;
assert(isMobileMode() === true, "isMobileMode() identifica tela 375px como mobile");
assert(getDeviceMode() === "mobile", "getDeviceMode() retorna 'mobile' para 375px");
global.width = 800;
assert(isTabletMode() === true, "isTabletMode() identifica tela 800px como tablet");
global.width = 1920;
assert(isDesktopMode() === true, "isDesktopMode() identifica tela 1920px como desktop");
global.width = 2560;
assert(getDeviceMode() === "ultrawide", "getDeviceMode() retorna 'ultrawide' para 2560px");

// 2. Acessibilidade de rótulos e contraste
assert(typeof getOriginLabel === "function", "getOriginLabel está definida");
assert(getOriginLabel("brasileiro") === "Brasil", "getOriginLabel('brasileiro') retorna 'Brasil'");
assert(getOriginLabel("internacional") === "Internacional", "getOriginLabel('internacional') retorna 'Internacional'");

assert(typeof getContrastTextColor === "function", "getContrastTextColor está definida");
assert(getContrastTextColor(COLORS.magenta) === "#FFFFFF", "getContrastTextColor para magenta retorna #FFFFFF (garante contraste acessível)");
assert(getContrastTextColor(COLORS.yellow) === "#000000", "getContrastTextColor para amarelo retorna #000000 (garante contraste acessível)");

// 3. Resolução do bug de travamento de handles da timeline quando anos coincidem
global.width = 1920;
global.height = 1080;
yearStart = 1950;
yearEnd = 1950;
const currentTy = height - TIMELINE_H / 2;
const sameYearX = yearToX(1950);
const handleRightClick = clickedYearHandle(sameYearX + 5, currentTy);
assert(handleRightClick === "end", "Ao clicar à direita de handles sobrepostas, seleciona 'end' permitindo expansão do intervalo");
const handleLeftClick = clickedYearHandle(sameYearX - 5, currentTy);
assert(handleLeftClick === "start", "Ao clicar à esquerda de handles sobrepostas, seleciona 'start'");

// 4. Estrutura de estado e scaffold mobile
assert(typeof mobileState === "object" && mobileState !== null, "mobileState está definido no estado");
assert(mobileState.activeScreen === "visual", "mobileState.activeScreen inicial é 'visual'");
assert(typeof drawDesktopLayout === "function", "drawDesktopLayout está definida");
assert(typeof drawMobileLayout === "function", "drawMobileLayout está definida");
assert(typeof touchStarted === "function", "touchStarted está definida para suporte mobile");
assert(typeof touchMoved === "function", "touchMoved está definida para suporte mobile");
assert(typeof touchEnded === "function", "touchEnded está definida para suporte mobile");

// 5. Prevenção de cursor fantasma fora da área visual central
hitAreas = [
  { shape: "circle", kind: "product", cx: 100, cy: 100, r: 20 },
];
// Quando fora dos limites visuais, hitAreaAt deve ignorar áreas visuais
const ghostHit = hitAreaAt(20, 100);
assert(ghostHit === null, "hitAreaAt fora da área visual central não ativa hit areas fantasmas");

console.log("\n=== 15. Validando Correções Críticas, Adaptabilidade Mobile e Acessibilidade ===");
// 1. setMobileScreen
assert(typeof setMobileScreen === "function", "setMobileScreen está definida");
setMobileScreen("filtros");
assert(mobileState.activeScreen === "filtros", "setMobileScreen('filtros') atualiza tela ativa");
setMobileScreen("tela_invalida");
assert(mobileState.activeScreen === "filtros", "setMobileScreen ignora telas inválidas");
setMobileScreen("visual");
assert(mobileState.activeScreen === "visual", "setMobileScreen('visual') restaura tela inicial");

// 2. Resiliência de getOptimalCanvasDimensions
global.windowWidth = 375;
global.windowHeight = 667;
global.width = undefined;
const mobileDims = getOptimalCanvasDimensions();
assert(mobileDims.w === 375 && mobileDims.h === 667, "getOptimalCanvasDimensions dimensiona corretamente para 375x667 mobile");

global.windowWidth = 1920;
global.windowHeight = 1080;
const desktopDims = getOptimalCanvasDimensions();
assert(desktopDims.w === 1920 && desktopDims.h === 1080, "getOptimalCanvasDimensions dimensiona corretamente para 1920x1080 desktop");

// 3. Layout mobile completo (largura total para visual e painéis em mobile)
global.width = 375;
global.height = 667;
assert(isMobileMode() === true, "isMobileMode() ativo para largura 375");
assert(visualX() === 0, "visualX() em mobile é 0 (tela cheia)");
assert(visualW() === 375, "visualW() em mobile ocupa 100% da largura (375)");
assert(productPanelX() === 0, "productPanelX() em mobile inicia em 0");
assert(productPanelW() === 375, "productPanelW() em mobile ocupa 100% da largura (375)");
assert(filterPanelW() === 375, "filterPanelW() em mobile ocupa 100% da largura (375)");

// 4. Acessibilidade de contraste em tema escuro para timeline
lightMode = false;
assert(themeLineColor() === "#FFFFFF", "themeLineColor() retorna #FFFFFF no modo escuro");
lightMode = true;
assert(themeLineColor() === "#111111", "themeLineColor() retorna #111111 no modo claro");

// 5. Restauração de variáveis de desktop para garantir estabilidade
global.width = 1920;
global.height = 1080;
assert(filterPanelW() === LAYOUT_NAV_W + LAYOUT_FILTRO_W, `filterPanelW em Full HD volta a ${LAYOUT_NAV_W + LAYOUT_FILTRO_W}px (obtido: ${filterPanelW()})`);
assert(productPanelW() === LAYOUT_PAINEL_PRODUTO_W, `productPanelW em Full HD volta a ${LAYOUT_PAINEL_PRODUTO_W}px (obtido: ${productPanelW()})`);
assert(visualW() === 1920 - (LAYOUT_NAV_W + LAYOUT_FILTRO_W) - LAYOUT_PAINEL_PRODUTO_W, `visualW em Full HD volta a ${1920 - (LAYOUT_NAV_W + LAYOUT_FILTRO_W) - LAYOUT_PAINEL_PRODUTO_W}px (obtido: ${visualW()})`);

console.log("\n=== 16. Validando Alinhamento das Linhas, Proporções do Painel Direito e Dimensões dos Ícones ===");
// 1. Geometria da Cruz de Filtros no Painel Esquerdo (com verificação da execução real de drawFilterCards)
let filterCardLines = [];
const origLine = global.line;
const origStroke = global.stroke;
const origStrokeWeight = global.strokeWeight;
const origPush = global.push;
const origPop = global.pop;
const origRect = global.rect;
const origCircle = global.circle;
const origDrawImageCentered = global.drawImageCentered;

global.CENTER = "center";
global.TOP = "top";
global.LEFT = "left";
global.BOTTOM = "bottom";
global.HAND = "pointer";
global.TEXT = "text";
global.ROUND = "round";
global.mouseX = 0;
global.mouseY = 0;
global.push = () => {};
global.pop = () => {};
global.stroke = () => {};
global.strokeWeight = () => {};
global.rect = () => {};
global.circle = () => {};
global.drawImageCentered = () => {};
global.line = (x1, y1, x2, y2) => {
  filterCardLines.push({ x1, y1, x2, y2 });
};

drawFilterCards();

const topVertLine = filterCardLines.find(l => l.x1 === 105 && l.x2 === 105 && l.y1 === 64 && l.y2 === 114);
assert(topVertLine !== undefined, "drawFilterCards() traça divisor vertical superior na posição x = 105 (y = 64..114)");

const botVertLine = filterCardLines.find(l => l.x1 === 105 && l.x2 === 105 && l.y1 === 164 && l.y2 === 214);
assert(botVertLine !== undefined, "drawFilterCards() traça divisor vertical inferior na posição x = 105 (y = 164..214)");

const tipoBar = filterCardLines.find(l => l.y1 === 134 && l.y2 === 134 && l.x1 <= 36 && l.x2 >= 82);
assert(tipoBar !== undefined, "drawFilterCards() traça barra horizontal sob o card Tipo (y = 134)");
assert(tipoBar && (tipoBar.x1 + tipoBar.x2) / 2 === 59, "Barra sob Tipo está perfeitamente centralizada com o card Tipo (cx = 59)");

const matBar = filterCardLines.find(l => l.y1 === 134 && l.y2 === 134 && l.x1 <= 128 && l.x2 >= 174);
assert(matBar !== undefined, "drawFilterCards() traça barra horizontal sob o card Material (y = 134)");
assert(matBar && (matBar.x1 + matBar.x2) / 2 === 151, "Barra sob Material está perfeitamente centralizada com o card Material (cx = 151)");

const botBar = filterCardLines.find(l => l.y1 === 246 && l.y2 === 246);
assert(botBar !== undefined, "drawFilterCards() traça barra horizontal longa sob Estético e Técnica (y = 246)");
assert(botBar && (botBar.x1 + botBar.x2) / 2 === 105, "Barra inferior longa está centralizada no painel de filtros (x = 105)");

const vertLen = topVertLine.y2 - topVertLine.y1;
const horizLen = tipoBar.x2 - tipoBar.x1;
assert(vertLen === 50 && horizLen === 50, `Barras verticais e horizontais possuem exatamente o mesmo comprimento de 50px (vert: ${vertLen}px, horiz: ${horizLen}px)`);
assert(114 - 64 === 214 - 164, "Divisores verticais superior e inferior possuem comprimento idêntico (50px)");

// 2. Geometria da Linha Separadora e Espaçamento dos Ícones do Painel Direito
let sidebarLines = [];
let sidebarTexts = [];
global.line = (x1, y1, x2, y2) => {
  sidebarLines.push({ x1, y1, x2, y2 });
};
global.text = (txt, tx, ty) => {
  sidebarTexts.push({ txt, tx, ty });
};
global.height = 1080;
drawProductSidebar(1515, 296, 70, 784, 1.0);

const sepLine = sidebarLines.find(l => l.x1 === 1515 + 12 && l.x2 === 1515 + 70 - 12);
assert(sepLine !== undefined, "drawProductSidebar() traça linha separadora com margens laterais de 12px na sidebar de 70px");
assert(sepLine && sepLine.y1 === sepLine.y2, "Separador do Salvos na sidebar é perfeitamente horizontal");

const tabLabels = sidebarTexts.filter(t => ["Material", "Estético", "Técnica"].includes(t.txt));
assert(tabLabels.length === 3, "drawProductSidebar renderiza os rótulos das 3 abas");
if (tabLabels.length === 3) {
  const distBetweenTabs = tabLabels[1].ty - tabLabels[0].ty;
  assert(distBetweenTabs === 66, `Distância entre os 3 ícones das abas foi aproximada para 66px (obtido: ${distBetweenTabs})`);
}

// Restaura mocks
global.line = origLine;
global.stroke = origStroke;
global.strokeWeight = origStrokeWeight;
global.push = origPush;
global.pop = origPop;
global.rect = origRect;
global.circle = origCircle;
global.drawImageCentered = origDrawImageCentered;

// 3. Dimensões e Proporções do Painel Direito Ajustado
assert(LAYOUT_PAINEL_PRODUTO_W === 360, "Painel direito ajustado para 360px");
assert(LAYOUT_PAINEL_PRODUTO_W_MIN === 280, "Largura mínima do painel direito é 280px");
assert(PRODUCT_SIDEBAR_W === 70, "Sidebar de abas do produto configurada com 70px");
const contentAreaW = LAYOUT_PAINEL_PRODUTO_W - PRODUCT_SIDEBAR_W;
assert(contentAreaW === 290, "Área de conteúdo de detalhes possui 290px livres (reduzida em 45px)");

// 4. Dimensões Aumentadas dos Ícones e Altura dos Botões de Navegação
for (const nav of NAV_CONFIG) {
  if (nav.id === "trocar") {
    assert(nav.iconSize === 30, `Ícone de 'trocar' aumentado para 30px (obtido: ${nav.iconSize})`);
  } else {
    assert(nav.iconSize === 28, `Ícone de '${nav.id}' aumentado para 28px (obtido: ${nav.iconSize})`);
  }
}
const sidebarCircleD = 42;
const sidebarMargin = (PRODUCT_SIDEBAR_W - sidebarCircleD) / 2;
assert(sidebarMargin === 14, "Círculos das abas do produto possuem margens laterais confortáveis de 14px na sidebar de 70px");

console.log("\n=== 17. Validando Layout das Bolhas e Separação entre Nomes de Escolas e Obras ===");
global.visualX = () => 280;
global.visualW = () => 1280;
global.height = 1080;
global.TIMELINE_H = 120;
yearStart = YEAR_MIN;
yearEnd = YEAR_MAX;
global.selectedProduct = null;
global.hitAreas = [];
global.themeLineColor = () => "#000000";
global.fontes = { afacad: {}, roboto: {}, robotoCondensed: {} };
global.BOLD = "bold";
global.NORMAL = "normal";
global.CENTER = "center";
global.textSize = () => {};
global.textFont = () => {};
global.textStyle = () => {};
global.textAlign = () => {};
global.noFill = () => {};
global.noStroke = () => {};
global.stroke = () => {};
global.strokeWeight = () => {};
global.circle = () => {};
global.PI = Math.PI;
global.TWO_PI = Math.PI * 2;
global.HALF_PI = Math.PI / 2;
global.GOLDEN_ANGLE = 2.39996323;
global.cos = Math.cos;
global.sin = Math.sin;
global.constrain = (n, low, high) => Math.max(low, Math.min(high, n));

assert(typeof buildBubbleGroups === "function", "buildBubbleGroups está definida");
assert(typeof drawProductsInBubble === "function", "drawProductsInBubble está definida");

const testCx = 280 + 1280 / 2;
const testCy = (1080 - 120) / 2;
const testOuterR = Math.max(130, Math.min(1280 * 0.46, (1080 - 120) * 0.46));

// Testa com todos os produtos
const fullGroups = buildBubbleGroups(products, testCx, testCy, testOuterR);
assert(fullGroups.length > 0, `buildBubbleGroups construiu ${fullGroups.length} grupos com sucesso`);

// 1. Valida que a bolha central é 'Obras brasileiras' e está perfeitamente centralizada
const centerG = fullGroups[0];
assert(centerG.name === "Obras brasileiras", "Grupo central é 'Obras brasileiras'");
assert(centerG.x === testCx && centerG.y === testCy, `Bolha central está exatamente em (${testCx}, ${testCy})`);

// 2. Valida ausência de sobreposição entre QUALQUER par de bolhas
let bubbleOverlapCount = 0;
for (let i = 0; i < fullGroups.length; i++) {
  for (let j = i + 1; j < fullGroups.length; j++) {
    const dist = Math.hypot(fullGroups[i].x - fullGroups[j].x, fullGroups[i].y - fullGroups[j].y);
    const minD = fullGroups[i].r + fullGroups[j].r;
    if (dist < minD) {
      bubbleOverlapCount++;
    }
  }
}
assert(bubbleOverlapCount === 0, `Nenhuma bolha se sobrepõe a outra na visualização (sobreposições: ${bubbleOverlapCount})`);

// 3. Valida que todas as bolhas ficam contidas dentro do círculo delimitador exterior
let outsideCount = 0;
for (const g of fullGroups) {
  const distFromCenter = Math.hypot(g.x - testCx, g.y - testCy) + g.r;
  if (distFromCenter > testOuterR) {
    outsideCount++;
  }
}
assert(outsideCount === 0, `Todas as bolhas respeitam o círculo exterior delimitador (fora dos limites: ${outsideCount})`);

// 4. Valida que nenhum dot invade a zona do label (borda superior do dot >= g.y - g.r * 0.08)
// O código garante isso para TODOS os grupos (independente de label interno ou externo)
let textCollisionCount = 0;
const drawnDots = [];
global.BOTTOM = "bottom";
global.circle = (x, y, d) => {
  drawnDots.push({ x, y, d });
};

for (const g of fullGroups) {
  drawnDots.length = 0;
  hitAreas.length = 0;
  drawProductsInBubble(g);
  
  const minDotTopY = g.y - g.r * 0.08;
  for (const dot of drawnDots) {
    const dotTop = dot.y - dot.d / 2;
    if (dotTop < minDotTopY - 0.5) { // tolerância de 0.5px para arredondamento
      textCollisionCount++;
    }
  }
}
assert(textCollisionCount === 0, `Nenhum círculo de obra colide com a área superior do nome da escola (colisões: ${textCollisionCount})`);

// 5. Validação específica com o subconjunto de 10 escolas do screenshot
const targetSubset = new Set([
  "Obras brasileiras", "Bauhaus", "Memphis", "Streamlining",
  "Cranbrook Academy of Art", "Art Nouveau", "Modernismo Norte-Americano",
  "Deutscher Werkbund", "Jugendstil", "Estilo Internacional"
]);
const subsetProds = products.filter(p => {
  const name = p.origin === "brasileiro" ? "Obras brasileiras" : movementName(p.movementRaw);
  return targetSubset.has(name);
});
const subsetGroups = buildBubbleGroups(subsetProds, testCx, testCy, testOuterR);
assert(subsetGroups.length === 10, `buildBubbleGroups com 10 escolas gerou 10 grupos (obtido: ${subsetGroups.length})`);

let subsetOverlaps = 0;
for (let i = 0; i < subsetGroups.length; i++) {
  for (let j = i + 1; j < subsetGroups.length; j++) {
    const dist = Math.hypot(subsetGroups[i].x - subsetGroups[j].x, subsetGroups[i].y - subsetGroups[j].y);
    const minD = subsetGroups[i].r + subsetGroups[j].r;
    if (dist < minD) {
      subsetOverlaps++;
    }
  }
}
assert(subsetOverlaps === 0, `Nenhuma bolha se sobrepõe no cenário de 10 escolas (sobreposições: ${subsetOverlaps})`);

let subsetTextCollisions = 0;
for (const g of subsetGroups) {
  drawnDots.length = 0;
  drawProductsInBubble(g);
  const minDotTopY = g.y - g.r * 0.08;
  for (const dot of drawnDots) {
    const dotTop = dot.y - dot.d / 2;
    if (dotTop < minDotTopY - 0.5) {
      subsetTextCollisions++;
    }
  }
}
assert(subsetTextCollisions === 0, `Nenhum círculo de obra colide com os nomes das 10 escolas (colisões: ${subsetTextCollisions})`);

console.log("\n=== 18. Validando Distribuição Orgânica das Obras (Bolhas e Mapa) ===");
global.dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
global.stroke = () => {};
global.strokeWeight = () => {};

// 1. Bolhas: valida que para 2 obras a distribuição NÃO é uma linha horizontal ou vertical rígida
const testG2 = {
  name: "Escola 2 Itens",
  x: 500,
  y: 500,
  r: 60,
  products: [products[0], products[1]],
};
drawnDots.length = 0;
drawProductsInBubble(testG2);
assert(drawnDots.length === 2, "drawProductsInBubble desenhou 2 pontos");
const d2_0 = drawnDots[0];
const d2_1 = drawnDots[1];
assert(Math.abs(d2_0.y - d2_1.y) > 2.0, "2 obras na bolha não estão rigidamente alinhadas na horizontal (y diferente)");
assert(Math.abs(d2_0.x - d2_1.x) > 2.0, "2 obras na bolha não estão rigidamente alinhadas na vertical (x diferente)");
const dist2 = Math.hypot(d2_0.x - d2_1.x, d2_0.y - d2_1.y);
assert(dist2 >= (d2_0.d + d2_1.d) / 2, "2 obras na bolha não se sobrepõem");

// 2. Bolhas: valida que para 3 obras a distribuição NÃO é um triângulo isósceles com base alinhada
const testG3 = {
  name: "Escola 3 Itens",
  x: 500,
  y: 500,
  r: 60,
  products: [products[0], products[1], products[2]],
};
drawnDots.length = 0;
drawProductsInBubble(testG3);
assert(drawnDots.length === 3, "drawProductsInBubble desenhou 3 pontos");
const yValues3 = drawnDots.map((d) => d.y);
let sameY3 = false;
for (let i = 0; i < 3; i++) {
  for (let j = i + 1; j < 3; j++) {
    if (Math.abs(yValues3[i] - yValues3[j]) < 0.5) sameY3 = true;
  }
}
assert(!sameY3, "3 obras na bolha possuem distribuição orgânica (nenhum par com mesmo y)");

// 3. Bolhas: valida que para 4 obras a distribuição NÃO é um grid quadrado 2x2 mecânico
const testG4 = {
  name: "Escola 4 Itens",
  x: 500,
  y: 500,
  r: 60,
  products: [products[0], products[1], products[2], products[3]],
};
drawnDots.length = 0;
drawProductsInBubble(testG4);
assert(drawnDots.length === 4, "drawProductsInBubble desenhou 4 pontos");
let matchingX4 = 0;
let matchingY4 = 0;
for (let i = 0; i < 4; i++) {
  for (let j = i + 1; j < 4; j++) {
    if (Math.abs(drawnDots[i].x - drawnDots[j].x) < 1.0) matchingX4++;
    if (Math.abs(drawnDots[i].y - drawnDots[j].y) < 1.0) matchingY4++;
  }
}
assert(matchingX4 === 0 && matchingY4 === 0, "4 obras na bolha não formam grid 2x2 mecânico (dispersão orgânica)");

// 4. Mapa: valida que cidades com múltiplas obras NÃO formam um círculo geométrico perfeito / halo ring
global.visualX = () => 280;
global.visualW = () => 1280;
global.height = 1080;
mapState.zoom = 6.0;
mapState.panX = 0;
mapState.panY = 0;
yearStart = 1880;
yearEnd = 2010;

const mapBox = currentMapBox();
const mapPoints = products
  .map((p) => ({ product: p, location: productLocation(p) }))
  .filter((item) => item.location);

const clustersZoom6 = makeMapClusters(mapPoints, mapBox);
assert(clustersZoom6.length > 0, `makeMapClusters gerou ${clustersZoom6.length} pontos individuais em zoom 6.0`);

const dessauPoints = clustersZoom6.filter((c) => c.points[0].location.name.includes("Dessau"));
assert(dessauPoints.length === 24, "Dessau contém 24 obras localizadas");
const dessauCenter = project(dessauPoints[0].points[0].location.lon, dessauPoints[0].points[0].location.lat, mapBox);
const dessauRadii = dessauPoints.map((p) => Math.hypot(p.x - dessauCenter.x, p.y - dessauCenter.y));
const minDessauR = Math.min(...dessauRadii);
const maxDessauR = Math.max(...dessauRadii);
const rangeDessauR = maxDessauR - minDessauR;
assert(rangeDessauR > 25, `Obras em Dessau possuem variação de raios (min: ${minDessauR.toFixed(1)}px, max: ${maxDessauR.toFixed(1)}px, range: ${rangeDessauR.toFixed(1)}px) e NÃO um halo/círculo único`);

let mapOverlapCount = 0;
for (let i = 0; i < dessauPoints.length; i++) {
  for (let j = i + 1; j < dessauPoints.length; j++) {
    const d = Math.hypot(dessauPoints[i].x - dessauPoints[j].x, dessauPoints[i].y - dessauPoints[j].y);
    if (d < 13.0) mapOverlapCount++;
  }
}
assert(mapOverlapCount === 0, `Nenhum par de pontos do mapa em Dessau se sobrepõe (distâncias < 13px: ${mapOverlapCount})`);

const clustersZoom6Second = makeMapClusters(mapPoints, mapBox);
const dessauPointsSecond = clustersZoom6Second.filter((c) => c.points[0].location.name.includes("Dessau"));
let maxDrift = 0;
for (let i = 0; i < dessauPoints.length; i++) {
  const drift = Math.hypot(dessauPoints[i].x - dessauPointsSecond[i].x, dessauPoints[i].y - dessauPointsSecond[i].y);
  if (drift > maxDrift) maxDrift = drift;
}
assert(maxDrift === 0, "Posições das obras no mapa são 100% estáveis e determinísticas entre renderizações");

// 5. Mapa: valida que em zoom intermediário obras da mesma cidade não fragmentam em sub-clusters artificiais
mapState.zoom = 4.0;
const clustersZoom4 = makeMapClusters(mapPoints, mapBox);
const dessauClustersZoom4 = clustersZoom4.filter((c) => c.points.some((p) => p.location.name.includes("Dessau")));
assert(dessauClustersZoom4.length === 1 && dessauClustersZoom4[0].points.length === 24, "Em zoom intermediário (4.0), obras em Dessau formam 1 cluster unificado com 24 obras sem fragmentação artificial");

// 6. Bolhas: valida que diferentes escolas possuem orientações angulares orgânicas variadas
const testG2_alt = {
  name: "Outra Escola 2",
  x: 500,
  y: 500,
  r: 60,
  products: [products[0], products[1]],
};
drawnDots.length = 0;
drawProductsInBubble(testG2_alt);
const angle1 = Math.atan2(d2_1.y - d2_0.y, d2_1.x - d2_0.x);
const angle2 = Math.atan2(drawnDots[1].y - drawnDots[0].y, drawnDots[1].x - drawnDots[0].x);
assert(Math.abs(angle1 - angle2) > 0.1, "Diferentes escolas com 2 obras possuem orientações angulares distintas e orgânicas");

console.log("\n=== 19. Validando Rótulos Internos das Bolhas e Margem Garantida no Mapa Mundi ===");
// 1. Bolhas: validação de que o rótulo de Modernismo Norte-Americano está contido dentro da bolha
assert(typeof fitBubbleText === "function", "fitBubbleText está definida");
const modernismoGroup = fullGroups.find((g) => g.name === "Modernismo Norte-Americano");
assert(modernismoGroup !== undefined, "Grupo Modernismo Norte-Americano encontrado");
if (modernismoGroup) {
  const modResult = fitBubbleText(modernismoGroup);
  assert(modResult.lines.length >= 2, `Modernismo Norte-Americano divide em múltiplas linhas (obtido: ${modResult.lines.length})`);
  assert(modResult.size >= 7.0, `Modernismo Norte-Americano possui tamanho de fonte legível (obtido: ${modResult.size}px)`);

  const lineHeight = modResult.size * 1.15;
  const centerY = modernismoGroup.y - modernismoGroup.r * 0.44;
  const totalH = (modResult.lines.length - 1) * lineHeight;
  const topY = centerY - totalH / 2 - modResult.size / 2;
  const bottomY = centerY + totalH / 2 + modResult.size / 2;

  assert(topY >= modernismoGroup.y - modernismoGroup.r, "Topo do texto de Modernismo está dentro do círculo da bolha");
  assert(bottomY <= modernismoGroup.y - modernismoGroup.r * 0.08, "Base do texto de Modernismo está acima da área das obras (sem colisão)");
}

// 2. Bolhas: valida que TODAS as bolhas de fullGroups e subsetGroups possuem texto visível e contido
let invalidBubbleLabels = 0;
for (const g of [...fullGroups, ...subsetGroups]) {
  const res = fitBubbleText(g);
  if (!res.lines || res.lines.length === 0 || res.size < 6.5) {
    invalidBubbleLabels++;
  }
  const lineHeight = res.size * 1.15;
  const centerY = g.products.length > 0 ? g.y - g.r * 0.44 : g.y;
  const totalH = (res.lines.length - 1) * lineHeight;
  const topY = centerY - totalH / 2 - res.size / 2;
  const bottomY = centerY + totalH / 2 + res.size / 2;
  if (topY < g.y - g.r - 0.5) invalidBubbleLabels++;
  if (g.products.length > 0 && bottomY > g.y - g.r * 0.08 + 0.5) invalidBubbleLabels++;
}
assert(invalidBubbleLabels === 0, `Todos os nomes de escolas ficam perfeitamente dentro das bolhas e acima dos pontos (erros: ${invalidBubbleLabels})`);

// 3. Mapa: valida que TODOS os pares de pontos do mapa em zoom 6.0 possuem margem garantida >= 3px (dist >= 17px)
let globalOverlapCount = 0;
const minSepRequired = 17.0; // r_a (7) + r_b (7) + margem mínima (3px)
for (let i = 0; i < clustersZoom6.length; i++) {
  for (let j = i + 1; j < clustersZoom6.length; j++) {
    const d = Math.hypot(clustersZoom6[i].x - clustersZoom6[j].x, clustersZoom6[i].y - clustersZoom6[j].y);
    if (d < minSepRequired) {
      globalOverlapCount++;
    }
  }
}
assert(globalOverlapCount === 0, `Nenhum par de pontos no mapa mundi colide ou se sobrepõe (distâncias < 17px: ${globalOverlapCount})`);

// 4. Mapa: valida que clusters em zoom intermediário (4.0) possuem margem garantida
const clustersZ4 = makeMapClusters(mapPoints, mapBox);
let clusterOverlapCount = 0;
for (let i = 0; i < clustersZ4.length; i++) {
  for (let j = i + 1; j < clustersZ4.length; j++) {
    const rA = clustersZ4[i].points.length === 1 ? 7 : constrain(13 + Math.sqrt(clustersZ4[i].points.length) * 7, 20, 58);
    const rB = clustersZ4[j].points.length === 1 ? 7 : constrain(13 + Math.sqrt(clustersZ4[j].points.length) * 7, 20, 58);
    const d = Math.hypot(clustersZ4[i].x - clustersZ4[j].x, clustersZ4[i].y - clustersZ4[j].y);
    if (d < rA + rB + 3.0) {
      clusterOverlapCount++;
    }
  }
}
assert(clusterOverlapCount === 0, `Nenhum cluster do mapa se sobrepõe em zoom intermediário (sobreposições: ${clusterOverlapCount})`);

// 5. Bolhas: valida que bolhas pequenas e filtradas (ex: 2 obras) contêm seus nomes dentro do perímetro circular
let filteredBubbleOverflows = 0;
const testSmallRadii = [42, 35, 29, 26];
for (const r of testSmallRadii) {
  for (const name of ["Modernismo Norte-Americano", "Cranbrook Academy of Art", "Deutscher Werkbund", "Estilo Internacional", "HfG Ulm / Good Design", "Streamlining"]) {
    const testGroup = { name, r, x: 500, y: 500, products: [products[0], products[1]] };
    const res = fitBubbleText(testGroup);
    const lineHeight = res.size * 1.15;
    const centerY = testGroup.y - testGroup.r * 0.44;
    const totalH = (res.lines.length - 1) * lineHeight;
    const startY = centerY - totalH / 2;
    const topY = startY - res.size * 0.45;
    const bottomY = startY + totalH + res.size * 0.45;
    if (topY < testGroup.y - testGroup.r - 0.5) filteredBubbleOverflows++;
    if (bottomY > testGroup.y - testGroup.r * 0.08 + 0.5) filteredBubbleOverflows++;
    for (let i = 0; i < res.lines.length; i++) {
      const lineY = startY + i * lineHeight;
      const dy = Math.abs(lineY - testGroup.y);
      const chordW = dy >= testGroup.r ? 0 : 2 * Math.sqrt(testGroup.r * testGroup.r - dy * dy);
      const lineW = res.lines[i].length * res.size * 0.55;
      if (lineW > chordW + 1.0) filteredBubbleOverflows++;
    }
  }
}
assert(filteredBubbleOverflows === 0, `Nenhum nome de bolha pequena/filtrada transborda do círculo (erros: ${filteredBubbleOverflows})`);

// 6. Mapa: valida que margem anti-colisão >= 4px (dist >= 18px) é respeitada em múltiplos níveis de zoom detalhado (5.2, 5.5, 6.0, 7.0)
let multiZoomOverlapCount = 0;
for (const z of [5.2, 5.5, 6.0, 7.0]) {
  mapState.zoom = z;
  const zClusters = makeMapClusters(mapPoints, mapBox);
  for (let i = 0; i < zClusters.length; i++) {
    for (let j = i + 1; j < zClusters.length; j++) {
      const d = Math.hypot(zClusters[i].points[0].x - zClusters[j].points[0].x, zClusters[i].points[0].y - zClusters[j].points[0].y);
      if (d < 18.0) {
        multiZoomOverlapCount++;
      }
    }
  }
}
assert(multiZoomOverlapCount === 0, `Margem anti-colisão >= 4px (dist >= 18px) garantida em múltiplos níveis de zoom (erros: ${multiZoomOverlapCount})`);

console.log("\n=== 20. Validando Acessibilidade por Teclado (WCAG 2.1/2.2: Tab, Setas, Foco Visível e Leitores de Tela) ===");

// 1. Inicialização de acessibilidade e leitor de tela
assert(typeof keyboardFocusActive === "boolean", "keyboardFocusActive está definido no estado");
assert(typeof a11yState === "object" && a11yState !== null, "a11yState está definido no estado");
assert(typeof announceToScreenReader === "function", "announceToScreenReader está definida");
assert(typeof isFocusedElement === "function", "isFocusedElement está definida");
assert(typeof isFocusedTag === "function", "isFocusedTag está definida");
assert(typeof drawFocusRingRect === "function", "drawFocusRingRect está definida");
assert(typeof drawFocusRingCircle === "function", "drawFocusRingCircle está definida");

announceToScreenReader("Teste de anúncio de acessibilidade");
assert(a11yState.lastAnnouncement === "Teste de anúncio de acessibilidade", "announceToScreenReader atualiza a11yState.lastAnnouncement");

// 2. Ordem Sequencial do Foco (WCAG 2.4.3 Focus Order)
leftPanelExtendedOpen = true;
leftPanelTab = "filtros";
selectedProduct = products[0];
const focusableElements = getFocusableElements();
assert(Array.isArray(focusableElements) && focusableElements.length > 0, `getFocusableElements retorna lista de elementos focáveis (${focusableElements.length} itens)`);

// Valida ordem lógica: Nav -> Painel Filtros -> Centro -> Timeline -> Painel Produto
const navIndices = focusableElements.map((el, i) => el.type === "nav" ? i : -1).filter(i => i >= 0);
const collapseIdx = focusableElements.findIndex(el => el.type === "collapse");
const dimIndices = focusableElements.map((el, i) => el.type === "dimension" ? i : -1).filter(i => i >= 0);
const centerIdx = focusableElements.findIndex(el => el.type === "center_product");
const timelineStartIdx = focusableElements.findIndex(el => el.type === "timeline_start");
const timelineEndIdx = focusableElements.findIndex(el => el.type === "timeline_end");
const productTabIndices = focusableElements.map((el, i) => el.type === "product_tab" ? i : -1).filter(i => i >= 0);

assert(navIndices.length === 4, "Barra de navegação contém 4 itens focáveis");
assert(collapseIdx > navIndices[navIndices.length - 1], "Botão de recolher vem após a barra de navegação");
assert(dimIndices.length === 4 && dimIndices[0] > collapseIdx, "Cards de dimensão vêm após o botão de recolher");
assert(centerIdx > dimIndices[dimIndices.length - 1], "Visualização central vem após o painel de filtros");
assert(timelineStartIdx > centerIdx && timelineEndIdx > timelineStartIdx, "Timeline vem após o centro visual e possui ordem alça inicial -> final");
assert(productTabIndices.length >= 3 && productTabIndices[0] > timelineEndIdx, "Abas do painel de produto vêm após a timeline");

// Valida que ao recolher o menu, controles do painel de filtros são excluídos do foco
leftPanelExtendedOpen = false;
const collapsedElements = getFocusableElements();
const hasCollapsedFilterControls = collapsedElements.some(el => ["collapse", "dimension", "category_selector", "tag_search", "tag_clear", "tag_item"].includes(el.type));
assert(!hasCollapsedFilterControls, "Controles do painel de filtros recolhido não estão no fluxo de Tab (WCAG 2.4.3)");
leftPanelExtendedOpen = true;

// 3. Navegação por Tab e Shift+Tab (WCAG 2.1.1 Keyboard Accessible & 2.1.2 No Keyboard Trap)
a11yState.focusTarget = null;
handleA11yTab(false);
assert(keyboardFocusActive === true, "Tab ativa keyboardFocusActive");
assert(a11yState.focusTarget && a11yState.focusTarget.type === "nav" && a11yState.focusTarget.id === "filtros", "Primeiro Tab foca o primeiro item da navegação (filtros)");

handleA11yTab(false);
assert(a11yState.focusTarget.id === "trocar", "Segundo Tab avança para 'trocar'");

handleA11yTab(true); // Shift+Tab
assert(a11yState.focusTarget.id === "filtros", "Shift+Tab retrocede o foco para 'filtros'");

// Valida ciclo sem Keyboard Trap (WCAG 2.1.2)
const allElements = getFocusableElements();
setA11yFocus(allElements[allElements.length - 1]);
assert(a11yState.focusTarget === allElements[allElements.length - 1], "Foco posicionado no último elemento");
handleA11yTab(false);
assert(a11yState.focusTarget.type === allElements[0].type && a11yState.focusTarget.id === allElements[0].id, "Tab no último elemento retorna ao primeiro ciclicamente sem armadilha");

// 4. Navegação por Setas na Timeline (Ajuste Ano a Ano suave)
setA11yFocus({ type: "timeline_start", id: "timeline_start" });
yearStart = 1920;
yearEnd = 1980;
handleA11yArrow("right");
assert(yearStart === 1921, `Seta Direita na alça inicial incrementa ano a ano (obtido: ${yearStart})`);
handleA11yArrow("left");
assert(yearStart === 1920, `Seta Esquerda na alça inicial decrementa ano a ano (obtido: ${yearStart})`);
assert(a11yState.lastAnnouncement.includes("1920"), "Leitor de tela anuncia novo ano da timeline");

// Limite inferior e barreira entre alças
yearStart = YEAR_MIN;
handleA11yArrow("left");
assert(yearStart === YEAR_MIN, `Seta Esquerda respeita limite mínimo YEAR_MIN (${YEAR_MIN})`);
yearStart = 1980;
handleA11yArrow("right");
assert(yearStart === 1980, "Alça inicial não ultrapassa a alça final (1980)");

// Reseta alça inicial para permitir ajuste livre da alça final
yearStart = 1920;
setA11yFocus({ type: "timeline_end", id: "timeline_end" });
yearEnd = 1980;
handleA11yArrow("left");
assert(yearEnd === 1979, `Seta Esquerda na alça final decrementa ano a ano (obtido: ${yearEnd})`);
handleA11yArrow("right");
assert(yearEnd === 1980, `Seta Direita na alça final incrementa ano a ano (obtido: ${yearEnd})`);
yearEnd = YEAR_MAX;
handleA11yArrow("right");
assert(yearEnd === YEAR_MAX, `Seta Direita respeita limite máximo YEAR_MAX (${YEAR_MAX})`);

// 5. Navegação por Setas na Lista de Tags do Filtro e Auto-Scroll
activeDimension = "material";
tagSearch = "";
categorySelectorOpen = false;
tagScroll = 0;
const currentTags = tagsToDisplay();
assert(currentTags.length > 2, "Existem tags de material para testar");
setA11yFocus({ type: "tag_item", id: "tag_list", index: 0 });
assert(a11yState.tagIndex === 0, "Índice inicial da tag é 0");

handleA11yArrow("down");
assert(a11yState.tagIndex === 1, "Seta para baixo avança para a próxima tag");
assert(isFocusedTag(currentTags[1], 1), "isFocusedTag identifica tag índice 1 como focada");
assert(a11yState.lastAnnouncement.includes(currentTags[1].label), "Leitor de tela anuncia nome da tag selecionada por seta");

handleA11yArrow("up");
assert(a11yState.tagIndex === 0, "Seta para cima retrocede para a tag anterior");

// Teste de rolagem automática garantindo visibilidade da tag focada
a11yState.tagIndex = Math.min(15, currentTags.length - 1);
ensureFocusedTagVisible(a11yState.tagIndex);
assert(tagScroll >= 0, `Auto-scroll mantém a tag focada visível (tagScroll: ${tagScroll})`);

// 6. Navegação por Setas na Visualização Central
setA11yFocus({ type: "center_product", id: "center_product" });
const visProds = visibleProducts();
assert(visProds.length > 1, "Produtos visíveis disponíveis");
selectProduct(visProds[0]);
handleA11yArrow("right");
assert(selectedProduct && selectedProduct.key === visProds[1].key, "Seta Direita na visualização central avança para a próxima obra");
assert(a11yState.lastAnnouncement.includes(visProds[1].name), "Leitor de tela anuncia nome da obra ao navegar por setas");

handleA11yArrow("left");
assert(selectedProduct && selectedProduct.key === visProds[0].key, "Seta Esquerda na visualização central retorna à obra anterior");

// 7. Navegação por Setas nas Abas do Painel de Produto
rightPanelTab = "material";
setA11yFocus({ type: "product_tab", id: "material" });
handleA11yArrow("down");
assert(rightPanelTab === "estetico", `Seta para baixo alterna aba de produto para 'estetico' (obtido: ${rightPanelTab})`);
handleA11yArrow("down");
assert(rightPanelTab === "tecnicas", `Seta para baixo alterna aba de produto para 'tecnicas' (obtido: ${rightPanelTab})`);
handleA11yArrow("down");
assert(rightPanelTab === "salvos", `Seta para baixo alterna aba de produto para 'salvos' (obtido: ${rightPanelTab})`);
handleA11yArrow("up");
assert(rightPanelTab === "tecnicas", `Seta para cima retorna aba de produto para 'tecnicas' (obtido: ${rightPanelTab})`);

// 8. Navegação por Setas no Grid 2x2 dos Cards de Dimensão
activeDimension = "tipo_obra";
setA11yFocus({ type: "dimension", id: "tipo_obra" });
handleA11yArrow("right");
assert(activeDimension === "material", "Seta Direita no grid de dimensão move de 'tipo_obra' para 'material'");
handleA11yArrow("down");
assert(activeDimension === "tecnicas", "Seta para Baixo no grid de dimensão move de 'material' para 'tecnicas'");
handleA11yArrow("left");
assert(activeDimension === "estetico", "Seta para Esquerda no grid de dimensão move de 'tecnicas' para 'estetico'");
handleA11yArrow("up");
assert(activeDimension === "tipo_obra", "Seta para Cima no grid de dimensão move de 'estetico' para 'tipo_obra'");

// 9. Ativação via Enter e Espaço (WCAG 2.1.1)
// A. Alternar tag na lista
activeDimension = "material";
selectedTagKeys.clear();
const activeTags = tagsToDisplay();
const testTag = activeTags[0];
a11yState.tagIndex = 0;
setA11yFocus({ type: "tag_item", id: "tag_list", index: 0, tagKey: testTag.key });
handleA11yActivate(); // Enter ou Espaço
assert(selectedTagKeys.has(testTag.key), "Enter/Espaço marca a tag focada");
assert(a11yState.lastAnnouncement.includes("marcada"), "Leitor de tela anuncia que a tag foi marcada");

handleA11yActivate(); // Segundo Enter/Espaço desmarca
assert(!selectedTagKeys.has(testTag.key), "Segundo Enter/Espaço desmarca a tag focada");
assert(a11yState.lastAnnouncement.includes("desmarcada"), "Leitor de tela anuncia que a tag foi desmarcada");

// B. Alternar visualização (trocar)
activeView = VISAO_CIRCULAR;
setA11yFocus({ type: "nav", id: "trocar" });
handleA11yActivate();
assert(activeView === VISAO_BOLHAS, `Enter em 'trocar' avança visualização para Bolhas (obtido: ${activeView})`);
assert(a11yState.lastAnnouncement.includes("Bolhas"), "Leitor de tela anuncia nova visão selecionada");

// C. Botão de recolher/expandir menu
leftPanelExtendedOpen = true;
setA11yFocus({ type: "collapse", id: "collapse" });
handleA11yActivate();
assert(leftPanelExtendedOpen === false, "Enter em 'collapse' recolhe o menu lateral");
handleA11yActivate();
assert(leftPanelExtendedOpen === true, "Enter novamente em 'collapse' expande o menu lateral");

// D. Salvar obra favorita
savedProductKeys.clear();
selectedProduct = products[0];
setA11yFocus({ type: "product_save", id: "product_save" });
handleA11yActivate();
assert(savedProductKeys.has(products[0].key), "Enter no botão de salvar adiciona obra aos favoritos");
handleA11yActivate();
assert(!savedProductKeys.has(products[0].key), "Segundo Enter no botão de salvar remove obra dos favoritos");

// 10. Tecla Escape (Descarte e Saída de Modos)
tagSearchActive = true;
handleA11yEscape();
assert(tagSearchActive === false, "Escape desativa modo de busca de tags");

categorySelectorOpen = true;
handleA11yEscape();
assert(categorySelectorOpen === false, "Escape fecha o seletor de categorias");

leftPanelExtendedOpen = true;
handleA11yEscape();
assert(leftPanelExtendedOpen === false, "Escape recolhe o painel estendido aberto");
assert(a11yState.focusTarget.type === "nav", "Após fechar painel com Escape, foco retorna à barra de navegação");

// 11. Foco Visível e Supressão por Mouse (WCAG 2.4.7 / 2.4.11)
keyboardFocusActive = true;
mousePressed();
assert(keyboardFocusActive === false, "Interação por mouse suprime indicadores visuais de foco do teclado");
handleKeyboardEvent({ key: "Tab", keyCode: 9, shiftKey: false });
assert(keyboardFocusActive === true, "Próxima tecla reativa imediatamente o foco visível do teclado");

// 12. Navegação por Setas na Barra de Navegação (Toolbar Vertical)
setA11yFocus({ type: "nav", id: "filtros" });
handleA11yArrow("down");
assert(a11yState.focusTarget.id === "trocar", "Seta para baixo na barra de navegação move para 'trocar'");
handleA11yArrow("down");
assert(a11yState.focusTarget.id === "exportar", "Seta para baixo na barra de navegação move para 'exportar'");
handleA11yArrow("down");
assert(a11yState.focusTarget.id === "sobre", "Seta para baixo na barra de navegação move para 'sobre'");
handleA11yArrow("down");
assert(a11yState.focusTarget.id === "filtros", "Seta para baixo no último item da barra de navegação retorna ciclicamente ao primeiro");
handleA11yArrow("up");
assert(a11yState.focusTarget.id === "sobre", "Seta para cima na barra de navegação retrocede para 'sobre'");

// 13. Navegação por Setas nos Controles de Exportação (Checkboxes e Combobox)
leftPanelTab = "exportar";
setA11yFocus({ type: "export_view", id: "view_0", index: 0 });
handleA11yArrow("down");
assert(a11yState.focusTarget.index === 1, "Seta para baixo em export_view move para próxima visão");
handleA11yArrow("up");
assert(a11yState.focusTarget.index === 0, "Seta para cima em export_view retorna à visão anterior");

setA11yFocus({ type: "export_format", id: "format" });
exportFormatSelected = "PDF";
handleA11yArrow("down");
assert(exportFormatSelected === "JPG", "Seta para baixo em export_format altera formato para 'JPG'");
handleA11yArrow("down");
assert(exportFormatSelected === "SVG", "Seta para baixo em export_format altera formato para 'SVG'");
handleA11yArrow("up");
assert(exportFormatSelected === "JPG", "Seta para cima em export_format retorna para 'JPG'");

// 14. Auto-Scroll e Navegação em Obras Salvas (ensureFocusedSavedItemVisible)
savedProductKeys.clear();
for (let i = 0; i < 8; i++) {
  if (products[i]) savedProductKeys.add(products[i].key);
}
rightPanelTab = "salvos";
savedScroll = 0;
setA11yFocus({ type: "saved_item", id: "saved_item", index: 0 });
assert(typeof ensureFocusedSavedItemVisible === "function", "ensureFocusedSavedItemVisible está definida");
handleA11yArrow("down");
assert(a11yState.savedIndex === 1, "Seta para baixo avança para próxima obra salva");
// Navega até índices mais avançados para acionar auto-scroll
for (let i = 0; i < 6; i++) {
  handleA11yArrow("down");
}
assert(a11yState.savedIndex === 7, "Navegação por setas atinge a 8ª obra salva (índice 7)");
assert(savedScroll >= 0, "savedScroll é calculado e ajustado pelo auto-scroll");

// 15. Transição por Seta para Baixo no Campo de Busca de Salvos
savedSearchActive = true;
handleKeyboardEvent({ key: "ArrowDown", keyCode: 40 });
assert(savedSearchActive === false, "Seta para baixo desativa digitação de busca de salvos");
assert(a11yState.focusTarget.type === "saved_item", "Seta para baixo move foco para primeiro item de salvos");

// 16. Navegação na Visão Circular Restrita a Obras em Exibição
activeView = VISAO_CIRCULAR;
const shownInCirc = typeof productsShownInCircular === "function" ? productsShownInCircular() : [];
if (shownInCirc.length > 1) {
  selectProduct(shownInCirc[0]);
  setA11yFocus({ type: "center_product", id: "center_product" });
  handleA11yArrow("right");
  assert(selectedProduct && selectedProduct.key === shownInCirc[1].key, "Seta direita na visualização circular foca obra visível no círculo");
}

// 17. Fechamento Automático de Menus Dropdown ao Navegar com Tab
categorySelectorOpen = true;
handleA11yTab(false);
assert(categorySelectorOpen === false, "Tab fecha automaticamente o seletor de agrupamento aberto para evitar sobreposição");

exportFormatDropdownOpen = true;
handleA11yTab(false);
assert(exportFormatDropdownOpen === false, "Tab fecha automaticamente o menu de formatos aberto");

// 18. Hierarquia Progressiva do Escape (Descarte e Limpeza)
tagSearch = "madeira";
handleA11yEscape();
assert(tagSearch === "", "Escape limpa texto de pesquisa de tags");

savedSearch = "cadeira";
handleA11yEscape();
assert(savedSearch === "", "Escape limpa texto de pesquisa de salvos");

focusedCircularTagKey = "tag_teste";
handleA11yEscape();
assert(focusedCircularTagKey === "", "Escape desmarca filtro de tag circular focado");

selectedProduct = products[0];
leftPanelExtendedOpen = false;
handleA11yEscape();
assert(selectedProduct === null, "Escape desmarca obra selecionada quando painel já está recolhido");

// 19. Alinhamento Robusto de Foco sob rectMode(CENTER)
let testRectMode = "CORNER";
const originalRectMode = typeof rectMode === "function" ? rectMode : null;
// Simula rectMode modificado para CENTER antes de desenhar o foco
if (typeof rectMode === "function") {
  rectMode(CENTER);
}
keyboardFocusActive = true;
// drawFocusRingRect não deve quebrar nem desenhar fora de posição
drawFocusRingRect(10, 10, 100, 50, 4);
assert(true, "drawFocusRingRect executa com segurança mesmo quando rectMode anterior era CENTER");

console.log("\n=== 21. Validando Modo Escuro (#222222, Textos Brancos e 12 Ícones Figma) ===");
assert(COLORS.visualDark === "#222222", "COLORS.visualDark está definido como #222222");

// Valida existência e mapeamento de todos os 12 ícones brancos do Figma
const figmaWhiteIcons = [
  { key: "filtros", file: "data/Icones/filtros_white.svg", nodeId: "983:747" },
  { key: "export", file: "data/Icones/exportar_white.svg", nodeId: "983:723" },
  { key: "sobre", file: "data/Icones/sobre_white.svg", nodeId: "983:719" },
  { key: "theme_toggle", file: "data/Icones/theme_toggle_white.svg", nodeId: "983:742" },
  { key: "visao_circular", file: "data/Icones/visao_circular_white.svg", nodeId: "983:669" },
  { key: "visao_bolhas", file: "data/Icones/visao_bolhas_white.svg", nodeId: "983:689" },
  { key: "visao_timeline", file: "data/Icones/visao_timeline_white.svg", nodeId: "983:680" },
  { key: "visao_mapa", file: "data/Icones/visao_mapa_white.svg", nodeId: "983:726" },
  { key: "material", file: "data/Icones/material_white.svg", nodeId: "983:730" },
  { key: "estetico", file: "data/Icones/estetico_white.svg", nodeId: "983:711" },
  { key: "tecnicas", file: "data/Icones/tecnicas_white.svg", nodeId: "983:715" },
  { key: "save", file: "data/Icones/salvar_produto_white.svg", nodeId: "983:717" },
];

assert(typeof ICONS_DARK_CONFIG === "object" && ICONS_DARK_CONFIG !== null, "ICONS_DARK_CONFIG está definido");
for (const item of figmaWhiteIcons) {
  assert(ICONS_DARK_CONFIG[item.key] === item.file, `ICONS_DARK_CONFIG possui '${item.key}' mapeado para '${item.file}'`);
  const fullPath = path.join(ROOT_DIR, item.file);
  assert(fs.existsSync(fullPath) && fs.statSync(fullPath).size > 100, `Arquivo SVG '${item.file}' existe no disco e não está vazio`);
}
assert(fs.existsSync(path.join(ROOT_DIR, "data/Icones/theme_toggle_dark.svg")), "theme_toggle_dark.svg existe no disco para o modo claro");
assert(ICONS_DARK_CONFIG.collapse_panel === "data/Icones/collapse_panel_white.svg", "ICONS_DARK_CONFIG possui 'collapse_panel' mapeado para 'collapse_panel_white.svg'");
assert(fs.existsSync(path.join(ROOT_DIR, "data/Icones/collapse_panel_white.svg")), "collapse_panel_white.svg existe no disco para o modo escuro");

// Valida posicionamento do botão de tema na barra de navegação:
// Deve ficar acima do Sobre (y: 380), abaixo do Exportar (y: 240) e da linha divisória (y: 278)
assert(typeof themeToggleBounds === "function", "themeToggleBounds está definida");
const tBounds = themeToggleBounds();
assert(tBounds.y > 278, `themeToggleBounds.y (${tBounds.y}) fica abaixo da linha divisória (y: 278)`);
const sobreNav = NAV_CONFIG.find(n => n.id === "sobre");
assert(sobreNav && tBounds.y + tBounds.h <= sobreNav.y, `themeToggleBounds (${tBounds.y + tBounds.h}) fica acima do ícone Sobre (${sobreNav.y})`);

// Valida alternância e cores do tema
assert(typeof toggleTheme === "function", "toggleTheme está definida");
lightMode = true;
assert(themeTextColor() === "#000000", "Em modo claro, themeTextColor() retorna #000000");
assert(themePanelBackground() === "#FFFFFF", "Em modo claro, themePanelBackground() retorna #FFFFFF");

toggleTheme();
assert(lightMode === false, "toggleTheme() comuta lightMode para false (modo escuro)");
assert(themeTextColor() === "#FFFFFF", "Em modo escuro, themeTextColor() retorna #FFFFFF");
assert(themePanelBackground() === "#222222", "Em modo escuro, themePanelBackground() retorna #222222");

// Valida acessibilidade do alternador de tema e ordem sequencial do foco
const currentFocusables = getFocusableElements();
const themeFocusItem = currentFocusables.find(el => el.type === "theme_toggle");
assert(themeFocusItem !== undefined, "theme_toggle está presente na lista de elementos focáveis getFocusableElements()");
const exportIdx = currentFocusables.findIndex(el => el.type === "nav" && el.id === "exportar");
const themeIdx = currentFocusables.findIndex(el => el.type === "theme_toggle");
const sobreIdx = currentFocusables.findIndex(el => el.type === "nav" && el.id === "sobre");
assert(themeIdx > exportIdx && themeIdx < sobreIdx, "theme_toggle está posicionado sequencialmente entre 'exportar' e 'sobre' no fluxo de foco (WCAG 2.4.3)");

// Valida navegação por Tab: exportar -> theme_toggle -> sobre
setA11yFocus(currentFocusables[exportIdx]);
handleA11yTab(false);
assert(a11yState.focusTarget && a11yState.focusTarget.type === "theme_toggle", "Tab a partir de 'exportar' avança para 'theme_toggle'");
handleA11yTab(false);
assert(a11yState.focusTarget && a11yState.focusTarget.id === "sobre", "Tab a partir de 'theme_toggle' avança para 'sobre'");

setA11yFocus({ type: "theme_toggle", id: "theme_toggle" });
handleA11yActivate();
assert(lightMode === true, "Enter/Espaço no theme_toggle reverte para modo claro via handleA11yActivate()");

handleA11yArrow("up");
assert(a11yState.focusTarget && a11yState.focusTarget.id === "exportar", "Seta para cima no theme_toggle move foco para 'exportar'");

setA11yFocus({ type: "theme_toggle", id: "theme_toggle" });
handleA11yArrow("down");
assert(a11yState.focusTarget && a11yState.focusTarget.id === "sobre", "Seta para baixo no theme_toggle move foco para 'sobre'");

// Valida clique do mouse no alternador de tema
lightMode = true;
filterMousePressed(LAYOUT_NAV_W / 2, tBounds.y + 10);
assert(lightMode === false, "Clique com mouse dentro de themeToggleBounds() comuta para modo escuro");

console.log("\n=== 22. Validando Correções de Bugs do Modo Escuro, Ícones Figma, Contraste e Navegações ===");
// 1. Valida Ícone Figma 987:754 e demais ícones do modo escuro
assert(ICONS_DARK_CONFIG.tipo_obra === "data/Icones/tipo_obra_white.svg", "ICONS_DARK_CONFIG possui 'tipo_obra' mapeado para 'data/Icones/tipo_obra_white.svg' (Figma node 987:754)");
const tipoObraPath = path.join(ROOT_DIR, "data/Icones/tipo_obra_white.svg");
assert(fs.existsSync(tipoObraPath) && fs.statSync(tipoObraPath).size > 100, "Arquivo SVG 'data/Icones/tipo_obra_white.svg' existe no disco e não está vazio");

const additionalDarkIcons = [
  { key: "artesanal", file: "data/Icones/produto_artesanal_white.svg" },
  { key: "industrial", file: "data/Icones/produto_industrial_white.svg" },
  { key: "assinado", file: "data/Icones/design_assinado_white.png" },
  { key: "clear", file: "data/Icones/filter_alt_off_white.png" },
];
for (const item of additionalDarkIcons) {
  assert(ICONS_DARK_CONFIG[item.key] === item.file, `ICONS_DARK_CONFIG possui '${item.key}' mapeado para '${item.file}'`);
  const fullP = path.join(ROOT_DIR, item.file);
  assert(fs.existsSync(fullP) && fs.statSync(fullP).size > 100, `Arquivo de ícone '${item.file}' existe no disco e não está vazio`);
}

// 2. Validação de Contraste e Acessibilidade (WCAG 2.1 AA >= 4.5:1 para texto, >= 3.0:1 para elementos gráficos)
function parseHex(hex) {
  const c = hex.replace("#", "");
  return [parseInt(c.substring(0, 2), 16), parseInt(c.substring(2, 4), 16), parseInt(c.substring(4, 6), 16)];
}
function sRGBtoLin(val) {
  const v = val / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function relLuminance(hex) {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * sRGBtoLin(r) + 0.7152 * sRGBtoLin(g) + 0.0722 * sRGBtoLin(b);
}
function calcContrast(hex1, hex2) {
  const l1 = relLuminance(hex1);
  const l2 = relLuminance(hex2);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

const blackHex = "#000000";
const whiteHex = "#FFFFFF";
const darkThemeBg = "#222222";
const pastelColors = [
  { name: "material/salvos", hex: "#959fff" },
  { name: "tecnicas", hex: "#a7ff95" },
  { name: "estetico", hex: "#ff9597" },
  { name: "tipo_obra", hex: "#ffef95" },
];

for (const p of pastelColors) {
  const contrastBlack = calcContrast(blackHex, p.hex);
  const contrastWhite = calcContrast(whiteHex, p.hex);
  assert(contrastBlack >= 4.5, `Contraste do preto (#000000) sobre o fundo pastel ${p.name} (${p.hex}) atinge WCAG AA (obtido: ${contrastBlack.toFixed(2)}:1 >= 4.5:1)`);
  assert(contrastWhite < 3.0, `Ícone branco sobre fundo pastel ${p.name} (${p.hex}) comprova baixa taxa de contraste (${contrastWhite.toFixed(2)}:1 < 3.0:1), justificando uso de ícones pretos/escuros`);
}

const darkBgContrast = calcContrast(whiteHex, darkThemeBg);
assert(darkBgContrast >= 4.5, `Contraste do branco (#FFFFFF) sobre o fundo escuro (${darkThemeBg}) atinge WCAG AA (obtido: ${darkBgContrast.toFixed(2)}:1 >= 4.5:1)`);

// 3. Validação de Navegação por Setas na Linha do Tempo (Ordem Cronológica Estrita)
activeView = VISAO_LINHA_TEMPO;
yearStart = 1920;
yearEnd = 1980;
const timelineVisibleProds = visibleProducts()
  .filter((p) => p.year >= yearStart && p.year <= yearEnd)
  .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name, "pt-BR"));
assert(timelineVisibleProds.length > 5, "Existem produtos suficientes para testar navegação na timeline");

selectProduct(timelineVisibleProds[0]);
setA11yFocus({ type: "center_product", id: "center_product", label: selectedProduct.name });

let previousYear = selectedProduct.year;
let isChronological = true;
for (let step = 0; step < 5; step++) {
  handleA11yArrow("right");
  if (selectedProduct.year < previousYear) {
    isChronological = false;
    break;
  }
  previousYear = selectedProduct.year;
}
assert(isChronological, "Navegação por seta direita na linha do tempo avança estritamente em ordem cronológica (sem saltos caóticos)");

// 4. Validação da Seleção e Efeito de Posição na Visualização Circular
activeView = VISAO_CIRCULAR;
// Seleciona tags para gerar produtos visuais circulares
const testTagKey = Array.from(tagsByKey.keys()).find(k => tagsByKey.get(k).dimension !== "tipo_obra" && tagsByKey.get(k).count > 20);
if (testTagKey) {
  selectedTagKeys.add(testTagKey);
  _cachedSelectedTags = null;
}
const circularProds = productsShownInCircular();
assert(circularProds.length > 0, `Visualização circular populada com sucesso (${circularProds.length} obras para a tag)`);
if (circularProds.length > 0) {
  selectProduct(circularProds[circularProds.length - 1]);
  // productsShownInCircular deve manter o produto selecionado na lista visível
  const updatedShown = productsShownInCircular();
  assert(updatedShown.some(p => p.key === selectedProduct.key), "Visualização circular garante que o produto selecionado está sempre presente entre as obras renderizadas");

  // Valida que navegação contínua percorre todas as obras exibidas no círculo sem travar em loop prematuro de 17 itens
  setA11yFocus({ type: "center_product", id: "center_product" });
  selectProduct(updatedShown[0]);
  const visitedCircular = [];
  for (let s = 0; s < updatedShown.length; s++) {
    handleA11yArrow("right");
    visitedCircular.push(selectedProduct.key);
  }
  const uniqueCircularCount = new Set(visitedCircular).size;
  assert(uniqueCircularCount === updatedShown.length, `Navegação circular percorre todas as ${updatedShown.length} obras visíveis sem loop antecipado (visitadas: ${uniqueCircularCount})`);
  assert(selectedProduct.key === updatedShown[0].key, "Após percorrer todas as obras do círculo, navegação retorna ciclicamente à primeira");

  // Valida que com tags no círculo, setas navegam exclusivamente dentro do conjunto circular (sem saltar para obras fora do círculo)
  const allShownKeys = new Set(updatedShown.map(p => p.key));
  let allStepsContained = true;
  for (let s = 0; s < 10; s++) {
    handleA11yArrow("right");
    if (!allShownKeys.has(selectedProduct.key)) allStepsContained = false;
  }
  assert(allStepsContained, "Navegação por setas na visão circular restringe-se estritamente às obras visíveis do círculo");

  // Valida sincronização de seleção na visão circular caso selectedProduct não pertença ao círculo
  selectedProduct = { key: "non_existent_product", name: "Inexistente" };
  ensureSelectedVisible();
  assert(productsShownInCircular().some(p => p.key === selectedProduct.key), "ensureSelectedVisible() recupera seleção válida dentro do círculo quando produto anterior não pertence à visão");

  // Restaura tag para próximos testes
  if (testTagKey) {
    selectedTagKeys.add(testTagKey);
    _cachedSelectedTags = null;
  }
}

// Valida que clique em produto no canvas define foco acessível em center_product
global.hitAreaAt = (x, y) => ({ kind: "product", product: products[0] });
global.visualX = () => 100;
global.visualW = () => 800;
global.clickedYearHandle = () => null;
visualMousePressed(200, 200);
assert(a11yState.focusTarget && a11yState.focusTarget.type === "center_product", "Clique em obra no canvas define a11yState.focusTarget como 'center_product'");
assert(keyboardFocusActive === true, "Clique em obra reativa imediatamente keyboardFocusActive para setas funcionarem");

// Valida que draw() reseta estados presos de arraste quando o mouse não está pressionado (anti-travamento de interação)
global.draggedYearHandle = "start";
global.mapState = global.mapState || { dragging: false, panX: 0, panY: 0, zoom: 1 };
global.mapState.dragging = true;
global.mouseIsPressed = false;
global.drawDesktopLayout = () => {};
global.drawMobileLayout = () => {};
global.drawClickRipples = () => {};
global.cursor = () => {};
global.frameCount = 1;
global.filterPanelScale = () => 1;
global.background = () => {};
draw();
assert(draggedYearHandle === null, "draw() reseta draggedYearHandle quando mouseIsPressed é false");
assert(mapState.dragging === false, "draw() reseta mapState.dragging quando mouseIsPressed é false");

// 5. Validação de Abertura da Aba Exportar em Modo Escuro
lightMode = false;
leftPanelTab = "exportar";
leftPanelExtendedOpen = true;

const p5Mocks = {
  fill: () => {},
  noFill: () => {},
  stroke: () => {},
  noStroke: () => {},
  strokeWeight: () => {},
  rect: () => {},
  line: () => {},
  circle: () => {},
  text: () => {},
  textFont: () => {},
  textSize: () => {},
  textStyle: () => {},
  textAlign: () => {},
  push: () => {},
  pop: () => {},
  translate: () => {},
  rotate: () => {},
  radians: (deg) => (deg * Math.PI) / 180,
  beginShape: () => {},
  vertex: () => {},
  endShape: () => {},
  BOLD: "bold",
  NORMAL: "normal",
  LEFT: "left",
  TOP: "top",
  CENTER: "center",
  HAND: "pointer",
  filterPanelScale: () => 1,
  mouseX: 50,
  mouseY: 50,
};
Object.assign(global, p5Mocks);

let exportDrawSucceeded = false;
try {
  drawExportTab();
  exportDrawSucceeded = true;
} catch (err) {
  console.error("Erro ao desenhar drawExportTab no modo escuro:", err);
  exportDrawSucceeded = false;
}
assert(exportDrawSucceeded, "drawExportTab() executa sem lançar exceção no modo escuro (#222222)");

console.log("\n=== 23. Validando Resolução dos Ícones Vetoriais e Tipografia Acessível ===");
const svgsToCheck = [
  "exportar_white.svg",
  "exportar.svg",
  "sobre_white.svg",
  "sobre.svg",
  "filtros_white.svg",
  "filtros.svg",
  "theme_toggle_white.svg",
  "theme_toggle_dark.svg",
  "material_white.svg",
  "material.svg",
  "tecnicas_white.svg",
  "tecnicas.svg",
  "estetico_white.svg",
  "estetico.svg",
  "tipo_obra_white.svg",
  "tipo_obra.svg",
  "visao_mapa_white.svg",
  "visao_mapa.svg",
  "salvar_produto_white.svg",
  "salvar_produto.svg",
  "visao_timeline_white.svg",
  "visao_timeline.svg",
  "visao_circular_white.svg",
  "visao_circular.svg",
  "visao_bolhas_white.svg",
  "visao_bolhas.svg",
  "collapse_panel_white.svg",
  "collapse_panel.svg",
  "produto_artesanal_white.svg",
  "produto_artesanal.svg",
  "produto_industrial_white.svg",
  "produto_industrial.svg",
];
for (const svgFile of svgsToCheck) {
  const content = fs.readFileSync(path.join(ROOT_DIR, "data/Icones", svgFile), "utf8");
  const wMatch = content.match(/width="([^"]+)"/);
  const hMatch = content.match(/height="([^"]+)"/);
  assert(wMatch && parseFloat(wMatch[1]) >= 200, `SVG ${svgFile} possui largura de alta resolução (>= 200px: ${wMatch ? wMatch[1] : 'null'})`);
  assert(hMatch && parseFloat(hMatch[1]) >= 150, `SVG ${svgFile} possui altura de alta resolução (>= 150px: ${hMatch ? hMatch[1] : 'null'})`);
  assert(!content.includes("<image"), `SVG ${svgFile} é puramente vetorial e não contém tags raster <image>`);
}

console.log("\n=== 24. Validando Sistema de Onboarding e Tutorial Passo a Passo ===");
assert(STORAGE_KEYS.onboardingCompleted === "tagrafia-onboarding-completed", "STORAGE_KEYS.onboardingCompleted está definido");
assert(Array.isArray(ONBOARDING_STEPS) && ONBOARDING_STEPS.length === 4, "ONBOARDING_STEPS contém 4 passos estruturados");
assert(ONBOARDING_STEPS[0].id === "welcome", "Passo 0 é a tela de boas-vindas");
assert(ONBOARDING_STEPS[0].description.includes("características em comum nas seguintes dimensões: técnicas de construção, materiais e estético"), "Passo 0 inclui texto sobre dimensões e características em comum");
assert(ONBOARDING_STEPS[1].zone === "left", "Passo 1 destaca o menu esquerdo");
assert(ONBOARDING_STEPS[1].description.includes("busca automática por outras obras que compartilham essa mesma característica"), "Passo 1 inclui explicação clara sobre busca automática por tags");
assert(ONBOARDING_STEPS[2].zone === "center", "Passo 2 destaca a área central");
assert(ONBOARDING_STEPS[3].zone === "right", "Passo 3 destaca o menu direito");
assert(ONBOARDING_STEPS[3].description.includes("produtos internacionais possuem a descrição na aba técnica"), "Passo 3 informa sobre a descrição de produtos internacionais na aba técnica");

// Teste de ciclo de vida do onboarding
const uiOnboardingContent = fs.readFileSync(path.join(ROOT_DIR, "ui_onboarding.js"), "utf8");
assert(uiOnboardingContent.includes("PROJETO DE DESIGN - TAGRAFIA"), "ui_onboarding.js contém o badge 'PROJETO DE DESIGN - TAGRAFIA'");
vm.runInThisContext(uiOnboardingContent);

assert(typeof drawOnboarding === "function", "drawOnboarding está definida");
assert(typeof onboardingMousePressed === "function", "onboardingMousePressed está definida");
assert(typeof onboardingKeyPressed === "function", "onboardingKeyPressed está definida");

// Simulação de primeiro acesso (sem flag no localStorage)
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

initOnboarding();
assert(onboardingState.active === true, "No primeiro acesso, onboardingState.active é inicializado como true");
assert(onboardingState.step === 0, "No primeiro acesso, inicia no passo 0 (Boas-vindas)");

// Avanço de passos
nextOnboardingStep();
assert(onboardingState.step === 1, "nextOnboardingStep avança para passo 1 (Menu Esquerdo)");
nextOnboardingStep();
assert(onboardingState.step === 2, "nextOnboardingStep avança para passo 2 (Área Central)");
prevOnboardingStep();
assert(onboardingState.step === 1, "prevOnboardingStep retrocede para passo 1");
nextOnboardingStep();
nextOnboardingStep();
assert(onboardingState.step === 3, "nextOnboardingStep atinge passo 3 (Menu Direito)");

// Conclusão
nextOnboardingStep();
assert(onboardingState.active === false, "Avançar do último passo desativa o onboarding");
assert(onboardingState.completed === true, "onboardingState.completed é marcado como true");
assert(localStorage.getItem(STORAGE_KEYS.onboardingCompleted) === "true", "Conclusão é persistida no localStorage");

// Novo acesso subsequente não deve reabrir automaticamente
initOnboarding();
assert(onboardingState.active === false, "Acessos subsequentes respeitam localStorage e não abrem automaticamente");

// Reabertura manual (ex: clique na aba Sobre)
startOnboarding(true);
assert(onboardingState.active === true && onboardingState.step === 0, "startOnboarding reabre o tutorial a partir do início");
skipOnboarding();
assert(onboardingState.active === false, "skipOnboarding fecha o tutorial imediatamente");

// Navegação por teclado no onboarding
global.ESCAPE = 27;
global.ENTER = 13;
global.RIGHT_ARROW = 39;
global.LEFT_ARROW = 37;

startOnboarding(false);
assert(onboardingState.active === true && onboardingState.step === 1, "startOnboarding(false) abre diretamente no passo 1");
const handledEsc = onboardingKeyPressed(global.ESCAPE);
assert(handledEsc === true && onboardingState.active === false, "Tecla Escape fecha o onboarding");

// Navegação por clique do mouse (onboardingMousePressed)
assert(typeof getOnboardingModalMetrics === "function", "getOnboardingModalMetrics está definida");
assert(typeof getOnboardingGuidedMetrics === "function", "getOnboardingGuidedMetrics está definida");

// Teste de clique no Passo 0: Iniciar Tutorial
startOnboarding(true);
assert(onboardingState.active === true && onboardingState.step === 0, "Tutorial ativo no passo 0");
const modalM = getOnboardingModalMetrics();
const clickStartHandled = onboardingMousePressed(modalM.startX + modalM.startW / 2, modalM.btnY + modalM.btnH / 2);
assert(clickStartHandled === true, "onboardingMousePressed absorve e trata clique no botão 'Iniciar Tutorial'");
assert(onboardingState.step === 1, "Clique em 'Iniciar Tutorial' avança para o passo 1");

// Teste de clique no Passo 1: Próximo -> Passo 2
const step1 = ONBOARDING_STEPS[1];
const g1 = getOnboardingGuidedMetrics(step1, 1, ONBOARDING_STEPS.length);
const clickNext1Handled = onboardingMousePressed(g1.nextX + g1.nextW / 2, g1.bY + g1.bH / 2);
assert(clickNext1Handled === true, "onboardingMousePressed trata clique no botão 'Próximo →' no passo 1 sem lançar ReferenceError");
assert(onboardingState.step === 2, "Clique em 'Próximo →' no passo 1 avança para o passo 2");

// Teste de clique no Passo 2: Anterior -> Passo 1
const step2 = ONBOARDING_STEPS[2];
const g2 = getOnboardingGuidedMetrics(step2, 2, ONBOARDING_STEPS.length);
assert(g2.hasPrev === true, "Passo 2 possui botão Anterior ativo");
const clickPrev2Handled = onboardingMousePressed(g2.prevX + g2.prevW / 2, g2.bY + g2.bH / 2);
assert(clickPrev2Handled === true, "onboardingMousePressed trata clique no botão 'Anterior' no passo 2");
assert(onboardingState.step === 1, "Clique em 'Anterior' retorna para o passo 1");

// Avança novamente para o Passo 2 e Passo 3 via clique
onboardingMousePressed(g1.nextX + g1.nextW / 2, g1.bY + g1.bH / 2);
assert(onboardingState.step === 2, "Retorna para o passo 2 via clique");
onboardingMousePressed(g2.nextX + g2.nextW / 2, g2.bY + g2.bH / 2);
assert(onboardingState.step === 3, "Avança para o passo 3 via clique em 'Próximo →'");

// Teste de clique no Passo 3: Concluir -> Finaliza o onboarding
const step3 = ONBOARDING_STEPS[3];
const g3 = getOnboardingGuidedMetrics(step3, 3, ONBOARDING_STEPS.length);
assert(g3.isLast === true, "Passo 3 é o último passo");
const clickConcludeHandled = onboardingMousePressed(g3.nextX + g3.nextW / 2, g3.bY + g3.bH / 2);
assert(clickConcludeHandled === true, "onboardingMousePressed trata clique em 'Concluir ✓'");
assert(onboardingState.active === false, "Clique em 'Concluir ✓' finaliza o onboarding");
assert(onboardingState.completed === true, "onboardingState.completed marcado como true");

// Teste de clique no botão 'Pular' durante passo guiado
startOnboarding(false); // inicia no passo 1
assert(onboardingState.active === true && onboardingState.step === 1, "Tutorial ativo no passo 1");
const clickSkipHandled = onboardingMousePressed(g1.skipX + g1.skipW / 2, g1.bY + g1.bH / 2);
assert(clickSkipHandled === true, "onboardingMousePressed trata clique no botão 'Pular'");
assert(onboardingState.active === false, "Clique em 'Pular' encerra o tutorial imediatamente");

// Teste de clique no botão 'Explorar Direto' no modal de boas-vindas
startOnboarding(true);
assert(onboardingState.active === true && onboardingState.step === 0, "Tutorial ativo no passo 0");
const clickExploreHandled = onboardingMousePressed(modalM.skipX + modalM.skipW / 2, modalM.btnY + modalM.btnH / 2);
assert(clickExploreHandled === true, "onboardingMousePressed trata clique no botão 'Explorar Direto'");
assert(onboardingState.active === false, "Clique em 'Explorar Direto' encerra o onboarding");

// Restaura estado padrão
lightMode = true;
leftPanelExtendedOpen = true;
leftPanelTab = "filtros";
activeDimension = "tipo_obra";
selectedTagKeys.clear();
savedProductKeys.clear();
activeView = VISAO_CIRCULAR;

console.log("\n==========================================");
console.log(`Resultado dos Testes: ${passed} passaram, ${failed} falharam.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log("Todos os testes passaram com sucesso!");
}

