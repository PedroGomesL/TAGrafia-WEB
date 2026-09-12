const DATA_PATHS = {
  productsBR: "data/Produtos brasileiros.tsv",
  productsIntl: "data/Produtos internacionais.tsv",
  schools: "data/Escolas.tsv",
  geo: "data/custom.geo.json",
  images: "data/image-manifest.json",
};

const LAYOUT_NAV_W = 125;
const LAYOUT_FILTRO_W = 225;
const LAYOUT_VISUAL_W_BASE = 1180;
const LAYOUT_PAINEL_PRODUTO_W = 405;
const LAYOUT_VISUAL_W_MIN = 320;

let icones = {
  menu: null,
  filtros: null,
  obras: null,
  graficos: null,
  clear: null,
  material: null,
  tecnicas: null,
  estetico: null,
  tipo_obra: null,
  left: null,
  right: null,
  save: null,
  author: null,
  artesanal: null,
  industrial: null,
  export: null,
  change: null,
  sobre: null
};

const LAYOUT_PAINEL_PRODUTO_W_MIN = 300;

// Filter panel layout
const FILTER_HEADER_H = 56;
const FILTER_CARD_H = 100;
const FILTER_BODY_Y = FILTER_HEADER_H + FILTER_CARD_H * 2; // 256
const FILTER_CAT_OFFSET = 38;
const FILTER_SEARCH_OFFSET = 41;
const FILTER_CLEAR_OFFSET = 41;
const FILTER_LIST_OFFSET = 44;
const FILTER_BAR_X = 27;
const FILTER_BAR_W = 201;
const FILTER_TAG_ROW_H = 36;

const YEAR_MIN = 1880;
const YEAR_MAX = 2010;
const TIMELINE_H = 74;
const GOLDEN_ANGLE = 2.399963229728653;

const VISAO_CIRCULAR = 0;
const VISAO_BOLHAS = 1;
const VISAO_LINHA_TEMPO = 2;
const VISAO_MAPA_MUNDI = 3;

const DIMENSIONS = {
  material: { label: "Material", color: "#3E4AD3" },
  tecnicas: { label: "Tecnica", color: "#4AD33E" },
  estetico: { label: "Estetico", color: "#D33E4A" },
  tipo_obra: { label: "Tipo de produto", color: "#FFCB00" },
};

const DIMENSION_ORDER = ["material", "tecnicas", "estetico", "tipo_obra"];

const CATEGORY_FILTERS = {
  material: [
    ["Metal", ["aco", "aluminio", "bronze", "chumbo", "cobre", "ferro", "latao", "metal", "zinco", "ouro", "prata"]],
    ["Plastico e Polimeros", ["abs", "acrilico", "baquelite", "borracha", "espuma", "melamina", "plastico", "policarbonato", "polietileno", "polipropileno", "poliuretano", "pvc", "resina", "vinil"]],
    ["Ceramica e Vidro", ["argila", "ceramica", "fibra de vidro", "porcelana", "vidro"]],
    ["Pedra e Construcao", ["alvenaria", "concreto", "estuque", "gesso", "mosaico", "marmore", "pedra", "tijolo"]],
    ["Madeira e Fibras", ["madeira", "pinus", "teca", "jacaranda", "freijo", "carvalho", "palhinha", "vime", "bambu", "fibra natural"]],
    ["Tecido e Couro", ["couro", "tecido", "textil", "estofado", "fibra", "la", "seda", "tela", "crina"]],
    ["Componentes", ["componente", "motor", "filtro", "parafuso", "prego"]],
    ["Papel e Midia", ["papel", "fotografia", "digital", "tipografia"]],
    ["Acabamentos", ["cola", "esmalte", "tinta", "verniz"]],
  ],
  estetico: [
    ["Forma e Geometria", ["assimetrico", "cilindrico", "circular", "curvilineo", "cubico", "esferico", "geometrico", "ortogonal", "oval", "simetrico"]],
    ["Linhas e Contornos", ["linha", "contorno", "fluido", "linear", "sinuoso", "silhueta"]],
    ["Estrutura e Composicao", ["estrutura", "camada", "contraste", "continuo", "empilhavel", "entrelacado", "modular", "padronizado", "vazado", "vertical", "horizontal"]],
    ["Cor, Luz e Aparencia", ["cor", "cromatico", "preto", "dourado", "monocromatico", "policromatico", "translucido", "reflexivo"]],
    ["Textura e Materialidade", ["bruto", "material", "liso", "metalico", "texturizado", "vidro"]],
    ["Estilo e Conceito", ["abstrato", "aerodinamico", "conceitual", "decorativo", "dinamico", "escultural", "minimalista", "ornamental", "ready-made"]],
    ["Natureza e Biologia", ["organico", "biomorfico", "botanico", "floral", "anatomico", "zoomorfico"]],
    ["Funcao e Midia", ["caligrafico", "digital", "ergonomico", "fotografico", "funcional", "grafico", "industrial", "tipografico", "utilitario"]],
  ],
  tecnicas: [
    ["Acabamento", ["acabamento", "pintura", "polimento", "revestimento", "cromagem", "douramento", "zincagem", "esmaltacao", "laminado"]],
    ["Arquitetura", ["acustica", "alvenaria", "concreto", "fachada", "estrutura", "iluminacao", "planta", "arquitetura", "urbano"]],
    ["Artes e Vidro", ["escultura", "vidro", "ceramica", "mosaico", "vitral", "marmore", "cozimento"]],
    ["Artesanato e Textil", ["bordado", "costura", "estofamento", "artesanal", "tecelagem"]],
    ["Corte e Dobra", ["corte", "curvatura", "dobra", "dobradura", "extrusao", "prensagem", "recorte", "tensionamento"]],
    ["Grafico e Digital", ["grafico", "tipografico", "impressao", "litografia", "serigrafia", "digital", "software", "grid", "3d"]],
    ["Engenharia", ["engenharia", "mecanica", "eletrica", "sistema", "eixo", "giratoria", "chassi", "refrigeracao"]],
    ["Marcenaria", ["madeira", "marcenaria", "carpintaria", "entalhe", "torneamento", "marchetaria"]],
    ["Metalurgia", ["metal", "soldagem", "fundicao", "forjamento", "usinagem", "estampagem", "ourivesaria"]],
    ["Moldagem", ["moldagem", "injecao", "laminacao", "espuma", "fibra", "sopro", "compressao"]],
    ["Montagem", ["montagem", "encaixe", "colagem", "modular", "empilhamento", "pre-fabricacao", "justaposicao"]],
  ],
};

const COLORS = {
  yellow: "#ffbf00",
  magenta: "#801893",
  blue: "#3E4AD3",
  green: "#4AD33E",
  red: "#D33E4A",
  cyan: "#48BFC6",
  pink: "#FFA8ED",
  orange: "#FF8A00",
  visualDark: "#111111",
  visualLight: "#F3F1EA",
  timelineDark: "#505050",
  timelineLight: "#D7D2C5",
  hatchDark: "#202020",
  hatchLight: "#B08A00",
  panelDark: "#222222",
  inactiveTab: "#624E00",
};

let fontes = {};
let icones = {};
let sourceLines = {};
let geoJson = null;
let imageManifest = {};
let products = [];
let schools = [];
let geoCountries = [];
let tagsByKey = new Map();
let tagsByDimension = {};
let selectedTagKeys = new Set();
let selectedProduct = null;
let selectedImageIndex = 0;
let savedProductKeys = new Set();
let activeDimension = "tipo_obra";

// Per-frame cache for expensive computations
let _cacheFrame = -1;
let _cachedSelectedTags = null;
let _cachedVisibleProducts = null;
let _cachedVisibleProductsNoYear = null;
let _cachedTagCounts = null;
let _cachedBubbleGroups = null;
let _bubbleCacheKey = "";

let activeCategoryByDimension = { material: -2, tecnicas: -1, estetico: -1, tipo_obra: -1 };
let categorySelectorOpen = false;
let tagSearch = "";
let tagSearchActive = false;
let tagScroll = 0;
let detailScroll = 0;
let savedScroll = 0;
let savedSearch = "";
let savedSearchActive = false;
let savedSortMode = 0;
let productDetailsActive = true;
let materialOpen = true;
let techniqueOpen = false;
let aestheticOpen = true;
let lightMode = false;
let activeView = VISAO_CIRCULAR;
let yearStart = YEAR_MIN;
let yearEnd = YEAR_MAX;
let draggedYearHandle = null;
let hitAreas = [];
let focusedCircularTagKey = "";
let detailsPanelOpen = false;
let exportPanelOpen = false;
let exportMessage = "";
let exportMessageFrame = 0;
let mapState = { zoom: 1, panX: 0, panY: 0, dragging: false, previousX: 0, previousY: 0 };
let imageCache = new Map();

function asset(path) {
  return encodeURI(path);
}

function preload() {
  sourceLines.productsBR = loadStrings(asset(DATA_PATHS.productsBR));
  sourceLines.productsIntl = loadStrings(asset(DATA_PATHS.productsIntl));
  sourceLines.schools = loadStrings(asset(DATA_PATHS.schools));
  geoJson = loadJSON(asset(DATA_PATHS.geo));
  imageManifest = loadJSON(asset(DATA_PATHS.images));

  fontes.afacad = loadFont(asset("data/Fontes/AfacadFlux-VariableFont_slnt,wght.ttf"));
  fontes.newAmsterdam = loadFont(asset("data/Fontes/NewAmsterdam-Regular.ttf"));
  fontes.robotoCondensed = loadFont(asset("data/Fontes/RobotoCondensed-VariableFont_wght.ttf"));

  icones.material = loadImage(asset("data/Icones/material.png"));
  icones.tecnicas = loadImage(asset("data/Icones/técnica.png"));
  icones.estetico = loadImage(asset("data/Icones/estético.png"));
  icones.tipo_obra = loadImage(asset("data/Icones/tipodeproduto.png"));
  icones.clear = loadImage(asset("data/Icones/filter_alt_off.png"));
  icones.left = loadImage(asset("data/Icones/keyboard_arrow_left.png"));
  icones.right = loadImage(asset("data/Icones/keyboard_arrow_right.png"));
  icones.save = loadImage(asset("data/Icones/salvar_produto.png"));
  icones.author = loadImage(asset("data/Icones/autor.png"));
  icones.artesanal = loadImage(asset("data/Icones/produto artesanal.png"));
  icones.assinado = loadImage(asset("data/Icones/design_assinado.png"));
  icones.industrial = loadImage(asset("data/Icones/produto industrial.png"));
  icones.export = loadImage(asset("data/Icones/export.png"));
  icones.change = loadImage(asset("data/Icones/change.png"));
}

function setup() {
  const canvas = createCanvas(Math.max(1024, windowWidth), Math.max(640, windowHeight));
  canvas.parent("canvasMount");
  pixelDensity(Math.min(2, displayDensity()));
  textFont(fontes.robotoCondensed);
  frameRate(30);

  buildData();
  buildGeoCountries();
  loadSavedProducts();
  selectedProduct = null;
}

function draw() {
  hitAreas = [];
  _cacheFrame = frameCount;
  _cachedSelectedTags = null;
  _cachedVisibleProducts = null;
  _cachedVisibleProductsNoYear = null;
  _cachedTagCounts = null;
  background(240);
  drawCurrentVisualization();
  drawVisualizationSummary();
  drawVisualizationMenu();
  drawDetailsLegendPanel();
  drawExportPanel();
  drawProductPanel();
  drawThemeButton();
  drawFilterPanel();
  drawLayoutSeparators();
}

function windowResized() {
  resizeCanvas(Math.max(1024, windowWidth), Math.max(640, windowHeight));
}

function buildData() {
  products = [];
  tagsByKey = new Map();
  tagsByDimension = {};
  for (const dim of DIMENSION_ORDER) tagsByDimension[dim] = [];

  products.push(...parseTSV(sourceLines.productsBR).map((row) => createProduct(row, "brasileiro")));
  products.push(...parseTSV(sourceLines.productsIntl).map((row) => createProduct(row, "internacional")));
  products = products.filter((product) => product.id && product.name);

  for (const product of products) {
    addTags(product, "tipo_obra", product.typeRaw);
    addTags(product, "tipo_obra", inferTypeFromName(product.name));
    addTags(product, "material", product.materialTagsRaw);
    addTags(product, "estetico", product.aestheticTagsRaw);
    addTags(product, "tecnicas", product.techniqueTagsRaw);
  }

  for (const dim of DIMENSION_ORDER) {
    tagsByDimension[dim].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "pt-BR"));
  }

  schools = parseTSV(sourceLines.schools).map(createSchool).filter(Boolean);
}

function parseTSV(lines) {
  if (!Array.isArray(lines) || !lines.length) return [];
  const header = splitTSVLine(lines[0]).map(cleanText);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i] || !lines[i].trim()) continue;
    const values = splitTSVLine(lines[i]);
    const row = {};
    for (let c = 0; c < header.length; c++) {
      if (header[c]) row[header[c]] = cleanText(values[c] || "");
    }
    rows.push(row);
  }
  return rows;
}

function splitTSVLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && line[i + 1] === '"') {
      cell += '"';
      i++;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === "\t" && !quoted) {
      cells.push(cleanCell(cell));
      cell = "";
    } else {
      cell += ch;
    }
  }
  cells.push(cleanCell(cell));
  return cells;
}

function cleanCell(value) {
  let textValue = String(value ?? "").replace(/\r/g, "");
  if (textValue.startsWith('"') && textValue.endsWith('"')) textValue = textValue.slice(1, -1);
  return textValue;
}

function createProduct(row, origin) {
  const id = field(row, ["ID"], 0);
  const dateRaw = field(row, ["Datação"], 4);
  const production = origin === "brasileiro"
    ? field(row, ["Número de exemplares"], 8)
    : field(row, ["TIpo de produção", "Tipo de produção"], 7);
  const composition = origin === "brasileiro"
    ? field(row, ["Técnica de Composição"], 9)
    : field(row, ["Técnica de Composição"], 8);

  return {
    id,
    key: `${origin}:${id}`,
    origin,
    name: field(row, ["Nome"], 1),
    typeRaw: field(row, ["Tipo"], 2),
    materialDescription: field(row, ["Material"], 3),
    dateRaw,
    year: extractYear(dateRaw),
    locationRaw: origin === "brasileiro" ? field(row, ["Localização Geográfica"], 5) : field(row, ["Escola ou movimento"], 5),
    movementRaw: origin === "internacional" ? field(row, ["Escola ou movimento"], 5) : "",
    author: field(row, ["Autoria"], 6),
    economicContext: field(row, ["Condicionantes Industriais/Econômicos"], 7),
    production,
    composition,
    materialTagsRaw: field(row, ["Materiais"], origin === "brasileiro" ? 10 : 9),
    aestheticTagsRaw: field(row, ["Estético"], origin === "brasileiro" ? 11 : 10),
    techniqueTagsRaw: field(row, ["Técnicas de construção/Funcionalidades"], origin === "brasileiro" ? 12 : 11),
    raw: row,
    tagKeys: new Set(),
    tagsByDimension: { material: [], estetico: [], tecnicas: [], tipo_obra: [] },
  };
}

