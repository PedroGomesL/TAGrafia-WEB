const DATA_PATHS = {
  productsBR: "data/Produtos brasileiros.tsv",
  productsIntl: "data/Produtos internacionais.tsv",
  schools: "data/Escolas.tsv",
  geo: "data/custom.geo.json",
  images: "data/image-manifest.json",
};

const LAYOUT_NAV_W = 70;
const LAYOUT_FILTRO_W = 210;
const LAYOUT_VISUAL_W_BASE = 1180;
const LAYOUT_PAINEL_PRODUTO_W = 360;
const LAYOUT_VISUAL_W_MIN = 320;

const LAYOUT_PAINEL_PRODUTO_W_MIN = 280;

const PRODUCT_IMAGE_H = 240;
const PRODUCT_TITLE_H = 56;
const PRODUCT_SIDEBAR_W = 70;

// Breakpoints responsivos para mobile, tablet e desktop
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
  ultrawide: 2160,
};

const MOBILE_SCREENS = {
  VISUAL: "visual",
  FILTROS: "filtros",
  PRODUTO: "produto",
  SOBRE: "sobre",
  EXPORTAR: "exportar",
};

function isMobileMode() {
  const w =
    typeof width !== "undefined" && width > 0
      ? width
      : typeof windowWidth !== "undefined" && windowWidth > 0
        ? windowWidth
        : 1024;
  return w < BREAKPOINTS.mobile;
}

function isTabletMode() {
  const w =
    typeof width !== "undefined" && width > 0
      ? width
      : typeof windowWidth !== "undefined" && windowWidth > 0
        ? windowWidth
        : 1024;
  return w >= BREAKPOINTS.mobile && w < BREAKPOINTS.tablet;
}

function isDesktopMode() {
  const w =
    typeof width !== "undefined" && width > 0
      ? width
      : typeof windowWidth !== "undefined" && windowWidth > 0
        ? windowWidth
        : 1024;
  return w >= BREAKPOINTS.tablet;
}

function getDeviceMode() {
  const w =
    typeof width !== "undefined" && width > 0
      ? width
      : typeof windowWidth !== "undefined" && windowWidth > 0
        ? windowWidth
        : 1024;
  if (w < BREAKPOINTS.mobile) return "mobile";
  if (w < BREAKPOINTS.tablet) return "tablet";
  if (w >= BREAKPOINTS.ultrawide) return "ultrawide";
  return "desktop";
}

function setMobileScreen(screen) {
  if (
    typeof mobileState !== "undefined" &&
    Object.values(MOBILE_SCREENS).includes(screen)
  ) {
    mobileState.activeScreen = screen;
  }
}

function getOriginLabel(origin) {
  return origin === "brasileiro" ? "Brasil" : "Internacional";
}

function getContrastTextColor(hexColor) {
  if (!hexColor || typeof hexColor !== "string") return "#000000";
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6) return "#000000";
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const toLinear = (c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lum =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return lum > 0.35 ? "#000000" : "#FFFFFF";
}

// Filter panel layout
const FILTER_HEADER_H = 58;
const FILTER_CARD_H = 100;
const FILTER_BODY_Y = FILTER_HEADER_H + FILTER_CARD_H * 2 + 10;
const FILTER_CAT_OFFSET = 14;
const FILTER_SEARCH_OFFSET = 36;
const FILTER_CLEAR_OFFSET = 36;
const FILTER_LIST_OFFSET = 38;
const FILTER_BAR_X = 18;
const FILTER_BAR_W = 174;
const FILTER_TAG_ROW_H = 30;

const YEAR_MIN = 1880;
const YEAR_MAX = 2010;
const TIMELINE_H = 74;
const TIMELINE_TRACK_INSET = 40;
const GOLDEN_ANGLE = 2.399963229728653;

const VISAO_CIRCULAR = 0;
const VISAO_BOLHAS = 1;
const VISAO_LINHA_TEMPO = 2;
const VISAO_MAPA_MUNDI = 3;

