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

const LAYOUT_PAINEL_PRODUTO_W_MIN = 300;

// Filter panel layout
const FILTER_HEADER_H = 20;
const FILTER_CARD_H = 100;
const FILTER_BODY_Y = FILTER_HEADER_H + FILTER_CARD_H * 2 + 10;
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
  visualDark: "#111111",
  visualLight: "#F3F1EA",
  timelineDark: "#505050",
  timelineLight: "#D7D2C5",
  hatchDark: "#202020",
  hatchLight: "#B08A00",
  panelDark: "#222222",
  inactiveTab: "#624E00",
};