function field(row, names, fallbackIndex) {
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(row, name)) return cleanText(row[name]);
  }
  const keys = Object.keys(row);
  return cleanText(row[keys[fallbackIndex]] || "");
}

function addTags(product, dimension, rawValue) {
  const seen = new Set();
  for (const rawTag of splitTags(rawValue)) {
    const label = canonicalTag(dimension, rawTag);
    if (!label) continue;
    const key = `${dimension}::${normalizeText(label)}`;
    if (seen.has(key) || product.tagKeys.has(key)) continue;
    seen.add(key);

    let tag = tagsByKey.get(key);
    if (!tag) {
      tag = {
        key,
        dimension,
        label,
        category: categoryForTag(dimension, label),
        count: 0,
        products: new Set(),
        color: DIMENSIONS[dimension].color,
      };
      tagsByKey.set(key, tag);
      tagsByDimension[dimension].push(tag);
    }

    tag.count += 1;
    tag.products.add(product.key);
    product.tagKeys.add(key);
    product.tagsByDimension[dimension].push(tag);
  }
}

function splitTags(value) {
  return cleanText(value)
    .split(",")
    .map((tag) => tag.replace(/[.;]+$/g, "").trim())
    .filter(Boolean);
}

function canonicalTag(dimension, value) {
  const raw = cleanText(value);
  const textValue = normalizeText(raw);
  if (!textValue) return "";

  if (dimension === "tipo_obra") {
    if (hasAny(textValue, ["cadeira", "poltrona", "sofa", "banco", "banqueta", "chaise", "assento"])) return "Assento";
    if (hasAny(textValue, ["mesa", "escrivaninha", "bancada"])) return "Mesa";
    if (hasAny(textValue, ["luminaria", "lampada", "abajur", "iluminacao"])) return "Iluminação";
    if (hasAny(textValue, ["cartaz", "poster", "selo", "revista", "livro", "capa", "tipografia", "identidade visual", "logotipo", "grafico", "comunicacao visual"])) return "Comunicação gráfica";
    if (hasAny(textValue, ["radio", "telefone", "camera", "barbeador", "calculadora", "aspirador", "processador", "computador", "aparelho", "eletrodomestico", "equipamento"])) return "Equipamento";
    if (hasAny(textValue, ["onibus", "automovel", "chevrolet", "ford", "carro", "trem", "metro", "bicicleta", "aviao", "transporte", "veiculo"])) return "Transporte";
    if (hasAny(textValue, ["edificio", "casa", "pavilhao", "fachada", "escola", "igreja", "arquitetura", "urbanismo"])) return "Arquitetura";
    if (hasAny(textValue, ["vaso", "jarra", "decanter", "copo", "prato", "talher", "panela", "garrafa", "utensilio", "cozinha"])) return "Utensílio";
    if (hasAny(textValue, ["tapecaria", "tecido", "textil", "vestido", "artigo textil"])) return "Têxtil";
    if (hasAny(textValue, ["mobiliario"])) return "Mobiliário";
    if (hasAny(textValue, ["joalheria"])) return "Joalheria";
    if (hasAny(textValue, ["artes plasticas", "pintura", "escultura"])) return "Artes plásticas";
  }

  if (dimension === "estetico") {
    if (hasAny(textValue, ["curvilineo", "ondular", "curvo", "sinuoso"])) return "Curvilíneo";
    if (hasAny(textValue, ["linhas limpas", "linhas continuas", "linear"])) return "Linear";
    if (hasAny(textValue, ["minimalismo", "minimalista"])) return "Minimalista";
    if (hasAny(textValue, ["ortogonal"])) return "Ortogonal";
    if (hasAny(textValue, ["escultural"])) return "Escultural";
    if (hasAny(textValue, ["geometrico", "geometria"])) return "Geométrico";
    if (hasAny(textValue, ["organico", "ecologico"])) return "Orgânico";
    if (hasAny(textValue, ["textur", "canelado"])) return "Texturizado";
    if (hasAny(textValue, ["contraste material"])) return "Contraste material";
    if (hasAny(textValue, ["transluc"])) return "Translúcido";
  }

  if (dimension === "tecnicas") {
    if (hasAny(textValue, ["postura fixa", "postura flexivel", "ergonom", "inclinacao livre"])) return "Ergonomia";
    if (hasAny(textValue, ["encaixe", "travamento", "pino"])) return "Encaixe";
    if (hasAny(textValue, ["desmontavel", "flat-pack", "aninhavel", "dobravel"])) return "Design desmontável";
    if (hasAny(textValue, ["usinagem", "fresadora"])) return "Usinagem";
    if (hasAny(textValue, ["moldagem por injecao", "injecao", "monobloco"])) return "Moldagem por injeção";
    if (hasAny(textValue, ["curvatura de madeira", "madeira prensada"])) return "Curvatura de madeira";
    if (hasAny(textValue, ["curvatura", "dobra", "dobradura"])) return "Dobra e curvatura";
    if (hasAny(textValue, ["producao em massa", "producao seriada", "seriada", "semi-industrial"])) return "Produção seriada";
    if (hasAny(textValue, ["colagem", "cola"])) return "Colagem";
    if (hasAny(textValue, ["tensionamento", "tensionadas", "tensionado"])) return "Tensionamento";
    if (hasAny(textValue, ["pintura", "lacada", "epoxi", "esmaltada"])) return "Pintura";
    if (hasAny(textValue, ["acabamento", "revestimento", "polimento", "cromagem", "douramento", "zincagem", "laminado"])) return "Acabamento";
    if (hasAny(textValue, ["corte", "recorte", "perfuracao"])) return "Corte";
    if (hasAny(textValue, ["estofamento"])) return "Estofamento";
    if (hasAny(textValue, ["costura"])) return "Costura";
    if (hasAny(textValue, ["fundicao"])) return "Fundição";
    if (hasAny(textValue, ["soldagem", "soldadura"])) return "Soldagem";
    if (hasAny(textValue, ["marcenaria"])) return "Marcenaria";
    if (hasAny(textValue, ["impressao", "litografia", "serigrafia", "xilogravura"])) return "Impressão";
    if (hasAny(textValue, ["padronizacao"])) return "Padronização";
    if (hasAny(textValue, ["modularidade", "sistema modular", "construcao modular", "modulacao"])) return "Modularidade";
    if (hasAny(textValue, ["tecelagem"])) return "Tecelagem";
  }

  return raw;
}

function inferTypeFromName(name) {
  return canonicalTag("tipo_obra", name);
}

function categoryForTag(dimension, label) {
  const categories = CATEGORY_FILTERS[dimension] || [];
  const normalized = normalizeText(label);
  for (const [category, terms] of categories) {
    if (terms.some((term) => normalized.includes(normalizeText(term)) || normalizeText(term).includes(normalized))) {
      return category;
    }
  }
  return dimension === "tipo_obra" ? "Tipo de produto" : "Sem agrupamento";
}

function visibleProducts(ignoreYear = false) {
  if (!ignoreYear && _cachedVisibleProducts) return _cachedVisibleProducts;
  if (ignoreYear && _cachedVisibleProductsNoYear) return _cachedVisibleProductsNoYear;

  const selected = selectedTags();
  const selectedType = selected.filter((tag) => tag.dimension === "tipo_obra");
  const selectedGeneral = selected.filter((tag) => tag.dimension !== "tipo_obra");

  const result = products.filter((product) => {
    if (!ignoreYear && (product.year < yearStart || product.year > yearEnd)) return false;
    if (selectedType.length && !selectedType.some((tag) => product.tagKeys.has(tag.key))) return false;
    if (selectedGeneral.length && !selectedGeneral.some((tag) => product.tagKeys.has(tag.key))) return false;
    return true;
  });

  if (ignoreYear) _cachedVisibleProductsNoYear = result;
  else _cachedVisibleProducts = result;
  return result;
}

function productsForCircularBase() {
  const selected = selectedTags();
  const selectedType = selected.filter((tag) => tag.dimension === "tipo_obra");
  return products.filter((product) => {
    if (product.year < yearStart || product.year > yearEnd) return false;
    if (selectedType.length && !selectedType.some((tag) => product.tagKeys.has(tag.key))) return false;
    return true;
  });
}

function selectedTags() {
  if (_cachedSelectedTags) return _cachedSelectedTags;
  _cachedSelectedTags = Array.from(selectedTagKeys).map((key) => tagsByKey.get(key)).filter(Boolean);
  return _cachedSelectedTags;
}

function tagsForCircular() {
  const selected = selectedTags();
  const nonType = selected.filter((tag) => tag.dimension !== "tipo_obra");
  const type = selected.filter((tag) => tag.dimension === "tipo_obra");
  if (nonType.length) return nonType;
  if (type.length) return type;
  return [];
}

function productsShownInCircular() {
  const tags = tagsForCircular();
  if (!tags.length) return [];
  const typeTags = selectedTags().filter((tag) => tag.dimension === "tipo_obra");
  const visualProducts = [];
  for (const product of products) {
    if (product.year < yearStart || product.year > yearEnd) continue;
    if (typeTags.length && !typeTags.some((tag) => product.tagKeys.has(tag.key))) continue;
    const matched = tags.filter((tag) => product.tagKeys.has(tag.key));
    if (!matched.length) continue;
    if (focusedCircularTagKey && !matched.some((tag) => tag.key === focusedCircularTagKey)) continue;
    visualProducts.push({ product, tags: matched, weight: matched.length });
  }
  visualProducts.sort((a, b) => b.weight - a.weight || originWeight(b.product) - originWeight(a.product) || a.product.name.localeCompare(b.product.name, "pt-BR"));

  const shown = [];
  let slot = 0;
  for (const item of visualProducts) {
    if (slot >= 38) break;
    const segments = Math.min(Math.max(1, item.weight), 3, 38 - slot);
    shown.push(item.product);
    slot += segments;
  }
  return shown;
}

function layoutScale() {
  const space = Math.max(1, contentSpace());
  return Math.min(1, space / (LAYOUT_VISUAL_W_BASE + LAYOUT_PAINEL_PRODUTO_W));
}

function filterPanelScale() {
  if (width < 1000) return Math.max(0.65, width / 1000);
  return 1;
}

function filterPanelW() {
  return (LAYOUT_NAV_W + LAYOUT_FILTRO_W) * filterPanelScale();
}

function contentSpace() {
  return Math.max(0, width - filterPanelW());
}

function minVisualW() {
  const space = contentSpace();
  const combined = LAYOUT_VISUAL_W_MIN + LAYOUT_PAINEL_PRODUTO_W_MIN;
  if (space < combined) return constrain(space * 0.52, 180, LAYOUT_VISUAL_W_MIN);
  return LAYOUT_VISUAL_W_MIN;
}

function minProductW() {
  const space = contentSpace();
  const combined = LAYOUT_VISUAL_W_MIN + LAYOUT_PAINEL_PRODUTO_W_MIN;
  if (space < combined) return constrain(space - minVisualW(), 160, LAYOUT_PAINEL_PRODUTO_W_MIN);
  return LAYOUT_PAINEL_PRODUTO_W_MIN;
}

function productPanelW() {
  const space = contentSpace();
  const visualMin = minVisualW();
  const scaled = LAYOUT_PAINEL_PRODUTO_W * layoutScale();
  const minW = Math.min(minProductW(), Math.max(0, space - visualMin));
  const maxW = Math.max(minW, space - visualMin);
  return constrain(scaled, minW, maxW);
}

function visualW() {
  return Math.max(0, contentSpace() - productPanelW());
}

function visualX() {
  return filterPanelW();
}

function productPanelX() {
  return filterPanelW() + visualW();
}

function visualH() {
  return height;
}

function timelineW() {
  return Math.max(0, visualW() - 8);
}

function drawLayoutSeparators() {
  push();
  stroke("#000000");
  strokeWeight(2);
  line(filterPanelW(), 0, filterPanelW(), height);
  line(productPanelX(), 0, productPanelX(), height);
  pop();
}

function themeVisualBackground() {
  return lightMode ? COLORS.visualLight : COLORS.visualDark;
}

function themeLineColor() {
  return lightMode ? "#111111" : "#FFFFFF";
}

function themeTimelineColor() {
  return lightMode ? COLORS.timelineLight : COLORS.timelineDark;
}

function themeHatchColor() {
  return lightMode ? COLORS.hatchLight : COLORS.hatchDark;
}

function panelBackground() {
  return lightMode ? COLORS.visualLight : COLORS.panelDark;
}

function panelTextColor() {
  return lightMode ? "#111111" : "#FFFFFF";
}

function drawCurrentVisualization() {
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(visualX(), 0, visualW(), visualH());
  drawingContext.clip();

  const productsVisible = visibleProducts();
  if (activeView === VISAO_BOLHAS) drawBubbleView(productsShownInCircular());
  else if (activeView === VISAO_LINHA_TEMPO) drawTimelineView(productsShownInCircular());
  else if (activeView === VISAO_MAPA_MUNDI) drawMapView(productsVisible);
  else drawCircularView(productsVisible);

  drawingContext.restore();
}

function drawVisualizationBackground() {
  noStroke();
  fill(themeVisualBackground());
  rect(visualX(), 0, visualW(), visualH());
}

function drawVisualizationSummary() {
  const material = selectedTags().filter((tag) => tag.dimension === "material").length;
  const estetico = selectedTags().filter((tag) => tag.dimension === "estetico").length;
  const tecnica = selectedTags().filter((tag) => tag.dimension === "tecnicas").length;
  const totalTags = material + estetico + tecnica;
  const totalProducts = visibleProducts(true).length;
  fill(colorAlpha(themeLineColor(), 215));
  noStroke();
  textFont(fontes.robotoCondensed);
  textSize(13);
  textAlign(LEFT, TOP);
  text(`${totalProducts} obras conectadas a ${totalTags} tags - Material: ${material} - Estetico: ${estetico} - Tecnica: ${tecnica}`, visualX() + 10, 12);
}

function drawVisualizationMenu() {
  const x = menuX();
  const y = menuY();
  const w = menuW();
  const h = menuH();

  noStroke();
  fill(lightMode ? color(245, 242, 234, 240) : color(16, 16, 16, 236));
  rect(x, y, w, h, 9);
  stroke(colorAlpha(themeLineColor(), lightMode ? 58 : 74));
  strokeWeight(1);
  noFill();
  rect(x + 0.5, y + 0.5, w - 1, h - 1, 9);
  stroke(colorAlpha(themeLineColor(), lightMode ? 28 : 38));
  line(x + 13, y + 49, x + w - 13, y + 49);

  drawChangeViewButton();
  drawLegendButton();
  drawExportButton();
}