const VIEWS_CONFIG = [
  { id: VISAO_CIRCULAR, label: "Circular", iconKey: "visao_circular" },
  { id: VISAO_BOLHAS, label: "Bolhas", iconKey: "visao_bolhas" },
  { id: VISAO_LINHA_TEMPO, label: "Linha do tempo", iconKey: "visao_timeline" },
  { id: VISAO_MAPA_MUNDI, label: "Mapa-Mundi", iconKey: "visao_mapa" },
];

const NAV_CONFIG = [
  { id: "filtros", label: "Filtros", y: 88, iconKey: "filtros", iconSize: 28 },
  { id: "trocar", label: "Trocar\nVisualização", y: 164, iconKey: null, iconSize: 30 },
  { id: "exportar", label: "Exportar", y: 240, iconKey: "export", iconSize: 28 },
  { id: "sobre", label: "Sobre", y: 380, iconKey: "sobre", iconSize: 28 },
];

const DETAIL_TABS = ["material", "estetico", "tecnicas"];

const EXPORT_FORMATS = ["PDF", "JPG", "SVG"];

const FONTS_CONFIG = {
  afacad: "data/Fontes/AfacadFlux-VariableFont_slnt,wght.ttf",
  robotoCondensed: "data/Fontes/RobotoCondensed-VariableFont_wght.ttf",
  roboto: "data/Fontes/Roboto-VariableFont_wdth,wght.ttf",
};

const STORAGE_KEYS = {
  savedProducts: "tagrafia-saved-products",
};

const ICONS_CONFIG = {
  filtros: "data/Icones/filtros.svg",
  sobre: "data/Icones/sobre.svg",
  export: "data/Icones/exportar.svg",
  collapse_panel: "data/Icones/collapse_panel.svg",
  clear: "data/Icones/filter_alt_off.png",
  left: "data/Icones/keyboard_arrow_left.png",
  right: "data/Icones/keyboard_arrow_right.png",
  save: "data/Icones/salvar_produto.png",
  material: "data/Icones/material.png",
  tecnicas: "data/Icones/técnica.png",
  estetico: "data/Icones/estético.png",
  tipo_obra: "data/Icones/tipodeproduto.png",
  artesanal: "data/Icones/produto artesanal.png",
  assinado: "data/Icones/design_assinado.png",
  industrial: "data/Icones/produto industrial.png",
  visao_circular: "data/Icones/visao_circular.svg",
  visao_bolhas: "data/Icones/visao_bolhas.svg",
  visao_timeline: "data/Icones/visao_timeline.svg",
  visao_mapa: "data/Icones/visao_mapa.svg",
  theme_toggle: "data/Icones/theme_toggle_dark.svg",
};

const ICONS_DARK_CONFIG = {
  filtros: "data/Icones/filtros_white.svg",
  sobre: "data/Icones/sobre_white.svg",
  export: "data/Icones/exportar_white.svg",
  collapse_panel: "data/Icones/collapse_panel.svg",
  clear: "data/Icones/filter_alt_off.png",
  left: "data/Icones/keyboard_arrow_left.png",
  right: "data/Icones/keyboard_arrow_right.png",
  save: "data/Icones/salvar_produto_white.svg",
  material: "data/Icones/material_white.svg",
  tecnicas: "data/Icones/tecnicas_white.svg",
  estetico: "data/Icones/estetico_white.svg",
  tipo_obra: "data/Icones/tipodeproduto.png",
  artesanal: "data/Icones/produto artesanal.png",
  assinado: "data/Icones/design_assinado.png",
  industrial: "data/Icones/produto industrial.png",
  visao_circular: "data/Icones/visao_circular_white.svg",
  visao_bolhas: "data/Icones/visao_bolhas_white.svg",
  visao_timeline: "data/Icones/visao_timeline_white.svg",
  visao_mapa: "data/Icones/visao_mapa_white.svg",
  theme_toggle: "data/Icones/theme_toggle_white.svg",
};