function drawChangeViewButton() {
  const bx = viewButtonX();
  const by = viewButtonY();
  const bw = viewButtonW();
  const bh = viewButtonH();
  const hover = insideRect(mouseX, mouseY, bx, by, bw, bh);
  stroke("#FFFFFF");
  strokeWeight(1.5);
  fill(hover ? color(36, 36, 36, 230) : color(16, 16, 16, 205));
  rect(bx, by, bw, bh, 6);

  drawChangeIcon(bx + 18, by + bh / 2, "#FFFFFF");
  fill("#FFFFFF");
  noStroke();
  textFont(fontes.robotoCondensed);
  textSize(14);
  textAlign(LEFT, CENTER);
  text(viewLabel(), bx + 37, by + bh / 2 - 1);
}

function drawChangeIcon(cx, cy, iconColor) {
  push();
  translate(cx, cy);
  noFill();
  stroke(iconColor);
  strokeWeight(1.9);
  strokeCap(ROUND);
  arc(0, 0, 16, 16, -PI * 0.15, PI * 1.18);
  line(6.8, -5.2, 10.4, -8.2);
  line(6.8, -5.2, 2.6, -7.4);
  pop();
}

function drawLegendButton() {
  const cx = legendButtonX();
  const cy = menuIconY();
  const d = 21;
  noStroke();
  fill(dist(mouseX, mouseY, cx, cy) <= 15 ? color(255, 255, 255, 34) : color(255, 255, 255, 0));
  circle(cx, cy, 30);
  noFill();
  stroke(themeLineColor());
  strokeWeight(1.7);
  circle(cx, cy, d * 0.9);
  line(cx, cy - d * 0.05, cx, cy + d * 0.25);
  point(cx, cy - d * 0.25);
}

function drawExportButton() {
  const cx = exportButtonX();
  const cy = menuIconY();
  const d = 21;
  noStroke();
  fill(dist(mouseX, mouseY, cx, cy) <= 15 ? color(255, 255, 255, 34) : color(255, 255, 255, 0));
  circle(cx, cy, 30);
  noFill();
  stroke(themeLineColor());
  strokeWeight(1.7);
  rect(cx - d * 0.27, cy - d * 0.06, d * 0.54, d * 0.34);
  line(cx, cy - d * 0.42, cx, cy + d * 0.04);
  line(cx, cy - d * 0.42, cx - d * 0.16, cy - d * 0.22);
  line(cx, cy - d * 0.42, cx + d * 0.16, cy - d * 0.22);
}

function drawThemeButton() {
  const cx = themeButtonX();
  const cy = menuIconY();
  const d = 21;
  noStroke();
  fill(dist(mouseX, mouseY, cx, cy) <= 15 ? color(255, 255, 255, 34) : color(255, 255, 255, 0));
  circle(cx, cy, 30);
  stroke(themeLineColor());
  strokeWeight(1.4);
  fill(lightMode ? "#111111" : "#FFFFFF");
  circle(cx, cy, d);
  if (lightMode) {
    noStroke();
    fill("#FFFFFF");
    circle(cx - d * 0.08, cy, d * 0.42);
    fill("#111111");
    circle(cx + d * 0.08, cy - d * 0.04, d * 0.42);
  } else {
    stroke("#000000");
    strokeWeight(1.1);
    noFill();
    circle(cx, cy, d * 0.34);
    for (let i = 0; i < 8; i++) {
      const a = i * TWO_PI / 8;
      line(cx + cos(a) * d * 0.26, cy + sin(a) * d * 0.26, cx + cos(a) * d * 0.39, cy + sin(a) * d * 0.39);
    }
  }
}

function drawDetailsLegendPanel() {
  if (!detailsPanelOpen) return;
  const px = constrain(viewButtonX() + viewButtonW() - 220, visualX() + 12, productPanelX() - 232);
  const py = constrain(menuIconY() + 20, 12, height - 220);
  noStroke();
  fill(34, 34, 34, 248);
  rect(px, py, 220, 208);
  fill("#FFFFFF");
  textFont(fontes.robotoCondensed);
  textSize(16);
  textAlign(LEFT, TOP);
  text("Legenda", px + 14, py + 12);
  const items = [
    [COLORS.yellow, "Obra brasileira"],
    [COLORS.magenta, "Obra internacional"],
    [COLORS.blue, "Material"],
    [COLORS.green, "Tecnicas de construcao"],
    [COLORS.red, "Estetico"],
    [COLORS.cyan, "Pais com movimento"],
  ];
  for (let i = 0; i < items.length; i++) {
    noStroke();
    fill(items[i][0]);
    circle(px + 22, py + 45 + i * 28, 16);
    fill("#FFFFFF");
    textSize(14);
    textAlign(LEFT, CENTER);
    text(items[i][1], px + 46, py + 44 + i * 28);
  }
}

function drawExportPanel() {
  if (!exportPanelOpen) return;
  const px = constrain(exportButtonX() - 180, visualX() + 12, productPanelX() - 282);
  const py = constrain(menuIconY() + 20, 12, height - 230);
  noStroke();
  fill(34, 34, 34, 248);
  rect(px, py, 270, 210);
  fill("#FFFFFF");
  textFont(fontes.robotoCondensed);
  textSize(22);
  textAlign(LEFT, TOP);
  text("Exportar", px + 18, py + 14);
  drawExportOption("JPG", px + 18, py + 58);
  drawExportOption("PNG", px + 18, py + 99);
  drawExportOption("SVG", px + 18, py + 140);
  fill(frameCount - exportMessageFrame < 180 ? COLORS.yellow : "#FFFFFF");
  textSize(12);
  text(exportMessage, px + 18, py + 182, 232, 24);
}

function drawExportOption(label, x, y) {
  const hover = insideRect(mouseX, mouseY, x, y, 86, 28);
  noStroke();
  fill(hover ? COLORS.yellow : "#FFFFFF");
  rect(x, y, 86, 28, 14);
  fill("#000000");
  textFont(fontes.robotoCondensed);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(label, x + 43, y + 13);
}

function menuW() { return 142; }
function menuH() { return 82; }
function menuX() { return productPanelX() - menuW() - 12; }
function menuY() { return 12; }
function menuIconY() { return menuY() + 63; }
function viewButtonX() { return menuX() + 10; }
function viewButtonY() { return menuY() + 8; }
function viewButtonW() { return menuW() - 20; }
function viewButtonH() { return 30; }
function themeButtonX() { return menuX() + 38; }
function legendButtonX() { return menuX() + menuW() / 2; }
function exportButtonX() { return menuX() + menuW() - 38; }

function viewLabel() {
  if (activeView === VISAO_CIRCULAR) return "Circular";
  if (activeView === VISAO_BOLHAS) return "Bolhas";
  if (activeView === VISAO_MAPA_MUNDI) return "Mapa";
  return "Tempo";
}

function drawCircularView(visible) {
  drawVisualizationBackground();
  const cx = visualX() + visualW() / 2;
  const cy = (height - TIMELINE_H) / 2;
  const baseRadius = Math.min(380, Math.max(80, Math.min(visualW() - 320, height - TIMELINE_H - 380) / 2));
  const tags = tagsForCircular();
  const tagPositions = new Map();

  const productsVisual = [];
  const typeTags = selectedTags().filter((tag) => tag.dimension === "tipo_obra");
  for (const product of products) {
    if (product.year < yearStart || product.year > yearEnd) continue;
    if (typeTags.length && !typeTags.some((tag) => product.tagKeys.has(tag.key))) continue;
    const matched = tags.filter((tag) => product.tagKeys.has(tag.key));
    if (!matched.length) continue;
    if (focusedCircularTagKey && !matched.some((tag) => tag.key === focusedCircularTagKey)) continue;
    productsVisual.push({ product, tags: matched, weight: matched.length });
  }
  productsVisual.sort((a, b) => b.weight - a.weight || originWeight(b.product) - originWeight(a.product) || a.product.name.localeCompare(b.product.name, "pt-BR"));

  if (!selectedProduct && productsVisual.length) selectProduct(productsVisual[0].product);

  // Pre-calculate max radius to determine scale factor
  let maxCornerDist = baseRadius + 160; 
  let slotCalc = 0;
  for (const item of productsVisual) {
    if (slotCalc >= 38) break;
    const segments = Math.min(constrain(item.weight, 1, 3), 38 - slotCalc);
    const cardH = Math.max(38, (TWO_PI * baseRadius / 38) * segments * 0.92);
    const cardW = constrain(measureText(item.product.name, 18) + 28, 100, 150);
    const dist = Math.hypot(baseRadius + cardW + 6, cardH / 2);
    if (dist > maxCornerDist) maxCornerDist = dist;
    slotCalc += segments;
  }

  // Calculate safe boundaries (45px top padding for text)
  const safeR_Y = cy - 45;
  const safeR_X = visualW() / 2 - 20;
  const scaleRatio = Math.min(1, safeR_Y / maxCornerDist, safeR_X / maxCornerDist);
  const radius = baseRadius;

  push();
  translate(cx, cy);
  scale(scaleRatio);
  translate(-cx, -cy);

  noFill();
  stroke(themeLineColor());
  strokeWeight(13);
  drawDashedCircle(cx, cy, radius, 38);

  for (const tag of tags) {
    const pos = tagPosition(tag, cx, cy, radius * 0.72);
    tagPositions.set(tag.key, pos);
    const active = !focusedCircularTagKey || focusedCircularTagKey === tag.key;
    noStroke();
    fill(colorAlpha(tag.color, active ? 255 : 75));
    circle(pos.x, pos.y, active ? 11 : 8);
    hitAreas.push({ kind: "tag", tag, cx: cx + (pos.x - cx) * scaleRatio, cy: cy + (pos.y - cy) * scaleRatio, r: 13 * scaleRatio });
  }

  let slot = 0;
  for (const item of productsVisual) {
    if (slot >= 38) break;
    const segments = Math.min(constrain(item.weight, 1, 3), 38 - slot);
    const angle = -HALF_PI + (slot + (segments - 1) / 2) * TWO_PI / 38;
    const cardW = constrain(measureText(item.product.name, 18) + 28, 100, 150);
    const cardH = Math.max(38, (TWO_PI * radius / 38) * segments * 0.92);
    const cardCx = cx + cos(angle) * (radius + cardW / 2 + 6);
    const cardCy = cy + sin(angle) * (radius + cardW / 2 + 6);
    const targetX = cx + cos(angle) * radius;
    const targetY = cy + sin(angle) * radius;
    const rotation = cos(angle) < 0 ? angle + PI : angle;

    for (const tag of item.tags) {
      const pos = tagPositions.get(tag.key);
      const active = !focusedCircularTagKey || focusedCircularTagKey === tag.key;
      stroke(colorAlpha(tag.color, active ? 230 : 55));
      strokeWeight(active ? 1.8 : 0.8);
      line(pos.x, pos.y, targetX, targetY);
    }

    drawProductCard(item.product, cardCx, cardCy, cardW, cardH, rotation);
    const hitCx = cx + (cardCx - cx) * scaleRatio;
    const hitCy = cy + (cardCy - cy) * scaleRatio;
    hitAreas.push({ kind: "product", product: item.product, shape: "rotatedRect", cx: hitCx, cy: hitCy, w: cardW * scaleRatio, h: cardH * scaleRatio, rotation });
    slot += segments;
  }
  
  pop();

  if (!productsVisual.length) {
    drawCenteredVisualMessage(selectedTagKeys.size ? "Nenhum produto encontrado para os filtros atuais" : "Selecione tags no filtro para visualizar os produtos", cx, cy);
  }

  const focused = tagsByKey.get(focusedCircularTagKey);
  if (focused) {
    fill(themeLineColor());
    noStroke();
    textFont(fontes.robotoCondensed);
    textSize(13);
    textAlign(CENTER, TOP);
    text(focused.label, cx, cy + radius + 28);
  }
  drawYearBand();
}

function drawDashedCircle(cx, cy, radius, segments) {
  const step = TWO_PI / segments;
  for (let i = 0; i < segments; i++) {
    const center = -HALF_PI + i * step;
    arc(cx, cy, radius * 2, radius * 2, center - step * 0.21, center + step * 0.21);
  }
}

function drawProductCard(product, cx, cy, w, h, rotation) {
  push();
  translate(cx, cy);
  rotate(rotation);
  const selected = selectedProduct && selectedProduct.key === product.key;
  if (selected) {
    stroke(themeLineColor());
    strokeWeight(2.4);
  } else {
    noStroke();
  }
  fill(product.origin === "brasileiro" ? COLORS.yellow : COLORS.magenta);
  rectMode(CENTER);
  rect(0, 0, w, h);
  if (selected) {
    noFill();
    stroke(lightMode ? color(255, 255, 255, 135) : color(0, 0, 0, 135));
    strokeWeight(0.9);
    rect(0, 0, w - 4, h - 4);
  }
  fill("#000000");
  noStroke();
  textFont(fontes.afacad);
  textStyle(BOLD);
  drawProductCardLabel(product.name, w - 18, h - 8);
  textStyle(NORMAL);
  pop();
}

function drawProductCardLabel(label, maxW, maxH) {
  const cleanLabel = cleanText(label);
  const layout = fitProductCardLabel(cleanLabel, maxW, maxH);
  textSize(layout.size);
  textAlign(CENTER, CENTER);
  const lineH = layout.size * 0.94;
  const startY = -((layout.lines.length - 1) * lineH) / 2;
  for (let i = 0; i < layout.lines.length; i++) {
    text(layout.lines[i], 0, startY + i * lineH);
  }
}

function fitProductCardLabel(label, maxW, maxH) {
  for (let size = 22; size >= 12; size--) {
    textSize(size);
    const lines = wrapProductCardLabel(label, maxW);
    const lineH = size * 0.94;
    if (lines.length * lineH <= maxH + 1 && lines.every((line) => textWidth(line) <= maxW + 0.5)) {
      return { lines, size };
    }
  }
  textSize(12);
  const maxLines = Math.max(1, Math.floor(maxH / (12 * 0.94)));
  const lines = wrapProductCardLabel(label, maxW).slice(0, maxLines);
  if (lines.length && textWidth(lines[lines.length - 1]) > maxW) {
    lines[lines.length - 1] = fitLineWithEllipsis(lines[lines.length - 1], maxW);
  }
  return { lines, size: 12 };
}

function wrapProductCardLabel(label, maxW) {
  const words = label.split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || textWidth(candidate) <= maxW) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function fitLineWithEllipsis(line, maxW) {
  let result = line;
  while (result.length > 1 && textWidth(`${result}...`) > maxW) result = result.slice(0, -1);
  return `${result}...`;
}

function drawBubbleView(productsVisible) {
  drawVisualizationBackground();
  const cx = visualX() + visualW() / 2;
  const cy = (height - TIMELINE_H) / 2;
  const outerR = Math.max(140, Math.min(visualW(), height - TIMELINE_H) * 0.46);
  const bubbleKey = `${productsVisible.map((p) => p.key).join(",")}|${cx}|${cy}|${outerR}`;
  if (bubbleKey !== _bubbleCacheKey || !_cachedBubbleGroups) {
    _cachedBubbleGroups = buildBubbleGroups(productsVisible, cx, cy, outerR);
    _bubbleCacheKey = bubbleKey;
  }
  const groups = _cachedBubbleGroups;

  if (!selectedProduct && groups.length && groups[0].products.length) selectProduct(groups[0].products[0]);

  noFill();
  stroke(themeLineColor());
  strokeWeight(4);
  circle(cx, cy, outerR * 2);

  for (const group of groups) {
    stroke("#000000");
    strokeWeight(2);
    fill("#D9D9D9");
    circle(group.x, group.y, group.r * 2);
    drawProductsInBubble(group);
    fill("#000000");
    noStroke();
    textFont(fontes.afacad);
    textStyle(BOLD);
    textSize(fitTextSize(group.name, group.r * 1.52, 26, 11));
    textAlign(CENTER, CENTER);
    text(group.name, group.x - group.r * 0.75, group.y - 24, group.r * 1.5, 54);
    textStyle(NORMAL);
  }

  if (!groups.length) drawCenteredVisualMessage("Nenhum produto encontrado para os filtros atuais", cx, cy);
  drawYearBand();
}

function buildBubbleGroups(productsVisible, cx, cy, outerR) {
  const byName = new Map();
  for (const product of productsVisible) {
    if (product.year < yearStart || product.year > yearEnd) continue;
    const name = product.origin === "brasileiro" ? "Obras brasileiras" : movementName(product.movementRaw) || "Sem escola";
    if (!byName.has(name)) byName.set(name, { name, products: [] });
    byName.get(name).products.push(product);
  }
  const groups = Array.from(byName.values()).sort((a, b) => b.products.length - a.products.length || a.name.localeCompare(b.name, "pt-BR"));
  let area = 0;
  for (const group of groups) {
    group.products.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    group.r = constrain(45 + Math.sqrt(group.products.length) * 24, 55, 150);
    area += PI * group.r * group.r;
  }
  const available = PI * outerR * outerR * 0.85; // Allow more density
  const scale = area > available ? Math.sqrt(available / area) : 1;
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    group.r = constrain(group.r * scale, 45, 150);
    if (i === 0) {
      group.x = cx;
      group.y = cy;
    } else {
      const angle = -HALF_PI + i * GOLDEN_ANGLE;
      const distance = Math.min(outerR - group.r - 10, 42 + Math.sqrt(i) * 72);
      group.x = cx + cos(angle) * distance;
      group.y = cy + sin(angle) * distance;
    }
  }
  for (let iter = 0; iter < 220; iter++) {
    for (const group of groups) {
      group.x += (cx - group.x) * 0.0035;
      group.y += (cy - group.y) * 0.0035;
    }
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const a = groups[i];
        const b = groups[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.max(0.001, Math.hypot(dx, dy));
        const minD = a.r + b.r + 4;
        if (d < minD) {
          const push = (minD - d) * 0.5;
          a.x -= (dx / d) * push;
          a.y -= (dy / d) * push;
          b.x += (dx / d) * push;
          b.y += (dy / d) * push;
        }
      }
    }
    for (const group of groups) {
      const dx = group.x - cx;
      const dy = group.y - cy;
      const d = Math.hypot(dx, dy);
      const maxD = outerR - group.r - 3;
      if (d > maxD) {
        group.x = cx + (dx / d) * maxD;
        group.y = cy + (dy / d) * maxD;
      }
    }
  }
  return groups;
}

function drawProductsInBubble(group) {
  const total = group.products.length;
  if (!total) return;
  const usable = Math.max(6, group.r - Math.max(18, group.r * 0.25));
  const dotR = constrain(usable / Math.max(2.2, Math.sqrt(total) * 2.2), 5, 9);
  for (let i = 0; i < total; i++) {
    const product = group.products[i];
    const angle = i * GOLDEN_ANGLE - HALF_PI;
    const d = Math.sqrt((i + 0.5) / total) * usable;
    const x = total === 1 ? group.x : group.x + cos(angle) * d;
    const y = total === 1 ? group.y + group.r * 0.28 : group.y + sin(angle) * d;
    const selected = selectedProduct && selectedProduct.key === product.key;
    if (selected) {
      stroke(themeLineColor());
      strokeWeight(2.3);
    } else {
      noStroke();
    }
    fill(product.origin === "brasileiro" ? COLORS.yellow : COLORS.magenta);
    circle(x, y, (dotR + (selected ? 1.5 : 0)) * 2);
    hitAreas.push({ kind: "product", product, shape: "circle", cx: x, cy: y, r: dotR + 7 });
  }
}

function drawTimelineView(productsVisible) {
  drawVisualizationBackground();
  const axisY = (height - TIMELINE_H) * 0.5;
  const x1 = visualX() + 40;
  const x2 = visualX() + visualW() - 40;
  stroke(themeLineColor());
  strokeWeight(3);
  line(visualX(), axisY, visualX() + visualW(), axisY);
  const visible = productsVisible.filter((product) => product.year >= yearStart && product.year <= yearEnd).sort((a, b) => a.year - b.year || a.name.localeCompare(b.name, "pt-BR"));
  if (!selectedProduct && visible.length) selectProduct(visible[0]);
  if (!visible.length) {
    drawCenteredVisualMessage("Nenhum produto encontrado para os filtros atuais", visualX() + visualW() / 2, axisY - 42);
    drawYearBand();
    return;
  }
  const positions = [];
  const baseR = visible.length > 140 ? 5 : visible.length > 85 ? 6 : 8;
  const maxLinks = Math.max(1, ...visible.map(activeLinkCount));
  for (const product of visible) {
    const px = yearToProductX(product.year, x1, x2);
    const links = activeLinkCount(product);
    const r = links > 0 ? lerp(baseR, baseR * 2.15, links / maxLinks) : baseR;
    const py = timelineYWithoutOverlap(px, axisY, r * 2.8, r, positions);
    positions.push({ x: px, y: py, r });
    const selected = selectedProduct && selectedProduct.key === product.key;
    if (selected) {
      stroke(themeLineColor());
      strokeWeight(2.5);
    } else {
      noStroke();
    }
    fill(product.origin === "brasileiro" ? COLORS.yellow : COLORS.magenta);
    circle(px, py, (r + (selected ? 3 : 0)) * 2);
    hitAreas.push({ kind: "product", product, shape: "circle", cx: px, cy: py, r: r + 8 });
  }
  drawYearBand();
}

function yearToProductX(year, x1, x2) {
  if (yearStart === yearEnd) return (x1 + x2) / 2;
  return map(constrain(year, yearStart, yearEnd), yearStart, yearEnd, x1, x2);
}

function timelineYWithoutOverlap(px, axisY, stepY, r, positions) {
  const layers = [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6, -7, 7, -8, 8, -9, 9, -10, 10];
  for (const layer of layers) {
    const py = axisY + layer * stepY;
    if (py < 54 || py > height - TIMELINE_H - 42) continue;
    if (!positions.some((pos) => dist(px, py, pos.x, pos.y) < r + pos.r + 4)) return py;
  }
  return axisY + layers[layers.length - 1] * stepY;
}

function activeLinkCount(product) {
  let count = 0;
  for (const key of selectedTagKeys) if (product.tagKeys.has(key)) count++;
  return count;
}

function drawMapView(productsVisible) {
  drawVisualizationBackground();
  const mapBox = currentMapBox();
  const activeSchools = schools
    .filter((school) => school.end >= yearStart && school.start <= yearEnd)
    .flatMap((school) => school.locations.map((location) => ({ school, location })));
  const activeCountries = new Set(activeSchools.map((item) => normalizeCountry(item.location.country)));
  for (const country of geoCountries) {
    const active = activeCountries.has(normalizeCountry(country.name));
    fill(active ? (lightMode ? "#CFE8E4" : "#245257") : lightMode ? "#DAD6CC" : "#2A2A2A");
    stroke(active ? colorAlpha(COLORS.cyan, 170) : lightMode ? "#969186" : "#4A4A4A");
    strokeWeight(active ? 0.9 : 0.55);
    for (const ring of country.rings) {
      beginShape();
      for (const point of ring) {
        const projected = project(point[0], point[1], mapBox);
        vertex(projected.x, projected.y);
      }
      endShape(CLOSE);
    }
  }

  for (const item of activeSchools) {
    const pos = project(item.location.lon, item.location.lat, mapBox);
    stroke(themeVisualBackground());
    strokeWeight(1.4);
    fill(COLORS.cyan);
    triangle(pos.x, pos.y - 8, pos.x - 7, pos.y + 6, pos.x + 7, pos.y + 6);
  }

  const points = productsVisible
    .filter((product) => product.year >= yearStart && product.year <= yearEnd)
    .map((product) => ({ product, location: productLocation(product) }))
    .filter((item) => item.location);
  if (!selectedProduct && points.length) selectProduct(points[0].product);
  const clusters = makeMapClusters(points, mapBox);
  for (const cluster of clusters) {
    if (cluster.points.length === 1 || mapState.zoom > 5.2) drawMapPoint(cluster.points[0]);
    else drawMapCluster(cluster);
  }
  if (!points.length) drawCenteredVisualMessage("Nenhuma obra com localizacao no intervalo atual", visualX() + visualW() / 2, (height - TIMELINE_H) / 2);

  fill(colorAlpha(themeLineColor(), 205));
  noStroke();
  textFont(fontes.robotoCondensed);
  textSize(13);
  textAlign(LEFT, TOP);
  text(`${points.length} obras localizadas - ${activeSchools.length} escolas/movimentos - zoom ${mapState.zoom.toFixed(1)}x`, visualX() + 18, 36);
  drawYearBand();
}

function currentMapBox() {
  const maxW = Math.max(260, visualW() - 70);
  const maxH = Math.max(180, height - TIMELINE_H - 116);
  const w = Math.min(maxW, maxH * 2.48);
  const h = w / 2.48;
  return {
    x: visualX() + (visualW() - w) / 2,
    y: 78 + Math.max(0, (height - TIMELINE_H - 116 - h) / 2),
    w,
    h,
  };
}

function project(lon, lat, box) {
  const xBase = map(lon, -180, 180, box.x, box.x + box.w);
  const yBase = map(constrain(lat, -60, 85), 85, -60, box.y, box.y + box.h);
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  return { x: cx + (xBase - cx) * mapState.zoom + mapState.panX, y: cy + (yBase - cy) * mapState.zoom + mapState.panY };
}

function makeMapClusters(points, box) {
  const expanded = [];
  const perLocation = new Map();
  for (const point of points) {
    const key = `${point.location.name}:${point.location.lat}:${point.location.lon}`;
    const index = perLocation.get(key) || 0;
    perLocation.set(key, index + 1);
    const pos = project(point.location.lon, point.location.lat, box);
    if (index > 0 && mapState.zoom > 2.6) {
      const angle = index * GOLDEN_ANGLE;
      const radius = Math.min(14 * Math.sqrt(index), 44);
      pos.x += cos(angle) * radius;
      pos.y += sin(angle) * radius;
    }
    expanded.push({ ...point, x: pos.x, y: pos.y });
  }
  const threshold = mapState.zoom < 2 ? 52 : mapState.zoom < 3.8 ? 34 : mapState.zoom < 5.2 ? 20 : 0;
  if (!threshold) return expanded.map((point) => ({ x: point.x, y: point.y, points: [point] }));
  const clusters = [];
  for (const point of expanded) {
    let cluster = clusters.find((item) => dist(point.x, point.y, item.x, item.y) <= threshold);
    if (!cluster) {
      cluster = { x: point.x, y: point.y, points: [] };
      clusters.push(cluster);
    }
    cluster.points.push(point);
    cluster.x = cluster.points.reduce((sum, item) => sum + item.x, 0) / cluster.points.length;
    cluster.y = cluster.points.reduce((sum, item) => sum + item.y, 0) / cluster.points.length;
  }
  return clusters;
}

function drawMapPoint(point) {
  const selected = selectedProduct && selectedProduct.key === point.product.key;
  const r = selected ? 10 : 7;
  if (selected) {
    stroke(themeLineColor());
    strokeWeight(2.4);
  } else {
    stroke(themeVisualBackground());
    strokeWeight(1.2);
  }
  fill(point.product.origin === "brasileiro" ? COLORS.yellow : COLORS.magenta);
  circle(point.x, point.y, r * 2);
  hitAreas.push({ kind: "product", product: point.product, shape: "circle", cx: point.x, cy: point.y, r: r + 6 });
}

function drawMapCluster(cluster) {
  const total = cluster.points.length;
  const hasBR = cluster.points.some((point) => point.product.origin === "brasileiro");
  const hasIntl = cluster.points.some((point) => point.product.origin === "internacional");
  const r = constrain(13 + Math.sqrt(total) * 7, 20, 58);
  stroke(themeLineColor());
  strokeWeight(1);
  fill(hasBR && hasIntl ? COLORS.yellow : hasBR ? COLORS.yellow : COLORS.magenta);
  circle(cluster.x, cluster.y, r * 2);
  if (hasBR && hasIntl) {
    noStroke();
    fill(colorAlpha(COLORS.magenta, 210));
    arc(cluster.x, cluster.y, r * 2, r * 2, -HALF_PI, HALF_PI);
  }
  fill(hasIntl && !hasBR ? "#FFFFFF" : "#000000");
  noStroke();
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(Math.min(21, r * 0.78));
  textAlign(CENTER, CENTER);
  text(String(total), cluster.x, cluster.y - 1);
  textStyle(NORMAL);
  hitAreas.push({ kind: "cluster", cluster, shape: "circle", cx: cluster.x, cy: cluster.y, r: r + 6 });
}

function drawYearBand() {
  const tx = visualX() + 4;
  const ty = height - TIMELINE_H;
  noStroke();
  fill(themeTimelineColor());
  rect(tx, ty + 28, timelineW(), 42);
  const xStart = yearToX(yearStart);
  const xEnd = yearToX(yearEnd);
  fill(COLORS.yellow);
  rect(xStart + 7, ty + 28, Math.max(0, xEnd - xStart - 7), 42);
  stroke(themeHatchColor());
  strokeWeight(3);
  for (let hx = xStart - 60; hx < xEnd; hx += 18) line(hx, ty + 70, hx + 58, ty + 28);
  noStroke();
  fill(themeTimelineColor());
  rect(tx, ty + 28, Math.max(0, xStart + 7 - tx), 42);
  rect(xEnd, ty + 28, Math.max(0, tx + timelineW() - xEnd), 42);
  fill(themeLineColor());
  rect(xStart, ty + 6, 7, 48);
  rect(xEnd, ty + 6, 7, 48);
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(22);
  textAlign(CENTER, BOTTOM);
  text(String(yearStart), constrain(xStart, visualX() + 48, visualX() + visualW() - 48), ty + 7);
  text(String(yearEnd), constrain(xEnd, visualX() + 48, visualX() + visualW() - 48), ty + 7);
  textStyle(NORMAL);
}