const DIMENSIONS = {
  material: {
    id: "material",
    label: "Material",
    iconKey: "material",
    color: "#3E4AD3",
    pastelColor: "#959fff",
    gridX: 128,
    gridY: 58,
  },
  tecnicas: {
    id: "tecnicas",
    label: "Técnica",
    iconKey: "tecnicas",
    color: "#4AD33E",
    pastelColor: "#a7ff95",
    gridX: 128,
    gridY: 158,
  },
  estetico: {
    id: "estetico",
    label: "Estético",
    iconKey: "estetico",
    color: "#D33E4A",
    pastelColor: "#ff9597",
    gridX: 36,
    gridY: 158,
  },
  tipo_obra: {
    id: "tipo_obra",
    label: "Tipo",
    iconKey: "tipo_obra",
    color: "#FFCB00",
    pastelColor: "#ffef95",
    gridX: 36,
    gridY: 58,
  },
};

const DIMENSION_ORDER = ["material", "tecnicas", "estetico", "tipo_obra"];

function getDimension(dim) {
  if (!dim) return null;
  const normalized = dim === "materiais" ? "material" : dim;
  return DIMENSIONS[normalized] || null;
}

function getDimensionColor(dim) {
  return getDimension(dim)?.color || "#3E4AD3";
}

function getDimensionPastelColor(dim) {
  return getDimension(dim)?.pastelColor || "#959fff";
}

const PRODUCTION_CONFIG = [
  { keywords: ["artesanal"], iconKey: "artesanal", label: "Artesanal", tooltip: "Artesanal" },
  { keywords: ["industrial", "massa", "seri"], iconKey: "industrial", label: "Industrial", tooltip: "Industrial" },
  { keywords: ["assinado"], iconKey: "assinado", label: "Design assinado", tooltip: "Design assinado" },
];

function getProductionInfo(productionStr) {
  const text = String(productionStr || "").toLowerCase();
  for (const item of PRODUCTION_CONFIG) {
    if (item.keywords.some((kw) => text.includes(kw))) {
      return item;
    }
  }
  return PRODUCTION_CONFIG[2]; // Default: assinado
}