function yearToX(year) {
  const tx = visualX() + 4;
  return tx + map(year, YEAR_MIN, YEAR_MAX, 0, timelineW() - 7);
}

function xToYear(x) {
  const tx = visualX() + 4;
  const end = tx + timelineW() - 7;
  const value = map(constrain(x, tx, end), tx, end, YEAR_MIN, YEAR_MAX);
  return constrain(Math.round(value / 10) * 10, YEAR_MIN, YEAR_MAX);
}

function drawFilterPanel() {
  push();
  scale(filterPanelScale());
  
  drawNavSidebar();
  
  translate(LAYOUT_NAV_W, 0);
  
  drawFilterHeader();
  drawFilterCards();
  drawFilterBody();
  pop();
}

function drawNavSidebar() {
  fill("#ffffff");
  noStroke();
  rect(0, 0, LAYOUT_NAV_W, height / filterPanelScale());
  
  fill("#000000");
  textFont(fontes.newAmsterdam);
  textSize(32);
  textAlign(CENTER, TOP);
  text("TAGrafia", LAYOUT_NAV_W / 2, 30);
  
  textFont(fontes.robotoCondensed);
  textSize(16);
  text("cA", LAYOUT_NAV_W / 2, 70);
  
  stroke(230);
  strokeWeight(1);
  line(LAYOUT_NAV_W - 1, 0, LAYOUT_NAV_W - 1, height / filterPanelScale());
  
  const navItems = [
    { label: "Filtros", y: 140, icon: null },
    { label: "Trocar\nVisualização", y: 250, icon: icones.change },
    { label: "Exportar", y: 360, icon: icones.export },
    { label: "Sobre", y: 470, icon: null }
  ];
  
  for (let item of navItems) {
    fill("#000000");
    noStroke();
    textFont(fontes.robotoCondensed);
    textSize(15);
    textAlign(CENTER, CENTER);
    text(item.label, LAYOUT_NAV_W / 2, item.y + 40);
    
    if (item.label === "Filtros") {
      fill("#959fff");
      noStroke();
    } else {
      fill(245);
      stroke(220);
      strokeWeight(1);
    }
    rect(LAYOUT_NAV_W / 2 - 25, item.y - 20, 50, 50, 10);
    
    if (item.icon) {
      drawImageCentered(item.icon, LAYOUT_NAV_W / 2, item.y + 5, 30, 30);
    } else if (item.label === "Filtros") {
      // Draw standard filter icon for 'Filtros' (placeholder, since we don't have the exact image 49)
      drawImageCentered(icones.clear, LAYOUT_NAV_W / 2, item.y + 5, 24, 24);
    }
  }
}

function drawFilterHeader() {
  stroke("#000000");
  strokeWeight(2);
  fill(COLORS.yellow);
  rect(0, 0, LAYOUT_FILTRO_W, FILTER_HEADER_H);
  fill("#000000");
  noStroke();
  textFont(fontes.newAmsterdam);
  textSize(40);
  textAlign(CENTER, CENTER);
  text("FILTROS", LAYOUT_FILTRO_W / 2, FILTER_HEADER_H / 2);
}

function drawFilterCards() {
  const cardW = LAYOUT_FILTRO_W / 2;
  const footerH = 26;
  const cards = [
    ["material", "Material", icones.material, "#959fff"],
    ["tecnicas", "Técnica", icones.tecnicas, "#a7ff95"],
    ["estetico", "Estético", icones.estetico, "#ff9597"],
    ["tipo_obra", "Tipo", icones.tipo_obra, "#ffef95"],
  ];
  for (let i = 0; i < cards.length; i++) {
    const [dim, label, icon, bgColor] = cards[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col * cardW;
    const y = FILTER_HEADER_H + row * FILTER_CARD_H;
    const active = activeDimension === dim;
    
    // Draw background ONLY if active
    if (active) {
      noStroke();
      fill(bgColor);
      rect(x + 10, y + 10, cardW - 20, FILTER_CARD_H - footerH - 10, 10);
    }
    
    // Draw icon and text
    drawImageCentered(icon, x + cardW / 2, y + (FILTER_CARD_H - footerH) / 2, 45, 45);
    
    fill(panelTextColor());
    noStroke();
    textFont(fontes.robotoCondensed);
    textAlign(CENTER, CENTER);
    text(label, x + cardW / 2, y + FILTER_CARD_H - footerH / 2);
  }
}

function drawFilterBody() {
  noStroke();
  fill(panelBackground());
  rect(0, FILTER_BODY_Y, LAYOUT_FILTRO_W, height / filterPanelScale() - FILTER_BODY_Y);

  const catY = FILTER_BODY_Y + FILTER_CAT_OFFSET;
  const searchY = catY + FILTER_SEARCH_OFFSET;
  const clearY = searchY + FILTER_CLEAR_OFFSET;
  const listY = clearY + FILTER_LIST_OFFSET;

  noStroke();
  fill("#FFFFFF");
  rect(FILTER_BAR_X, catY, FILTER_BAR_W, 31, 15.5);
  fill("#000000");
  textFont(fontes.newAmsterdam);
  const categoryLabel = currentCategoryLabel();
  textSize(fitTextSize(categoryLabel, FILTER_BAR_W - 22, 22, 12));
  textAlign(CENTER, CENTER);
  text(categoryLabel, FILTER_BAR_X + FILTER_BAR_W / 2, catY + 15);

  fill("#FFFFFF");
  rect(FILTER_BAR_X, searchY, FILTER_BAR_W, 31, 15.5);
  textFont(fontes.robotoCondensed);
  textSize(14);
  textAlign(LEFT, CENTER);
  fill(tagSearch.length ? "#000000" : color(90));
  text(tagSearch.length ? tagSearch : "Pesquisar", FILTER_BAR_X + 13, searchY + 15);
  if (tagSearchActive && frameCount % 60 < 30) {
    const cx = FILTER_BAR_X + 13 + textWidth(tagSearch);
    stroke("#000000");
    strokeWeight(1);
    line(cx + 2, searchY + 8, cx + 2, searchY + 23);
  }

  fill(selectedTagKeys.size ? "#D9D9D9" : color(190));
  noStroke();
  rect(FILTER_BAR_X, clearY, FILTER_BAR_W, 28, 14);
  drawImageCentered(icones.clear, FILTER_BAR_X + FILTER_BAR_W / 2, clearY + 14, 22, 22);

  const maxH = height / filterPanelScale() - 10;
  if (categorySelectorOpen && activeDimension !== "tipo_obra") drawCategorySelector(listY, maxH);
  else drawTagList(listY, maxH);
}

function filterListY() {
  return FILTER_BODY_Y + FILTER_CAT_OFFSET + FILTER_SEARCH_OFFSET + FILTER_CLEAR_OFFSET + FILTER_LIST_OFFSET;
}

function currentCategoryLabel() {
  if (activeDimension === "tipo_obra") return "TAGS ATIVAS";
  const active = activeCategoryByDimension[activeDimension];
  if (active === -2) return "TAGS DISPONIVEIS";
  if (active === -1) return "TAGS ATIVAS";
  const option = categoryOptions(activeDimension)[active];
  return option ? option.label.toUpperCase() : "TAGS ATIVAS";
}

function categoryOptions(dimension) {
  const observed = new Set((tagsByDimension[dimension] || []).map((tag) => tag.category));
  return (CATEGORY_FILTERS[dimension] || [])
    .map(([label]) => ({ label, category: label }))
    .filter((option) => observed.has(option.category))
    .concat(observed.has("Sem agrupamento") ? [{ label: "Sem agrupamento", category: "Sem agrupamento" }] : []);
}

function drawCategorySelector(listY, listBottom) {
  const options = [
    { label: "Tags disponiveis", value: -2 },
    { label: "Tags ativas", value: -1 },
    ...categoryOptions(activeDimension).map((option, index) => ({ label: option.label, value: index })),
  ];
  const rowH = 34;
  noStroke();
  fill(lightMode ? "#FFFFFF" : "#D9D9D9");
  rect(0, listY - 6, 255, Math.max(0, listBottom - listY + 6));
  for (let i = 0; i < options.length; i++) {
    const y = listY + i * rowH;
    if (y > listBottom) break;
    const option = options[i];
    const active = activeCategoryByDimension[activeDimension] === option.value;
    if (active) {
      noStroke();
      fill(COLORS.yellow);
      rect(13, y + rowH - 6, 229, 3);
    }
    stroke(lightMode ? color(0, 0, 0, 65) : color(0, 0, 0, 80));
    strokeWeight(1);
    line(13, y + rowH - 3, 242, y + rowH - 3);
    fill("#000000");
    noStroke();
    textFont(fontes.newAmsterdam);
    textSize(fitTextSize(option.label, 225, 18, 10));
    textAlign(LEFT, BASELINE);
    text(option.label, 18, y + rowH / 2 + 6);
  }
}

function drawTagList(listY, listBottom) {
  const tags = tagsToDisplay();
  const maxScroll = Math.max(0, tags.length * FILTER_TAG_ROW_H - (listBottom - listY));
  tagScroll = constrain(tagScroll, 0, maxScroll);

  // Clip to prevent tags from bleeding outside the list area
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, listY, LAYOUT_FILTRO_W, listBottom - listY);
  drawingContext.clip();

  for (let i = 0; i < tags.length; i++) {
    const y = listY - tagScroll + i * FILTER_TAG_ROW_H;
    if (y + FILTER_TAG_ROW_H < listY || y > listBottom) continue;
    if (i % 2 === 1) {
      noStroke();
      fill(lightMode ? color(0, 0, 0, 12) : color(255, 255, 255, 9));
      rect(0, y, LAYOUT_FILTRO_W, FILTER_TAG_ROW_H);
    }
    drawFilterTag(tags[i], y, FILTER_TAG_ROW_H);
  }

  drawingContext.restore();

  if (maxScroll > 0) {
    const trackX = 8;
    const trackH = listBottom - listY;
    const thumbH = Math.max(34, trackH * trackH / (trackH + maxScroll));
    const thumbY = listY + map(tagScroll, 0, maxScroll, 0, trackH - thumbH);
    noStroke();
    fill(lightMode ? color(0, 0, 0, 45) : color(255, 255, 255, 45));
    rect(trackX, listY, 5, trackH, 2.5);
    fill(COLORS.yellow);
    rect(trackX, thumbY, 5, thumbH, 2.5);
  }
}

function drawFilterTag(tag, y, rowH) {
  const selected = selectedTagKeys.has(tag.key);
  
  const TAG_COLORS = {
    material: "#3e4ad3",   // Azul
    tecnicas: "#1a8511",   // Verde
    estetico: "#d33e4a",   // Vermelho
    tipo_obra: "#d3a81a"   // Amarelo escuro
  };
  
  if (selected) {
    noStroke();
    fill(TAG_COLORS[tag.dimension] || tag.color);
    rect(10, y + 2, LAYOUT_FILTRO_W - 20, rowH - 4, 8);
    fill("#ffffff"); // White text for selected
  } else {
    fill(panelTextColor());
  }

  noStroke();
  textFont(fontes.robotoCondensed);
  const badgeText = tag.dimension === "tipo_obra" ? "" : String(countProductsWithTagInCurrentType(tag));
  textSize(12);
  const badgeW = badgeText ? Math.max(24, textWidth(badgeText) + 14) : 0;
  const badgeX = LAYOUT_FILTRO_W - badgeW - 17;
  textSize(fitTextSize(tag.label, badgeX - 25, 16, 10));
  textAlign(LEFT, CENTER);
  text(tag.label, 20, y + rowH / 2 - 1);
  if (badgeText) {
    if (selected) {
      fill(255, 255, 255, 60);
    } else {
      fill(217, 217, 217, 210);
    }
    rect(badgeX, y + rowH / 2 - 11, badgeW, 22, 11);
    fill(selected ? "#ffffff" : color(90));
    textSize(12);
    textAlign(CENTER, CENTER);
    text(badgeText, badgeX + badgeW / 2, y + rowH / 2);
  }
}

function tagsToDisplay() {
  const search = normalizeText(tagSearch);
  return tagsByDimension[activeDimension]
    .filter((tag) => categoryAllowsTag(tag))
    .filter((tag) => !search || normalizeText(tag.label).includes(search))
    .sort((a, b) => Number(selectedTagKeys.has(b.key)) - Number(selectedTagKeys.has(a.key)) || b.count - a.count || a.label.localeCompare(b.label, "pt-BR"));
}

function categoryAllowsTag(tag) {
  if (activeDimension === "tipo_obra") return true;
  const active = activeCategoryByDimension[activeDimension];
  if (active === -2) return countProductsWithTagInCurrentType(tag) > 0;
  if (active === -1) return true;
  const option = categoryOptions(activeDimension)[active];
  return option ? tag.category === option.category : true;
}

function countProductsWithTagInCurrentType(tag) {
  if (_cachedTagCounts) {
    const cached = _cachedTagCounts.get(tag.key);
    if (cached !== undefined) return cached;
  }

  if (!_cachedTagCounts) {
    _cachedTagCounts = new Map();
    const typeTags = selectedTags().filter((item) => item.dimension === "tipo_obra");
    if (!typeTags.length) {
      // No type filter — all tags use their raw count
      for (const [key, t] of tagsByKey) _cachedTagCounts.set(key, t.count);
    } else {
      // Pre-compute counts for all tags at once
      const counters = new Map();
      for (const product of products) {
        if (!typeTags.some((typeTag) => product.tagKeys.has(typeTag.key))) continue;
        for (const key of product.tagKeys) {
          counters.set(key, (counters.get(key) || 0) + 1);
        }
      }
      for (const [key] of tagsByKey) _cachedTagCounts.set(key, counters.get(key) || 0);
    }
  }

  return _cachedTagCounts.get(tag.key) || 0;
}

function drawProductPanel() {
  const x = productPanelX();
  const w = productPanelW();
  const scale = layoutScale();
  const imageH = Math.round(337 * scale);
  const infoH = Math.round(80 * scale);
  const tabH = Math.round(55 * scale);
  const barH = Math.round(44 * scale);

  noStroke();
  fill(panelBackground());
  rect(x, 0, w, height);
  drawProductImage(x, 0, w, imageH, scale);
  drawProductImageLine(x, imageH, w, scale);
  drawProductInfo(x, imageH + 1, w, infoH, scale);
  drawProductTabs(x, imageH + infoH + 1, w, tabH, scale);

  if (productDetailsActive) drawProductDetails(x, imageH + infoH + tabH + 1, w, barH, scale);
  else drawSavedProducts(x, imageH + infoH + tabH + 1, w, scale);
}

function drawProductImage(x, y, w, h, scale) {
  fill("#FFFFFF");
  noStroke();
  rect(x, y, w, h);
  const img = getCurrentProductImage();
  if (img) drawImageContain(img, x, y, w, h);
  else {
    fill(17, 17, 17, 130);
    textFont(fontes.robotoCondensed);
    textSize(15 * scale);
    textAlign(CENTER, CENTER);
    text(selectedProduct && productImages(selectedProduct).length ? "Carregando imagem..." : "Imagem nao encontrada", x + w / 2, y + h / 2);
  }
  drawImageCentered(icones.left, x + 45 * scale, y + h - 64 * scale, 38 * scale, 38 * scale);
  drawImageCentered(icones.right, x + w - 45 * scale, y + h - 64 * scale, 38 * scale, 38 * scale);
}

function drawProductImageLine(x, y, w, scale) {
  noStroke();
  fill("#000000");
  const lineW = Math.min(w - 28 * scale, 475 * scale);
  rect(x + (w - lineW) / 2, y, lineW, 1);
}

function drawProductInfo(x, y, w, h, scale) {
  noStroke();
  fill("#F2F2F2");
  rect(x, y, w, h);
  if (!selectedProduct) {
    fill("#000000");
    textFont(fontes.robotoCondensed);
    textSize(15 * scale);
    textAlign(LEFT, CENTER);
    text("Selecione um produto", x + 14 * scale, y + h / 2);
    return;
  }

  const nameX = x + 14 * scale;
  const nameY = y + 25 * scale;
  const containerX = x + w - 168 * scale;
  const textW = Math.max(118 * scale, containerX - 14 * scale - nameX);
  fill("#000000");
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(fitTextSize(selectedProduct.name, textW, 18 * scale, 10 * scale));
  textAlign(LEFT, BASELINE);
  text(selectedProduct.name, nameX, nameY);
  const yearText = `(${selectedProduct.year || selectedProduct.dateRaw})`;
  const yearX = nameX + textWidth(selectedProduct.name) + 6 * scale;
  textFont(fontes.robotoCondensed);
  textStyle(NORMAL);
  textSize(15 * scale);
  let authorY = y + 48 * scale;
  if (yearX + textWidth(yearText) < nameX + textW) text(yearText, yearX, nameY - 1 * scale);
  else {
    text(yearText, nameX, y + 42 * scale);
    authorY = y + 57 * scale;
  }
  textAlign(LEFT, TOP);
  text(selectedProduct.author || "", nameX, authorY, textW, 24 * scale);
  drawProductInfoRibbon(x, y, w, h, scale);
}

function drawProductInfoRibbon(x, y, w, h, scale) {
  const ribbonH = 56 * scale;
  const containerX = x + w - 168 * scale;
  const containerY = y + h - ribbonH;
  noStroke();
  fill(COLORS.yellow);
  circle(containerX + ribbonH / 2, containerY + ribbonH / 2, ribbonH);
  rect(containerX + ribbonH / 2, containerY, x + w - (containerX + ribbonH / 2), ribbonH);
  const icons = [icones.save, icones.author, productionIcon()];
  for (let i = 0; i < icons.length; i++) {
    const cx = containerX + [46, 92, 138][i] * scale;
    const cy = containerY + ribbonH / 2;
    fill("#FFFFFF");
    circle(cx, cy, 38 * scale);
    drawImageCentered(icons[i], cx, cy, 24 * scale, 24 * scale);
  }
}

function drawProductTabs(x, y, w, h, scale) {
  drawProductTab(x, y, w / 2, h, "DETALHES DO PRODUTO", productDetailsActive, scale);
  drawProductTab(x + w / 2, y, w / 2, h, "PRODUTOS SALVOS", !productDetailsActive, scale);
}

function drawProductTab(x, y, w, h, label, active, scale) {
  stroke("#000000");
  strokeWeight(1);
  fill(active ? COLORS.yellow : lightMode ? "#D8CFAF" : COLORS.inactiveTab);
  rect(x, y, w, h);
  fill(active ? "#000000" : panelTextColor());
  noStroke();
  textFont(fontes.newAmsterdam);
  textSize(20 * scale);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2 + scale);
}

function drawProductDetails(x, y, w, barH, scale) {
  const visibleH = height - y;
  let contentH = detailsContentHeight(w, barH, scale);
  detailScroll = constrain(detailScroll, 0, Math.max(0, contentH - visibleH));

  // Clip to prevent scrolled content from overflowing into the image/tabs above
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(x, y, w, visibleH);
  drawingContext.clip();

  push();
  translate(0, -detailScroll);
  let cursor = y;
  cursor = drawDetailSection(x, cursor, w, barH, "material", "MATERIAIS", materialOpen, selectedProduct ? selectedProduct.materialDescription : "", scale);
  cursor = drawDetailSection(x, cursor, w, barH, "tecnicas", "TECNICAS DE CONSTRUCAO", techniqueOpen, selectedProduct ? (selectedProduct.origin === "brasileiro" ? selectedProduct.economicContext : selectedProduct.composition) : "", scale);
  drawDetailSection(x, cursor, w, barH, "estetico", "ESTETICO", aestheticOpen, selectedProduct ? selectedProduct.composition : "", scale);
  pop();

  drawingContext.restore();

  drawPanelScroll(x + w - 6, y + 6, visibleH - 12, detailScroll, Math.max(0, contentH - visibleH));
}

function drawDetailSection(x, y, w, barH, dim, label, open, textValue, scale) {
  stroke("#000000");
  strokeWeight(1);
  fill(COLORS.yellow);
  rect(x, y, w, barH);
  drawImageCentered(icones[dim] || icones.tecnicas, x + 33 * scale, y + barH / 2, 34 * scale, 34 * scale);
  fill("#000000");
  noStroke();
  textFont(fontes.newAmsterdam);
  textSize(20 * scale);
  textAlign(LEFT, CENTER);
  text(label, x + 64 * scale, y + barH / 2 + scale);
  drawSectionToggle(x + w - 30 * scale, y + barH / 2, 18 * scale, open);
  if (!open) return y + barH;
  const h = detailSectionContentHeight(w, dim, textValue, scale);
  noStroke();
  fill(panelBackground());
  rect(x, y + barH, w, h);
  drawDetailSectionContent(x, y + barH, w, dim, textValue, scale);
  return y + barH + h;
}

function drawDetailSectionContent(x, y, w, dim, textValue, scale) {
  const tags = selectedProduct ? selectedProduct.tagsByDimension[dim] : [];
  let cursorX = x + 84 * scale;
  let cursorY = y + 14 * scale;
  const maxX = x + w - 20 * scale;
  const chipH = 25 * scale;
  fill(panelTextColor());
  textFont(fontes.robotoCondensed);
  textSize(16 * scale);
  textAlign(LEFT, CENTER);
  text("Tags:", x + 18 * scale, cursorY + chipH / 2 - scale);
  for (const tag of tags) {
    textSize(16 * scale);
    const chipW = Math.max(54 * scale, textWidth(tag.label) + 18 * scale);
    if (cursorX + chipW > maxX) {
      cursorX = x + 84 * scale;
      cursorY += chipH + 8 * scale;
    }
    noStroke();
    fill(tag.color);
    rect(cursorX, cursorY, chipW, chipH, 3);
    fill(dim === "tecnicas" ? "#000000" : "#FFFFFF");
    textAlign(CENTER, CENTER);
    text(tag.label, cursorX + chipW / 2, cursorY + chipH / 2 - scale);
    cursorX += chipW + 7 * scale;
  }
  if (!cleanText(textValue)) return;
  fill(panelTextColor());
  textAlign(LEFT, TOP);
  textSize(16 * scale);
  text(cleanText(textValue), x + 18 * scale, cursorY + chipH + 26 * scale, w - 36 * scale, 1000);
}

function detailsContentHeight(w, barH, scale) {
  let total = barH;
  if (materialOpen) total += detailSectionContentHeight(w, "material", selectedProduct ? selectedProduct.materialDescription : "", scale);
  total += barH;
  if (techniqueOpen) total += detailSectionContentHeight(w, "tecnicas", selectedProduct ? (selectedProduct.origin === "brasileiro" ? selectedProduct.economicContext : selectedProduct.composition) : "", scale);
  total += barH;
  if (aestheticOpen) total += detailSectionContentHeight(w, "estetico", selectedProduct ? selectedProduct.composition : "", scale);
  return total;
}

function detailSectionContentHeight(w, dim, textValue, scale) {
  const tags = selectedProduct ? selectedProduct.tagsByDimension[dim] : [];
  const lines = chipLines(tags, w - 104 * scale, scale);
  const approxTextLines = cleanText(textValue) ? Math.ceil(cleanText(textValue).length / Math.max(30, (w - 36 * scale) / (8 * scale))) : 0;
  return 24 * scale + lines * 33 * scale + (approxTextLines > 0 ? 24 * scale + approxTextLines * 18 * scale : 12 * scale);
}

function chipLines(tags, available, scale) {
  if (!tags.length) return 1;
  let lines = 1;
  let used = 0;
  textFont(fontes.robotoCondensed);
  textSize(16 * scale);
  for (const tag of tags) {
    const w = Math.max(54 * scale, textWidth(tag.label) + 18 * scale) + 7 * scale;
    if (used + w > available) {
      lines++;
      used = 0;
    }
    used += w;
  }
  return lines;
}

function drawSectionToggle(cx, cy, size, open) {
  stroke("#000000");
  strokeWeight(Math.max(1.2, 1.8 * layoutScale()));
  line(cx - size * 0.38, cy, cx + size * 0.38, cy);
  if (!open) line(cx, cy - size * 0.38, cx, cy + size * 0.38);
}

function drawPanelScroll(x, y, h, value, maxValue) {
  if (maxValue <= 0 || h <= 0) return;
  const thumbH = Math.max(34, h * h / (h + maxValue));
  const thumbY = y + map(value, 0, maxValue, 0, h - thumbH);
  noStroke();
  fill(lightMode ? color(0, 0, 0, 42) : color(255, 255, 255, 45));
  rect(x, y, 3, h, 2);
  fill(COLORS.yellow);
  rect(x - 1, thumbY, 5, thumbH, 2);
}

function drawSavedProducts(x, y, w, scale) {
  const searchX = x + 22 * scale;
  const searchY = y + 18 * scale;
  const searchW = Math.min(240 * scale, w - 150 * scale);
  fill(lightMode ? "#FFFFFF" : "#D9D9D9");
  noStroke();
  rect(searchX, searchY, searchW, 20 * scale, 10 * scale);
  fill(savedSearch.length ? "#000000" : color(80));
  textFont(fontes.robotoCondensed);
  textSize(12 * scale);
  textAlign(LEFT, CENTER);
  text(savedSearch.length ? savedSearch : "Digite o nome, tipo ou ano", searchX + 13 * scale, searchY + 9 * scale);

  const buttonX = x + w - 88 * scale;
  fill(lightMode ? "#FFFFFF" : "#D9D9D9");
  rect(buttonX, searchY, 66 * scale, 20 * scale, 10 * scale);
  fill("#000000");
  textAlign(CENTER, CENTER);
  text(savedSortLabel(), buttonX + 33 * scale, searchY + 9 * scale);

  const items = savedProductsFiltered();
  const gridY = y + 58 * scale;
  const cardW = 92 * scale;
  const cardH = 122 * scale;
  const gapX = Math.max(12 * scale, (w - 44 * scale - cardW * 3) / 2);
  const gapY = 32 * scale;
  const gridX = x + 22 * scale;
  const rows = Math.ceil(items.length / 3);
  const totalH = rows * cardH + Math.max(0, rows - 1) * gapY;
  savedScroll = constrain(savedScroll, 0, Math.max(0, totalH - (height - gridY)));

  // Clip to prevent saved product cards from overflowing
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(x, gridY, w, height - gridY);
  drawingContext.clip();

  for (let i = 0; i < items.length; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = gridX + col * (cardW + gapX);
    const cy = gridY + row * (cardH + gapY) - savedScroll;
    if (cy + cardH < gridY || cy > height) continue;
    drawSavedCard(items[i], cx, cy, cardW, cardH, scale);
  }

  drawingContext.restore();

  drawPanelScroll(x + w - 6, gridY + 4, height - gridY - 8, savedScroll, Math.max(0, totalH - (height - gridY)));
}

function drawSavedCard(product, x, y, w, h, scale) {
  const colorOrigin = product.origin === "brasileiro" ? COLORS.yellow : COLORS.magenta;
  noStroke();
  fill(lightMode ? color(210) : "#8D8D8D");
  rect(x, y, w, 88 * scale, 7);
  fill("#FFFFFF");
  rect(x + 5 * scale, y + 5 * scale, w - 10 * scale, 74 * scale, 4);
  const img = getProductImage(product, 0);
  if (img) drawImageContain(img, x + 8 * scale, y + 8 * scale, w - 16 * scale, 68 * scale);
  fill(colorOrigin);
  rect(x + 5 * scale, y + 72 * scale, w - 10 * scale, 14 * scale, 0, 0, 6, 6);
  fill(lightMode ? color(245) : "#000000");
  rect(x, y + 96 * scale, w, 19 * scale, 10);
  fill(lightMode ? "#000000" : "#FFFFFF");
  textFont(fontes.robotoCondensed);
  textSize(fitTextSize(product.name, w - 10 * scale, 11 * scale, 8 * scale));
  textAlign(CENTER, CENTER);
  text(product.name, x + w / 2, y + 105 * scale);
}

function savedProductsFiltered() {
  const search = normalizeText(savedSearch);
  const items = products.filter((product) => savedProductKeys.has(product.key) && (!search || normalizeText(`${product.name} ${productType(product)} ${product.year}`).includes(search)));
  items.sort((a, b) => {
    if (savedSortMode === 1) return a.year - b.year;
    if (savedSortMode === 2) {
      const cmp = productType(a).localeCompare(productType(b), "pt-BR");
      if (cmp) return cmp;
    }
    return a.name.localeCompare(b.name, "pt-BR");
  });
  return items;
}

function savedSortLabel() {
  if (savedSortMode === 1) return "ANO";
  if (savedSortMode === 2) return "TIPO";
  return "A-Z";
}

function productionIcon() {
  const textValue = normalizeText(selectedProduct ? selectedProduct.production : "");
  if (textValue.includes("artesanal")) return icones.artesanal;
  if (textValue.includes("industrial") || textValue.includes("massa") || textValue.includes("seri")) return icones.industrial;
  return icones.assinado;
}

function getCurrentProductImage() {
  return getProductImage(selectedProduct, selectedImageIndex);
}

function getProductImage(product, index) {
  const images = productImages(product);
  if (!images.length) return null;
  const path = images[constrain(index, 0, images.length - 1)];
  if (imageCache.has(path)) return imageCache.get(path);
  imageCache.set(path, null);
  loadImage(asset(path), (img) => imageCache.set(path, img), () => imageCache.set(path, null));
  return null;
}

function productImages(product) {
  if (!product || !imageManifest) return [];
  const group = imageManifest[product.origin] || {};
  return group[String(Number(product.id))] || [];
}

function selectProduct(product) {
  if (!product) return;
  if (!selectedProduct || selectedProduct.key !== product.key) {
    selectedProduct = product;
    selectedImageIndex = 0;
    detailScroll = 0;
  }
}