const CATEGORY_FILTERS = {
  material: [
    [
      "Metal",
      [
        "aco",
        "aluminio",
        "bronze",
        "chumbo",
        "cobre",
        "ferro",
        "latao",
        "metal",
        "zinco",
        "ouro",
        "prata",
      ],
    ],
    [
      "Plastico e Polimeros",
      [
        "abs",
        "acrilico",
        "baquelite",
        "borracha",
        "espuma",
        "melamina",
        "plastico",
        "policarbonato",
        "polietileno",
        "polipropileno",
        "poliuretano",
        "pvc",
        "resina",
        "vinil",
      ],
    ],
    [
      "Ceramica e Vidro",
      ["argila", "ceramica", "fibra de vidro", "porcelana", "vidro"],
    ],
    [
      "Pedra e Construcao",
      [
        "alvenaria",
        "concreto",
        "estuque",
        "gesso",
        "mosaico",
        "marmore",
        "pedra",
        "tijolo",
      ],
    ],
    [
      "Madeira e Fibras",
      [
        "madeira",
        "pinus",
        "teca",
        "jacaranda",
        "freijo",
        "carvalho",
        "palhinha",
        "vime",
        "bambu",
        "fibra natural",
      ],
    ],
    [
      "Tecido e Couro",
      [
        "couro",
        "tecido",
        "textil",
        "estofado",
        "fibra",
        "la",
        "seda",
        "tela",
        "crina",
      ],
    ],
    ["Componentes", ["componente", "motor", "filtro", "parafuso", "prego"]],
    ["Papel e Midia", ["papel", "fotografia", "digital", "tipografia"]],
    ["Acabamentos", ["cola", "esmalte", "tinta", "verniz"]],
  ],
  estetico: [
    [
      "Forma e Geometria",
      [
        "assimetrico",
        "cilindrico",
        "circular",
        "curvilineo",
        "cubico",
        "esferico",
        "geometrico",
        "ortogonal",
        "oval",
        "simetrico",
      ],
    ],
    [
      "Linhas e Contornos",
      ["linha", "contorno", "fluido", "linear", "sinuoso", "silhueta"],
    ],
    [
      "Estrutura e Composicao",
      [
        "estrutura",
        "camada",
        "contraste",
        "continuo",
        "empilhavel",
        "entrelacado",
        "modular",
        "padronizado",
        "vazado",
        "vertical",
        "horizontal",
      ],
    ],
    [
      "Cor, Luz e Aparencia",
      [
        "cor",
        "cromatico",
        "preto",
        "dourado",
        "monocromatico",
        "policromatico",
        "translucido",
        "reflexivo",
      ],
    ],
    [
      "Textura e Materialidade",
      ["bruto", "material", "liso", "metalico", "texturizado", "vidro"],
    ],
    [
      "Estilo e Conceito",
      [
        "abstrato",
        "aerodinamico",
        "conceitual",
        "decorativo",
        "dinamico",
        "escultural",
        "minimalista",
        "ornamental",
        "ready-made",
      ],
    ],
    [
      "Natureza e Biologia",
      [
        "organico",
        "biomorfico",
        "botanico",
        "floral",
        "anatomico",
        "zoomorfico",
      ],
    ],
    [
      "Funcao e Midia",
      [
        "caligrafico",
        "digital",
        "ergonomico",
        "fotografico",
        "funcional",
        "grafico",
        "industrial",
        "tipografico",
        "utilitario",
      ],
    ],
  ],
  tecnicas: [
    [
      "Acabamento",
      [
        "acabamento",
        "pintura",
        "polimento",
        "revestimento",
        "cromagem",
        "douramento",
        "zincagem",
        "esmaltacao",
        "laminado",
      ],
    ],
    [
      "Arquitetura",
      [
        "acustica",
        "alvenaria",
        "concreto",
        "fachada",
        "estrutura",
        "iluminacao",
        "planta",
        "arquitetura",
        "urbano",
      ],
    ],
    [
      "Artes e Vidro",
      [
        "escultura",
        "vidro",
        "ceramica",
        "mosaico",
        "vitral",
        "marmore",
        "cozimento",
      ],
    ],
    [
      "Artesanato e Textil",
      ["bordado", "costura", "estofamento", "artesanal", "tecelagem"],
    ],
    [
      "Corte e Dobra",
      [
        "corte",
        "curvatura",
        "dobra",
        "dobradura",
        "extrusao",
        "prensagem",
        "recorte",
        "tensionamento",
      ],
    ],
    [
      "Grafico e Digital",
      [
        "grafico",
        "tipografico",
        "impressao",
        "litografia",
        "serigrafia",
        "digital",
        "software",
        "grid",
        "3d",
      ],
    ],
    [
      "Engenharia",
      [
        "engenharia",
        "mecanica",
        "eletrica",
        "sistema",
        "eixo",
        "giratoria",
        "chassi",
        "refrigeracao",
      ],
    ],
    [
      "Marcenaria",
      [
        "madeira",
        "marcenaria",
        "carpintaria",
        "entalhe",
        "torneamento",
        "marchetaria",
      ],
    ],
    [
      "Metalurgia",
      [
        "metal",
        "soldagem",
        "fundicao",
        "forjamento",
        "usinagem",
        "estampagem",
        "ourivesaria",
      ],
    ],
    [
      "Moldagem",
      [
        "moldagem",
        "injecao",
        "laminacao",
        "espuma",
        "fibra",
        "sopro",
        "compressao",
      ],
    ],
    [
      "Montagem",
      [
        "montagem",
        "encaixe",
        "colagem",
        "modular",
        "empilhamento",
        "pre-fabricacao",
        "justaposicao",
      ],
    ],
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
  visualDark: "#222222",
  visualLight: "#F3F1EA",
  timelineDark: "#505050",
  timelineLight: "#D7D2C5",
  hatchDark: "#202020",
  hatchLight: "#B08A00",
  panelDark: "#222222",
  inactiveTab: "#624E00",
};