function ensureSelectedVisible() {
  const visible = visibleProducts();
  if (!selectedProduct || !visible.some((product) => product.key === selectedProduct.key)) selectProduct(visible[0] || products[0]);
}

function mousePressed() {
  if (mouseButton !== LEFT) return;
  if (filterMousePressed(mouseX, mouseY)) return false;
  if (themeMousePressed(mouseX, mouseY)) return false;
  if (productPanelMousePressed(mouseX, mouseY)) return false;
  if (visualMousePressed(mouseX, mouseY)) return false;
}

function mouseDragged() {
  if (draggedYearHandle) {
    const newYear = xToYear(mouseX);
    if (draggedYearHandle === "start") yearStart = constrain(newYear, YEAR_MIN, yearEnd);
    else yearEnd = constrain(newYear, yearStart, YEAR_MAX);
    return false;
  }
  if (mapState.dragging) {
    mapState.panX += mouseX - mapState.previousX;
    mapState.panY += mouseY - mapState.previousY;
    mapState.previousX = mouseX;
    mapState.previousY = mouseY;
    limitMapPan();
    return false;
  }
}

function mouseReleased() {
  draggedYearHandle = null;
  mapState.dragging = false;
}

function mouseWheel(event) {
  if (productPanelWheel(event)) return false;
  if (activeView === VISAO_MAPA_MUNDI && mouseX >= visualX() && mouseX <= productPanelX() && mouseY < height - TIMELINE_H) {
    const previousZoom = mapState.zoom;
    mapState.zoom = constrain(mapState.zoom * (event.delta > 0 ? 0.88 : 1.14), 1, 7);
    if (Math.abs(previousZoom - mapState.zoom) > 0.001) {
      const box = currentMapBox();
      const cx = box.x + box.w / 2;
      const cy = box.y + box.h / 2;
      mapState.panX = mouseX - cx - (mouseX - cx - mapState.panX) * (mapState.zoom / previousZoom);
      mapState.panY = mouseY - cy - (mouseY - cy - mapState.panY) * (mapState.zoom / previousZoom);
      limitMapPan();
    }
    return false;
  }
  if (mouseX >= 0 && mouseX <= filterPanelW() && mouseY >= filterListY() * filterPanelScale()) {
    const tags = tagsToDisplay();
    const maxScroll = Math.max(0, tags.length * FILTER_TAG_ROW_H - (height / filterPanelScale() - 10 - filterListY()));
    tagScroll = constrain(tagScroll + event.delta * 0.45 / filterPanelScale(), 0, maxScroll);
    return false;
  }
}

function keyPressed() {
  if (tagSearchActive) {
    if (keyCode === BACKSPACE) tagSearch = tagSearch.slice(0, -1);
    else if (keyCode === DELETE) tagSearch = "";
    else if (keyCode === ENTER || keyCode === RETURN || keyCode === ESCAPE) tagSearchActive = false;
    else if (key.length === 1 && key >= " ") tagSearch += key;
    tagScroll = 0;
    return false;
  }
  if (savedSearchActive) {
    if (keyCode === BACKSPACE) savedSearch = savedSearch.slice(0, -1);
    else if (keyCode === DELETE) savedSearch = "";
    else if (keyCode === ENTER || keyCode === RETURN || keyCode === ESCAPE) savedSearchActive = false;
    else if (key.length === 1 && key >= " ") savedSearch += key;
    savedScroll = 0;
    return false;
  }
}

function filterMousePressed(mxRaw, myRaw) {
  const scale = filterPanelScale();
  let mx = mxRaw / scale;
  const my = myRaw / scale;
  
  if (mx < 0 || mx > LAYOUT_NAV_W + LAYOUT_FILTRO_W || my < 0 || my > height / scale) {
    tagSearchActive = false;
    return false;
  }
  
  if (mx < LAYOUT_NAV_W) {
    // Clicked in the Nav Sidebar
    return true;
  }
  
  // Adjust mx for the Filter area
  mx -= LAYOUT_NAV_W;
  
  const cardW = LAYOUT_FILTRO_W / 2;
  const cards = [
    ["material", 0, FILTER_HEADER_H],
    ["tecnicas", cardW, FILTER_HEADER_H],
    ["estetico", 0, FILTER_HEADER_H + FILTER_CARD_H],
    ["tipo_obra", cardW, FILTER_HEADER_H + FILTER_CARD_H],
  ];
  for (const [dim, x, y] of cards) {
    if (insideRect(mx, my, x, y, cardW, FILTER_CARD_H)) {
      activeDimension = dim;
      tagScroll = 0;
      categorySelectorOpen = false;
      return true;
    }
  }
  const catY = FILTER_BODY_Y + FILTER_CAT_OFFSET;
  const searchY = catY + FILTER_SEARCH_OFFSET;
  const clearY = searchY + FILTER_CLEAR_OFFSET;
  if (activeDimension !== "tipo_obra" && insideRect(mx, my, FILTER_BAR_X, catY, FILTER_BAR_W, 31)) {
    categorySelectorOpen = !categorySelectorOpen;
    tagSearchActive = false;
    return true;
  }
  if (insideRect(mx, my, FILTER_BAR_X, searchY, FILTER_BAR_W, 31)) {
    tagSearchActive = true;
    return true;
  }
  if (insideRect(mx, my, FILTER_BAR_X, clearY, FILTER_BAR_W, 28)) {
    selectedTagKeys.clear();
    focusedCircularTagKey = "";
    tagSearch = "";
    tagScroll = 0;
    ensureSelectedVisible();
    return true;
  }
  const listY = filterListY();
  if (categorySelectorOpen && activeDimension !== "tipo_obra" && my >= listY) {
    const options = [
      { label: "Tags disponiveis", value: -2 },
      { label: "Tags ativas", value: -1 },
      ...categoryOptions(activeDimension).map((option, index) => ({ label: option.label, value: index })),
    ];
    const index = Math.floor((my - listY) / 34);
    if (index >= 0 && index < options.length) {
      activeCategoryByDimension[activeDimension] = options[index].value;
      categorySelectorOpen = false;
      tagScroll = 0;
      return true;
    }
  }
  if (my >= listY) {
    const tags = tagsToDisplay();
    const index = Math.floor((my - listY + tagScroll) / FILTER_TAG_ROW_H);
    if (index >= 0 && index < tags.length) {
      const tag = tags[index];
      if (selectedTagKeys.has(tag.key)) selectedTagKeys.delete(tag.key);
      else selectedTagKeys.add(tag.key);
      if (!selectedTagKeys.has(focusedCircularTagKey)) focusedCircularTagKey = "";
      ensureSelectedVisible();
      return true;
    }
  }
  return true;
}

function themeMousePressed(mx, my) {
  if (dist(mx, my, themeButtonX(), menuIconY()) <= 15) {
    lightMode = !lightMode;
    return true;
  }
  return false;
}

function productPanelMousePressed(mx, my) {
  const x = productPanelX();
  const w = productPanelW();
  const scale = layoutScale();
  const imageH = Math.round(337 * scale);
  const infoH = Math.round(80 * scale);
  const tabH = Math.round(55 * scale);
  if (mx < x || mx > x + w || my < 0 || my > height) return false;
  if (dist(mx, my, x + 45 * scale, imageH - 64 * scale) <= 30 * scale) {
    changeProductImage(-1);
    return true;
  }
  if (dist(mx, my, x + w - 45 * scale, imageH - 64 * scale) <= 30 * scale) {
    changeProductImage(1);
    return true;
  }
  const ribbonY = imageH + 1 + infoH - 56 * scale;
  const ribbonX = x + w - 168 * scale;
  if (selectedProduct && dist(mx, my, ribbonX + 46 * scale, ribbonY + 28 * scale) <= 24 * scale) {
    toggleSavedProduct();
    return true;
  }
  const tabsY = imageH + infoH + 1;
  if (my >= tabsY && my <= tabsY + tabH) {
    productDetailsActive = mx < x + w / 2;
    savedSearchActive = false;
    return true;
  }
  const contentY = imageH + infoH + tabH + 1;
  if (!productDetailsActive) return savedProductsMousePressed(mx, my, x, contentY, w, scale);
  detailSectionsMousePressed(mx, my, x, contentY, w, scale);
  return true;
}

function detailSectionsMousePressed(mx, my, x, contentY, w, scale) {
  const barH = Math.round(44 * scale);
  let y = contentY - detailScroll;
  if (insideRect(mx, my, x, y, w, barH)) {
    materialOpen = !materialOpen;
    return;
  }
  y += barH + (materialOpen ? detailSectionContentHeight(w, "material", selectedProduct ? selectedProduct.materialDescription : "", scale) : 0);
  if (insideRect(mx, my, x, y, w, barH)) {
    techniqueOpen = !techniqueOpen;
    return;
  }
  y += barH + (techniqueOpen ? detailSectionContentHeight(w, "tecnicas", selectedProduct ? (selectedProduct.origin === "brasileiro" ? selectedProduct.economicContext : selectedProduct.composition) : "", scale) : 0);
  if (insideRect(mx, my, x, y, w, barH)) aestheticOpen = !aestheticOpen;
}

function savedProductsMousePressed(mx, my, x, contentY, w, scale) {
  const searchY = contentY + 18 * scale;
  const searchX = x + 22 * scale;
  const searchW = Math.min(240 * scale, w - 150 * scale);
  if (insideRect(mx, my, searchX, searchY, searchW, 20 * scale)) {
    savedSearchActive = true;
    return true;
  }
  savedSearchActive = false;
  const sortX = x + w - 88 * scale;
  if (insideRect(mx, my, sortX, searchY, 66 * scale, 20 * scale)) {
    savedSortMode = (savedSortMode + 1) % 3;
    savedScroll = 0;
    return true;
  }
  const items = savedProductsFiltered();
  const gridY = contentY + 58 * scale;
  const cardW = 92 * scale;
  const cardH = 122 * scale;
  const gapX = Math.max(12 * scale, (w - 44 * scale - cardW * 3) / 2);
  const gapY = 32 * scale;
  const gridX = x + 22 * scale;
  const localY = my - gridY + savedScroll;
  for (let i = 0; i < items.length; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = gridX + col * (cardW + gapX);
    const cy = row * (cardH + gapY);
    if (mx >= cx && mx <= cx + cardW && localY >= cy && localY <= cy + cardH) {
      selectProduct(items[i]);
      productDetailsActive = true;
      return true;
    }
  }
  return true;
}

function productPanelWheel(event) {
  const x = productPanelX();
  const w = productPanelW();
  const scale = layoutScale();
  const contentY = Math.round(337 * scale) + Math.round(80 * scale) + Math.round(55 * scale) + 2;
  if (mouseX < x || mouseX > x + w || mouseY < contentY) return false;
  if (productDetailsActive) {
    const barH = Math.round(44 * scale);
    const visibleH = height - contentY;
    const contentH = detailsContentHeight(w, barH, scale);
    const maxScroll = Math.max(0, contentH - visibleH);
    detailScroll = constrain(detailScroll + event.delta * 0.45, 0, maxScroll);
  } else {
    savedScroll = Math.max(0, savedScroll + event.delta * 0.45);
  }
  return true;
}

function visualMousePressed(mx, my) {
  if (dist(mx, my, legendButtonX(), menuIconY()) <= 15) {
    detailsPanelOpen = !detailsPanelOpen;
    exportPanelOpen = false;
    return true;
  }
  if (dist(mx, my, exportButtonX(), menuIconY()) <= 15) {
    exportPanelOpen = !exportPanelOpen;
    detailsPanelOpen = false;
    return true;
  }
  if (insideRect(mx, my, viewButtonX(), viewButtonY(), viewButtonW(), viewButtonH())) {
    activeView = (activeView + 1) % 4;
    return true;
  }
  if (exportPanelOpen && exportPanelMousePressed(mx, my)) return true;
  if (mx < visualX() || mx > productPanelX() || my < 0 || my > height) return false;
  const yearHit = clickedYearHandle(mx, my);
  if (yearHit) {
    draggedYearHandle = yearHit;
    return true;
  }
  const hit = hitAreaAt(mx, my);
  if (hit && hit.kind === "product") {
    selectProduct(hit.product);
    return true;
  }
  if (hit && hit.kind === "tag") {
    focusedCircularTagKey = focusedCircularTagKey === hit.tag.key ? "" : hit.tag.key;
    return true;
  }
  if (hit && hit.kind === "cluster") {
    mapState.zoom = constrain(mapState.zoom * 1.65, 1, 7);
    mapState.panX += visualX() + visualW() / 2 - hit.cluster.x;
    mapState.panY += (height - TIMELINE_H) / 2 - hit.cluster.y;
    limitMapPan();
    return true;
  }
  if (activeView === VISAO_MAPA_MUNDI && my < height - TIMELINE_H) {
    mapState.dragging = true;
    mapState.previousX = mx;
    mapState.previousY = my;
    return true;
  }
  return false;
}

function exportPanelMousePressed(mx, my) {
  const px = constrain(exportButtonX() - 180, visualX() + 12, productPanelX() - 282);
  const py = constrain(menuIconY() + 20, 12, height - 230);
  if (insideRect(mx, my, px + 18, py + 58, 86, 28)) {
    saveCanvas("tagrafia-visualizacao", "jpg");
    exportMessage = "Exportado como JPG.";
    exportMessageFrame = frameCount;
    return true;
  }
  if (insideRect(mx, my, px + 18, py + 99, 86, 28)) {
    saveCanvas("tagrafia-visualizacao", "png");
    exportMessage = "Exportado como PNG.";
    exportMessageFrame = frameCount;
    return true;
  }
  if (insideRect(mx, my, px + 18, py + 140, 86, 28)) {
    exportMessage = "SVG/PDF exigem biblioteca extra no navegador.";
    exportMessageFrame = frameCount;
    return true;
  }
  return insideRect(mx, my, px, py, 270, 210);
}

function clickedYearHandle(mx, my) {
  if (my < height - TIMELINE_H || my > height) return null;
  if (Math.abs(mx - yearToX(yearStart)) < 18) return "start";
  if (Math.abs(mx - yearToX(yearEnd)) < 18) return "end";
  return null;
}

function hitAreaAt(mx, my) {
  for (let i = hitAreas.length - 1; i >= 0; i--) {
    const area = hitAreas[i];
    if (area.shape === "circle" || area.kind === "tag") {
      if (dist(mx, my, area.cx, area.cy) <= area.r) return area;
    } else if (area.shape === "rotatedRect") {
      const dx = mx - area.cx;
      const dy = my - area.cy;
      const c = cos(-area.rotation);
      const s = sin(-area.rotation);
      const lx = dx * c - dy * s;
      const ly = dx * s + dy * c;
      if (Math.abs(lx) <= area.w / 2 && Math.abs(ly) <= area.h / 2) return area;
    }
  }
  return null;
}

function changeProductImage(direction) {
  const images = productImages(selectedProduct);
  if (images.length <= 1) return;
  selectedImageIndex = (selectedImageIndex + direction + images.length) % images.length;
}

function toggleSavedProduct() {
  if (!selectedProduct) return;
  if (savedProductKeys.has(selectedProduct.key)) savedProductKeys.delete(selectedProduct.key);
  else savedProductKeys.add(selectedProduct.key);
  persistSavedProducts();
}

function loadSavedProducts() {
  try {
    savedProductKeys = new Set(JSON.parse(localStorage.getItem("tagrafia-saved-products") || "[]"));
  } catch {
    savedProductKeys = new Set();
  }
}

function persistSavedProducts() {
  localStorage.setItem("tagrafia-saved-products", JSON.stringify(Array.from(savedProductKeys)));
}

function buildGeoCountries() {
  geoCountries = [];
  const features = geoJson && geoJson.features ? geoJson.features : [];
  for (const feature of features) {
    const props = feature.properties || {};
    const name = cleanText(props.name_pt || props.name || "");
    const iso = cleanText(props.iso_a3 || "");
    if (iso === "ATA" || normalizeText(name) === "antarctica") continue;
    const rings = [];
    const geometry = feature.geometry || {};
    if (geometry.type === "Polygon") addGeoPolygon(rings, geometry.coordinates);
    else if (geometry.type === "MultiPolygon") for (const polygon of geometry.coordinates || []) addGeoPolygon(rings, polygon);
    if (rings.length) geoCountries.push({ name, iso, rings });
  }
}

function addGeoPolygon(rings, polygon) {
  const exterior = polygon && polygon[0];
  if (!Array.isArray(exterior) || exterior.length < 3) return;
  const step = exterior.length > 900 ? 4 : exterior.length > 360 ? 2 : 1;
  const ring = [];
  for (let i = 0; i < exterior.length; i += step) ring.push([Number(exterior[i][0]), Number(exterior[i][1])]);
  rings.push(ring);
}

function createSchool(row) {
  const name = field(row, ["Escola"], 1);
  const context = field(row, ["Contexto"], 2);
  if (!name) return null;
  const interval = schoolInterval(name, context);
  return { name, context, start: interval.start, end: interval.end, locations: schoolLocations(name, context) };
}

function schoolInterval(name, context) {
  const textValue = normalizeText(`${name} ${context}`);
  if (textValue.includes("bauhaus")) return { start: 1919, end: 1933 };
  if (textValue.includes("vutemas") || textValue.includes("vkhutemas")) return { start: 1920, end: 1930 };
  if (textValue.includes("ulm")) return { start: 1953, end: 1968 };
  if (textValue.includes("cranbrook")) return { start: 1932, end: 2010 };
  if (textValue.includes("art nouveau") && !textValue.includes("jugendstil")) return { start: 1880, end: 1910 };
  if (textValue.includes("jugendstil")) return { start: 1890, end: 1910 };
  if (textValue.includes("deutscher werkbund")) return { start: 1907, end: 1934 };
  if (textValue.includes("estilo internacional")) return { start: 1933, end: 1980 };
  if (textValue.includes("streamlining")) return { start: 1930, end: 1950 };
  if (textValue.includes("anti-design") || textValue.includes("anti design")) return { start: 1966, end: 1980 };
  if (textValue.includes("pop art")) return { start: 1956, end: 1970 };
  if (textValue.includes("design organico")) return { start: 1940, end: 2010 };
  if (textValue.includes("biomorfismo")) return { start: 1930, end: 1975 };
  if (textValue.includes("memphis")) return { start: 1981, end: 1988 };
  if (textValue.includes("california new wave")) return { start: 1975, end: 1995 };
  const years = `${name} ${context}`.match(/(18|19|20)\d\d/g) || [];
  if (years.length >= 2) return { start: Number(years[0]), end: Number(years[1]) };
  if (years.length === 1) return { start: Number(years[0]), end: Number(years[0]) + 20 };
  return { start: YEAR_MIN, end: YEAR_MAX };
}

function schoolLocations(name, context) {
  const textValue = normalizeText(`${name} ${context}`);
  const result = [];
  const add = (location) => result.push(location);
  if (textValue.includes("bauhaus")) add({ name: "Dessau / Weimar", country: "Alemanha", lat: 51.842, lon: 12.23 });
  else if (textValue.includes("vutemas") || textValue.includes("vkhutemas")) add({ name: "Moscou", country: "Russia", lat: 55.7558, lon: 37.6173 });
  else if (textValue.includes("ulm")) {
    add({ name: "Ulm", country: "Alemanha", lat: 48.4011, lon: 9.9876 });
    add({ name: "Rio de Janeiro", country: "Brasil", lat: -22.9068, lon: -43.1729 });
  } else if (textValue.includes("cranbrook")) add({ name: "Bloomfield Hills", country: "Estados Unidos", lat: 42.5836, lon: -83.2455 });
  else if (textValue.includes("art nouveau") && !textValue.includes("jugendstil")) {
    add({ name: "Paris", country: "Franca", lat: 48.8566, lon: 2.3522 });
    add({ name: "Bruxelas", country: "Belgica", lat: 50.8503, lon: 4.3517 });
    add({ name: "Barcelona", country: "Espanha", lat: 41.3851, lon: 2.1734 });
  } else if (textValue.includes("jugendstil") || textValue.includes("deutscher werkbund")) add({ name: "Munique", country: "Alemanha", lat: 48.1351, lon: 11.582 });
  else if (textValue.includes("estilo internacional")) add({ name: "Zurique", country: "Suica", lat: 47.3769, lon: 8.5417 });
  else if (textValue.includes("streamlining")) add({ name: "Detroit", country: "Estados Unidos", lat: 42.3314, lon: -83.0458 });
  else if (textValue.includes("anti-design") || textValue.includes("anti design") || textValue.includes("memphis")) add({ name: "Milao", country: "Italia", lat: 45.4642, lon: 9.19 });
  else if (textValue.includes("pop art")) add({ name: "Nova York", country: "Estados Unidos", lat: 40.7128, lon: -74.006 });
  else if (textValue.includes("design organico")) add({ name: "Helsinque", country: "Finlandia", lat: 60.1699, lon: 24.9384 });
  else if (textValue.includes("california new wave")) add({ name: "Los Angeles", country: "Estados Unidos", lat: 34.0522, lon: -118.2437 });
  return result;
}

function productLocation(product) {
  if (product.origin === "brasileiro") return brazilianLocation(product.locationRaw);
  return internationalLocation(product.movementRaw);
}

function brazilianLocation(value) {
  const textValue = normalizeText(value);
  if (!textValue) return null;
  if (textValue.includes("paris")) return { name: "Paris, Franca", country: "Franca", lat: 48.8566, lon: 2.3522 };
  if (textValue.includes("salvador")) return { name: "Salvador, BA", country: "Brasil", lat: -12.9777, lon: -38.5016 };
  if (textValue.includes("sao bernardo")) return { name: "Sao Bernardo do Campo, SP", country: "Brasil", lat: -23.6914, lon: -46.5646 };
  if (textValue.includes("sao jose dos campos")) return { name: "Sao Jose dos Campos, SP", country: "Brasil", lat: -23.2237, lon: -45.9009 };
  if (textValue.includes("campinas")) return { name: "Campinas, SP", country: "Brasil", lat: -22.9056, lon: -47.0608 };
  if (textValue.includes("jaboticabal")) return { name: "Jaboticabal, SP", country: "Brasil", lat: -21.2547, lon: -48.3222 };
  if (textValue.includes("porto alegre")) return { name: "Porto Alegre, RS", country: "Brasil", lat: -30.0346, lon: -51.2177 };
  if (textValue.includes("rio de janeiro")) return { name: "Rio de Janeiro, RJ", country: "Brasil", lat: -22.9068, lon: -43.1729 };
  if (textValue.includes("sao paulo")) return { name: "Sao Paulo, SP", country: "Brasil", lat: -23.5505, lon: -46.6333 };
  if (textValue.includes("santa catarina")) return { name: "Santa Catarina", country: "Brasil", lat: -27.2423, lon: -50.2189 };
  if (textValue.includes("brasil") || textValue.includes("nacional")) return { name: "Brasil", country: "Brasil", lat: -14.235, lon: -51.9253 };
  return null;
}

function internationalLocation(value) {
  const textValue = normalizeText(movementName(value));
  if (!textValue) return null;
  if (textValue.includes("bauhaus")) return { name: "Dessau, Alemanha", country: "Alemanha", lat: 51.842, lon: 12.23 };
  if (textValue.includes("ulm") || textValue.includes("good design")) return { name: "Ulm, Alemanha", country: "Alemanha", lat: 48.4011, lon: 9.9876 };
  if (textValue.includes("cranbrook")) return { name: "Bloomfield Hills, EUA", country: "Estados Unidos", lat: 42.5836, lon: -83.2455 };
  if (textValue.includes("california")) return { name: "California, EUA", country: "Estados Unidos", lat: 36.7783, lon: -119.4179 };
  if (textValue.includes("pop art") || textValue.includes("streamlining") || textValue.includes("biomorfismo") || textValue.includes("design organico")) return { name: "Costa Leste, EUA", country: "Estados Unidos", lat: 40.9, lon: -77 };
  if (textValue.includes("memphis") || textValue.includes("anti-design") || textValue.includes("anti design")) return { name: "Milao, Italia", country: "Italia", lat: 45.4642, lon: 9.19 };
  if (textValue.includes("vkhutemas")) return { name: "Moscou, Russia", country: "Russia", lat: 55.7558, lon: 37.6173 };
  if (textValue.includes("deutscher werkbund") || textValue.includes("jugendstil")) return { name: "Munique, Alemanha", country: "Alemanha", lat: 48.1351, lon: 11.582 };
  if (textValue.includes("art nouveau")) return { name: "Paris, Franca", country: "Franca", lat: 48.8566, lon: 2.3522 };
  if (textValue.includes("estilo internacional")) return { name: "Zurique, Suica", country: "Suica", lat: 47.3769, lon: 8.5417 };
  return null;
}

function limitMapPan() {
  if (mapState.zoom <= 1.01) {
    mapState.panX = 0;
    mapState.panY = 0;
    return;
  }
  const box = currentMapBox();
  mapState.panX = constrain(mapState.panX, -box.w * (mapState.zoom - 1) * 0.55, box.w * (mapState.zoom - 1) * 0.55);
  mapState.panY = constrain(mapState.panY, -box.h * (mapState.zoom - 1) * 0.62, box.h * (mapState.zoom - 1) * 0.62);
}

function movementName(value) {
  const raw = cleanText(value);
  const textValue = normalizeText(raw);
  if (!textValue) return "";
  if (textValue.includes("bahaus") || textValue.includes("bauhaus")) return "Bauhaus";
  if (textValue.includes("modernismo norte")) return "Modernismo Norte-Americano";
  if (textValue.includes("pop art")) return "Pop Art";
  if (textValue.includes("estilo internacional")) return "Estilo Internacional";
  if (textValue.includes("hfg ulm") || textValue.includes("good design") || textValue === "ulm") return "HfG Ulm / Good Design";
  if (textValue.includes("cranbrook")) return "Cranbrook Academy of Art";
  if (textValue.includes("california new wave")) return "California New Wave";
  if (textValue.includes("deutscher werkbund")) return "Deutscher Werkbund";
  if (textValue.includes("art nouveau") && !textValue.includes("jugendstil")) return "Art Nouveau";
  if (textValue.includes("jugendstil")) return "Jugendstil";
  if (textValue.includes("streamlining")) return "Streamlining";
  if (textValue.includes("anti-design") || textValue.includes("anti design")) return "Anti-Design";
  if (textValue.includes("vkhutemas") || textValue.includes("vutemas")) return "Vkhutemas";
  if (textValue.includes("memphis")) return "Memphis";
  if (textValue.includes("biomorfismo")) return "Biomorfismo";
  if (textValue.includes("design organico")) return "Design Orgânico";
  return raw;
}

function normalizeCountry(value) {
  const textValue = normalizeText(value);
  if (textValue.includes("united states") || textValue.includes("estados unidos") || textValue === "eua") return "estados unidos";
  if (textValue.includes("germany") || textValue.includes("alemanha")) return "alemanha";
  if (textValue.includes("brazil") || textValue.includes("brasil")) return "brasil";
  if (textValue.includes("france") || textValue.includes("franca")) return "franca";
  if (textValue.includes("italy") || textValue.includes("italia")) return "italia";
  if (textValue.includes("russia")) return "russia";
  if (textValue.includes("switzerland") || textValue.includes("suica")) return "suica";
  if (textValue.includes("belgium") || textValue.includes("belgica")) return "belgica";
  if (textValue.includes("spain") || textValue.includes("espanha")) return "espanha";
  if (textValue.includes("finland") || textValue.includes("finlandia")) return "finlandia";
  return textValue;
}

function productType(product) {
  return product && product.tagsByDimension.tipo_obra.length ? product.tagsByDimension.tipo_obra[0].label : "";
}

function originWeight(product) {
  return product.origin === "brasileiro" ? 1 : 0;
}

function tagPosition(tag, cx, cy, radius) {
  const h = Math.abs(hashString(tag.key));
  const angle = map(h % 10000, 0, 9999, 0, TWO_PI);
  const r = radius * map(Math.floor(h / 10000) % 100, 0, 99, 0.35, 1);
  return { x: cx + cos(angle) * r, y: cy + sin(angle) * r };
}

function drawCenteredVisualMessage(message, x, y) {
  fill(colorAlpha(themeLineColor(), 180));
  noStroke();
  textFont(fontes.robotoCondensed);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(message, x, y);
}

function drawImageCentered(img, cx, cy, w, h) {
  if (!img || !img.width || !img.height) return;
  const scale = Math.min(w / img.width, h / img.height);
  const iw = img.width * scale;
  const ih = img.height * scale;
  image(img, cx - iw / 2, cy - ih / 2, iw, ih);
}

function drawImageContain(img, x, y, w, h) {
  if (!img || !img.width || !img.height) return;
  const scale = Math.min(w / img.width, h / img.height);
  const iw = img.width * scale;
  const ih = img.height * scale;
  image(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}

function colorAlpha(hexOrColor, alpha) {
  const c = color(hexOrColor);
  c.setAlpha(alpha);
  return c;
}

function fitTextSize(textValue, maxWidth, start, minSize) {
  let size = start;
  textSize(size);
  while (textWidth(cleanText(textValue)) > maxWidth && size > minSize) {
    size -= 1;
    textSize(size);
  }
  return size;
}

function measureText(textValue, size) {
  textFont(fontes.afacad);
  textSize(size);
  return textWidth(cleanText(textValue));
}

function insideRect(mx, my, x, y, w, h) {
  return mx >= x && mx <= x + w && my >= y && my <= y + h;
}

function hasAny(textValue, terms) {
  return terms.some((term) => textValue.includes(normalizeText(term)));
}

function extractYear(value) {
  const match = cleanText(value).match(/(18|19|20)\d\d/);
  return match ? Number(match[0]) : YEAR_MIN;
}

function cleanText(value) {
  return String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeText(value) {
  return cleanText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/["'`´’‘“”]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
