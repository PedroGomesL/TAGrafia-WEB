function buildData() {
  products = [];
  tagsByKey = new Map();
  tagsByDimension = {};
  for (const dim of DIMENSION_ORDER) tagsByDimension[dim] = [];

  products.push(
    ...parseTSV(sourceLines.productsBR).map((row) =>
      createProduct(row, "brasileiro"),
    ),
  );
  products.push(
    ...parseTSV(sourceLines.productsIntl).map((row) =>
      createProduct(row, "internacional"),
    ),
  );
  products = products.filter((product) => product.id && product.name);

  for (const product of products) {
    addTags(product, "tipo_obra", product.typeRaw);
    addTags(product, "tipo_obra", inferTypeFromName(product.name));
    addTags(product, "material", product.materialTagsRaw);
    addTags(product, "estetico", product.aestheticTagsRaw);
    addTags(product, "tecnicas", product.techniqueTagsRaw);
  }

  for (const dim of DIMENSION_ORDER) {
    tagsByDimension[dim].sort(
      (a, b) => b.count - a.count || a.label.localeCompare(b.label, "pt-BR"),
    );
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
  if (textValue.startsWith('"') && textValue.endsWith('"'))
    textValue = textValue.slice(1, -1);
  return textValue;
}

function createProduct(row, origin) {
  const id = field(row, ["ID"], 0);
  const dateRaw = field(row, ["Datação"], 4);
  const production =
    origin === "brasileiro"
      ? field(row, ["Número de exemplares"], 8)
      : field(row, ["TIpo de produção", "Tipo de produção"], 7);
  const composition =
    origin === "brasileiro"
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
    locationRaw:
      origin === "brasileiro"
        ? field(row, ["Localização Geográfica"], 5)
        : field(row, ["Escola ou movimento"], 5),
    movementRaw:
      origin === "internacional" ? field(row, ["Escola ou movimento"], 5) : "",
    author: field(row, ["Autoria"], 6),
    economicContext: field(row, ["Condicionantes Industriais/Econômicos"], 7),
    production,
    composition,
    materialTagsRaw: field(
      row,
      ["Materiais"],
      origin === "brasileiro" ? 10 : 9,
    ),
    aestheticTagsRaw: field(
      row,
      ["Estético"],
      origin === "brasileiro" ? 11 : 10,
    ),
    techniqueTagsRaw: field(
      row,
      ["Técnicas de construção/Funcionalidades"],
      origin === "brasileiro" ? 12 : 11,
    ),
    raw: row,
    tagKeys: new Set(),
    tagsByDimension: Object.fromEntries(DIMENSION_ORDER.map((dim) => [dim, []])),
  };
}

function field(row, names, fallbackIndex) {
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(row, name))
      return cleanText(row[name]);
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
    if (
      hasAny(textValue, [
        "cadeira",
        "poltrona",
        "sofa",
        "banco",
        "banqueta",
        "chaise",
        "assento",
      ])
    )
      return "Assento";
    if (hasAny(textValue, ["mesa", "escrivaninha", "bancada"])) return "Mesa";
    if (hasAny(textValue, ["luminaria", "lampada", "abajur", "iluminacao"]))
      return "Iluminação";
    if (
      hasAny(textValue, [
        "cartaz",
        "poster",
        "selo",
        "revista",
        "livro",
        "capa",
        "tipografia",
        "identidade visual",
        "logotipo",
        "grafico",
        "comunicacao visual",
      ])
    )
      return "Comunicação gráfica";
    if (
      hasAny(textValue, [
        "radio",
        "telefone",
        "camera",
        "barbeador",
        "calculadora",
        "aspirador",
        "processador",
        "computador",
        "aparelho",
        "eletrodomestico",
        "equipamento",
      ])
    )
      return "Equipamento";
    if (
      hasAny(textValue, [
        "onibus",
        "automovel",
        "chevrolet",
        "ford",
        "carro",
        "trem",
        "metro",
        "bicicleta",
        "aviao",
        "transporte",
        "veiculo",
      ])
    )
      return "Transporte";
    if (
      hasAny(textValue, [
        "edificio",
        "casa",
        "pavilhao",
        "fachada",
        "escola",
        "igreja",
        "arquitetura",
        "urbanismo",
      ])
    )
      return "Arquitetura";
    if (
      hasAny(textValue, [
        "vaso",
        "jarra",
        "decanter",
        "copo",
        "prato",
        "talher",
        "panela",
        "garrafa",
        "utensilio",
        "cozinha",
      ])
    )
      return "Utensílio";
    if (
      hasAny(textValue, [
        "tapecaria",
        "tecido",
        "textil",
        "vestido",
        "artigo textil",
      ])
    )
      return "Têxtil";
    if (hasAny(textValue, ["mobiliario"])) return "Mobiliário";
    if (hasAny(textValue, ["joalheria"])) return "Joalheria";
    if (hasAny(textValue, ["artes plasticas", "pintura", "escultura"]))
      return "Artes plásticas";
  }

  if (dimension === "estetico") {
    if (hasAny(textValue, ["curvilineo", "ondular", "curvo", "sinuoso"]))
      return "Curvilíneo";
    if (hasAny(textValue, ["linhas limpas", "linhas continuas", "linear"]))
      return "Linear";
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
    if (
      hasAny(textValue, [
        "postura fixa",
        "postura flexivel",
        "ergonom",
        "inclinacao livre",
      ])
    )
      return "Ergonomia";
    if (hasAny(textValue, ["encaixe", "travamento", "pino"])) return "Encaixe";
    if (
      hasAny(textValue, ["desmontavel", "flat-pack", "aninhavel", "dobravel"])
    )
      return "Design desmontável";
    if (hasAny(textValue, ["usinagem", "fresadora"])) return "Usinagem";
    if (hasAny(textValue, ["moldagem por injecao", "injecao", "monobloco"]))
      return "Moldagem por injeção";
    if (hasAny(textValue, ["curvatura de madeira", "madeira prensada"]))
      return "Curvatura de madeira";
    if (hasAny(textValue, ["curvatura", "dobra", "dobradura"]))
      return "Dobra e curvatura";
    if (
      hasAny(textValue, [
        "producao em massa",
        "producao seriada",
        "seriada",
        "semi-industrial",
      ])
    )
      return "Produção seriada";
    if (hasAny(textValue, ["colagem", "cola"])) return "Colagem";
    if (hasAny(textValue, ["tensionamento", "tensionadas", "tensionado"]))
      return "Tensionamento";
    if (hasAny(textValue, ["pintura", "lacada", "epoxi", "esmaltada"]))
      return "Pintura";
    if (
      hasAny(textValue, [
        "acabamento",
        "revestimento",
        "polimento",
        "cromagem",
        "douramento",
        "zincagem",
        "laminado",
      ])
    )
      return "Acabamento";
    if (hasAny(textValue, ["corte", "recorte", "perfuracao"])) return "Corte";
    if (hasAny(textValue, ["estofamento"])) return "Estofamento";
    if (hasAny(textValue, ["costura"])) return "Costura";
    if (hasAny(textValue, ["fundicao"])) return "Fundição";
    if (hasAny(textValue, ["soldagem", "soldadura"])) return "Soldagem";
    if (hasAny(textValue, ["marcenaria"])) return "Marcenaria";
    if (
      hasAny(textValue, [
        "impressao",
        "litografia",
        "serigrafia",
        "xilogravura",
      ])
    )
      return "Impressão";
    if (hasAny(textValue, ["padronizacao"])) return "Padronização";
    if (
      hasAny(textValue, [
        "modularidade",
        "sistema modular",
        "construcao modular",
        "modulacao",
      ])
    )
      return "Modularidade";
    if (hasAny(textValue, ["tecelagem"])) return "Tecelagem";
  }

  return raw;
}

function inferTypeFromName(name) {
  const inferred = canonicalTag("tipo_obra", name);
  // Se o canonicalTag não conseguiu agrupar (ou seja, retornou o próprio nome cru),
  // não queremos criar uma tag com o nome inteiro do produto.
  if (normalizeText(inferred) === normalizeText(cleanText(name))) {
    return "";
  }
  return inferred;
}

function categoryForTag(dimension, label) {
  const categories = CATEGORY_FILTERS[dimension] || [];
  const normalized = normalizeText(label);
  for (const [category, terms] of categories) {
    if (
      terms.some(
        (term) =>
          normalized.includes(normalizeText(term)) ||
          normalizeText(term).includes(normalized),
      )
    ) {
      return category;
    }
  }
  return dimension === "tipo_obra" ? "Tipo de produto" : "Sem agrupamento";
}

function visibleProducts(ignoreYear = false) {
  if (!ignoreYear && _cachedVisibleProducts) return _cachedVisibleProducts;
  if (ignoreYear && _cachedVisibleProductsNoYear)
    return _cachedVisibleProductsNoYear;

  const selected = selectedTags();
  const selectedType = selected.filter((tag) => tag.dimension === "tipo_obra");
  const selectedGeneral = selected.filter(
    (tag) => tag.dimension !== "tipo_obra",
  );

  const result = products.filter((product) => {
    if (!ignoreYear && (product.year < yearStart || product.year > yearEnd))
      return false;
    if (
      selectedType.length &&
      !selectedType.some((tag) => product.tagKeys.has(tag.key))
    )
      return false;
    if (
      selectedGeneral.length &&
      !selectedGeneral.some((tag) => product.tagKeys.has(tag.key))
    )
      return false;
    return true;
  });

  if (ignoreYear) _cachedVisibleProductsNoYear = result;
  else _cachedVisibleProducts = result;
  return result;
}

function selectedTags() {
  if (_cachedSelectedTags) return _cachedSelectedTags;
  _cachedSelectedTags = Array.from(selectedTagKeys)
    .map((key) => tagsByKey.get(key))
    .filter(Boolean);
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

function getCircularVisualProducts(tags = tagsForCircular()) {
  if (!tags || !tags.length) return [];
  const typeTags = selectedTags().filter(
    (tag) => tag.dimension === "tipo_obra",
  );
  const visualProducts = [];
  for (const product of products) {
    if (product.year < yearStart || product.year > yearEnd) continue;
    if (
      typeTags.length &&
      !typeTags.some((tag) => product.tagKeys.has(tag.key))
    )
      continue;
    const matched = tags.filter((tag) => product.tagKeys.has(tag.key));
    if (!matched.length) continue;
    if (
      focusedCircularTagKey &&
      !matched.some((tag) => tag.key === focusedCircularTagKey)
    )
      continue;
    visualProducts.push({ product, tags: matched, weight: matched.length });
  }
  visualProducts.sort(
    (a, b) =>
      b.weight - a.weight ||
      originWeight(b.product) - originWeight(a.product) ||
      a.product.name.localeCompare(b.product.name, "pt-BR"),
  );
  return visualProducts;
}

function productsShownInCircular() {
  const visualProducts = getCircularVisualProducts();
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

function countProductsWithTagInCurrentType(tag) {
  if (!tag) return 0;
  if (_cachedTagCounts) {
    const cached = _cachedTagCounts.get(tag.key);
    if (cached !== undefined) return cached;
  }

  if (!_cachedTagCounts) {
    _cachedTagCounts = new Map();
    const typeTags = selectedTags().filter(
      (item) => item.dimension === "tipo_obra",
    );
    if (!typeTags.length) {
      // No type filter — all tags use their raw count
      for (const [key, t] of tagsByKey) _cachedTagCounts.set(key, t.count);
    } else {
      // Pre-compute counts for all tags at once
      const counters = new Map();
      for (const product of products) {
        if (!typeTags.some((typeTag) => product.tagKeys.has(typeTag.key)))
          continue;
        for (const key of product.tagKeys) {
          counters.set(key, (counters.get(key) || 0) + 1);
        }
      }
      for (const [key] of tagsByKey)
        _cachedTagCounts.set(key, counters.get(key) || 0);
    }
  }

  return _cachedTagCounts.get(tag.key) || 0;
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
    else if (geometry.type === "MultiPolygon")
      for (const polygon of geometry.coordinates || [])
        addGeoPolygon(rings, polygon);
    if (rings.length) geoCountries.push({ name, iso, rings });
  }
}

function addGeoPolygon(rings, polygon) {
  const exterior = polygon && polygon[0];
  if (!Array.isArray(exterior) || exterior.length < 3) return;
  const step = exterior.length > 900 ? 4 : exterior.length > 360 ? 2 : 1;
  const ring = [];
  for (let i = 0; i < exterior.length; i += step)
    ring.push([Number(exterior[i][0]), Number(exterior[i][1])]);
  rings.push(ring);
}

function createSchool(row) {
  const name = field(row, ["Escola"], 1);
  const context = field(row, ["Contexto"], 2);
  if (!name) return null;
  const interval = schoolInterval(name, context);
  return {
    name,
    context,
    start: interval.start,
    end: interval.end,
    locations: schoolLocations(name, context),
  };
}

function schoolInterval(name, context) {
  const textValue = normalizeText(`${name} ${context}`);
  if (textValue.includes("bauhaus")) return { start: 1919, end: 1933 };
  if (textValue.includes("vutemas") || textValue.includes("vkhutemas"))
    return { start: 1920, end: 1930 };
  if (textValue.includes("ulm")) return { start: 1953, end: 1968 };
  if (textValue.includes("cranbrook")) return { start: 1932, end: 2010 };
  if (textValue.includes("art nouveau") && !textValue.includes("jugendstil"))
    return { start: 1880, end: 1910 };
  if (textValue.includes("jugendstil")) return { start: 1890, end: 1910 };
  if (textValue.includes("deutscher werkbund"))
    return { start: 1907, end: 1934 };
  if (textValue.includes("estilo internacional"))
    return { start: 1933, end: 1980 };
  if (textValue.includes("streamlining")) return { start: 1930, end: 1950 };
  if (textValue.includes("anti-design") || textValue.includes("anti design"))
    return { start: 1966, end: 1980 };
  if (textValue.includes("pop art")) return { start: 1956, end: 1970 };
  if (textValue.includes("design organico")) return { start: 1940, end: 2010 };
  if (textValue.includes("biomorfismo")) return { start: 1930, end: 1975 };
  if (textValue.includes("memphis")) return { start: 1981, end: 1988 };
  if (textValue.includes("california new wave"))
    return { start: 1975, end: 1995 };
  const years = `${name} ${context}`.match(/(18|19|20)\d\d/g) || [];
  if (years.length >= 2)
    return { start: Number(years[0]), end: Number(years[1]) };
  if (years.length === 1)
    return { start: Number(years[0]), end: Number(years[0]) + 20 };
  return { start: YEAR_MIN, end: YEAR_MAX };
}

function schoolLocations(name, context) {
  const textValue = normalizeText(`${name} ${context}`);
  const result = [];
  const add = (location) => result.push(location);
  if (textValue.includes("bauhaus"))
    add({
      name: "Dessau / Weimar",
      country: "Alemanha",
      lat: 51.842,
      lon: 12.23,
    });
  else if (textValue.includes("vutemas") || textValue.includes("vkhutemas"))
    add({ name: "Moscou", country: "Russia", lat: 55.7558, lon: 37.6173 });
  else if (textValue.includes("ulm")) {
    add({ name: "Ulm", country: "Alemanha", lat: 48.4011, lon: 9.9876 });
    add({
      name: "Rio de Janeiro",
      country: "Brasil",
      lat: -22.9068,
      lon: -43.1729,
    });
  } else if (textValue.includes("cranbrook"))
    add({
      name: "Bloomfield Hills",
      country: "Estados Unidos",
      lat: 42.5836,
      lon: -83.2455,
    });
  else if (
    textValue.includes("art nouveau") &&
    !textValue.includes("jugendstil")
  ) {
    add({ name: "Paris", country: "Franca", lat: 48.8566, lon: 2.3522 });
    add({ name: "Bruxelas", country: "Belgica", lat: 50.8503, lon: 4.3517 });
    add({ name: "Barcelona", country: "Espanha", lat: 41.3851, lon: 2.1734 });
  } else if (
    textValue.includes("jugendstil") ||
    textValue.includes("deutscher werkbund")
  )
    add({ name: "Munique", country: "Alemanha", lat: 48.1351, lon: 11.582 });
  else if (textValue.includes("estilo internacional"))
    add({ name: "Zurique", country: "Suica", lat: 47.3769, lon: 8.5417 });
  else if (textValue.includes("streamlining"))
    add({
      name: "Detroit",
      country: "Estados Unidos",
      lat: 42.3314,
      lon: -83.0458,
    });
  else if (
    textValue.includes("anti-design") ||
    textValue.includes("anti design") ||
    textValue.includes("memphis")
  )
    add({ name: "Milao", country: "Italia", lat: 45.4642, lon: 9.19 });
  else if (textValue.includes("pop art"))
    add({
      name: "Nova York",
      country: "Estados Unidos",
      lat: 40.7128,
      lon: -74.006,
    });
  else if (textValue.includes("design organico"))
    add({
      name: "Helsinque",
      country: "Finlandia",
      lat: 60.1699,
      lon: 24.9384,
    });
  else if (textValue.includes("california new wave"))
    add({
      name: "Los Angeles",
      country: "Estados Unidos",
      lat: 34.0522,
      lon: -118.2437,
    });
  return result;
}

function productLocation(product) {
  if (product.origin === "brasileiro")
    return brazilianLocation(product.locationRaw);
  return internationalLocation(product.movementRaw);
}

function brazilianLocation(value) {
  const textValue = normalizeText(value);
  if (!textValue) return null;
  if (textValue.includes("paris"))
    return {
      name: "Paris, Franca",
      country: "Franca",
      lat: 48.8566,
      lon: 2.3522,
    };
  if (textValue.includes("salvador"))
    return {
      name: "Salvador, BA",
      country: "Brasil",
      lat: -12.9777,
      lon: -38.5016,
    };
  if (textValue.includes("sao bernardo"))
    return {
      name: "Sao Bernardo do Campo, SP",
      country: "Brasil",
      lat: -23.6914,
      lon: -46.5646,
    };
  if (textValue.includes("sao jose dos campos"))
    return {
      name: "Sao Jose dos Campos, SP",
      country: "Brasil",
      lat: -23.2237,
      lon: -45.9009,
    };
  if (textValue.includes("campinas"))
    return {
      name: "Campinas, SP",
      country: "Brasil",
      lat: -22.9056,
      lon: -47.0608,
    };
  if (textValue.includes("jaboticabal"))
    return {
      name: "Jaboticabal, SP",
      country: "Brasil",
      lat: -21.2547,
      lon: -48.3222,
    };
  if (textValue.includes("porto alegre"))
    return {
      name: "Porto Alegre, RS",
      country: "Brasil",
      lat: -30.0346,
      lon: -51.2177,
    };
  if (textValue.includes("rio de janeiro"))
    return {
      name: "Rio de Janeiro, RJ",
      country: "Brasil",
      lat: -22.9068,
      lon: -43.1729,
    };
  if (textValue.includes("sao paulo"))
    return {
      name: "Sao Paulo, SP",
      country: "Brasil",
      lat: -23.5505,
      lon: -46.6333,
    };
  if (textValue.includes("santa catarina"))
    return {
      name: "Santa Catarina",
      country: "Brasil",
      lat: -27.2423,
      lon: -50.2189,
    };
  if (textValue.includes("brasil") || textValue.includes("nacional"))
    return { name: "Brasil", country: "Brasil", lat: -14.235, lon: -51.9253 };
  return null;
}

function internationalLocation(value) {
  const textValue = normalizeText(movementName(value));
  if (!textValue) return null;
  if (textValue.includes("bauhaus"))
    return {
      name: "Dessau, Alemanha",
      country: "Alemanha",
      lat: 51.842,
      lon: 12.23,
    };
  if (textValue.includes("ulm") || textValue.includes("good design"))
    return {
      name: "Ulm, Alemanha",
      country: "Alemanha",
      lat: 48.4011,
      lon: 9.9876,
    };
  if (textValue.includes("cranbrook"))
    return {
      name: "Bloomfield Hills, EUA",
      country: "Estados Unidos",
      lat: 42.5836,
      lon: -83.2455,
    };
  if (textValue.includes("california"))
    return {
      name: "California, EUA",
      country: "Estados Unidos",
      lat: 36.7783,
      lon: -119.4179,
    };
  if (
    textValue.includes("pop art") ||
    textValue.includes("streamlining") ||
    textValue.includes("biomorfismo") ||
    textValue.includes("design organico")
  )
    return {
      name: "Costa Leste, EUA",
      country: "Estados Unidos",
      lat: 40.9,
      lon: -77,
    };
  if (
    textValue.includes("memphis") ||
    textValue.includes("anti-design") ||
    textValue.includes("anti design")
  )
    return {
      name: "Milao, Italia",
      country: "Italia",
      lat: 45.4642,
      lon: 9.19,
    };
  if (textValue.includes("vkhutemas"))
    return {
      name: "Moscou, Russia",
      country: "Russia",
      lat: 55.7558,
      lon: 37.6173,
    };
  if (
    textValue.includes("deutscher werkbund") ||
    textValue.includes("jugendstil")
  )
    return {
      name: "Munique, Alemanha",
      country: "Alemanha",
      lat: 48.1351,
      lon: 11.582,
    };
  if (textValue.includes("art nouveau"))
    return {
      name: "Paris, Franca",
      country: "Franca",
      lat: 48.8566,
      lon: 2.3522,
    };
  if (textValue.includes("estilo internacional"))
    return {
      name: "Zurique, Suica",
      country: "Suica",
      lat: 47.3769,
      lon: 8.5417,
    };
  return null;
}

function movementName(value) {
  const raw = cleanText(value);
  const textValue = normalizeText(raw);
  if (!textValue) return "";
  if (textValue.includes("bahaus") || textValue.includes("bauhaus"))
    return "Bauhaus";
  if (textValue.includes("modernismo norte"))
    return "Modernismo Norte-Americano";
  if (textValue.includes("pop art")) return "Pop Art";
  if (textValue.includes("estilo internacional")) return "Estilo Internacional";
  if (
    textValue.includes("hfg ulm") ||
    textValue.includes("good design") ||
    textValue === "ulm"
  )
    return "HfG Ulm / Good Design";
  if (textValue.includes("cranbrook")) return "Cranbrook Academy of Art";
  if (textValue.includes("california new wave")) return "California New Wave";
  if (textValue.includes("deutscher werkbund")) return "Deutscher Werkbund";
  if (textValue.includes("art nouveau") && !textValue.includes("jugendstil"))
    return "Art Nouveau";
  if (textValue.includes("jugendstil")) return "Jugendstil";
  if (textValue.includes("streamlining")) return "Streamlining";
  if (textValue.includes("anti-design") || textValue.includes("anti design"))
    return "Anti-Design";
  if (textValue.includes("vkhutemas") || textValue.includes("vutemas"))
    return "Vkhutemas";
  if (textValue.includes("memphis")) return "Memphis";
  if (textValue.includes("biomorfismo")) return "Biomorfismo";
  if (textValue.includes("design organico")) return "Design Orgânico";
  return raw;
}

function normalizeCountry(value) {
  const textValue = normalizeText(value);
  if (
    textValue.includes("united states") ||
    textValue.includes("estados unidos") ||
    textValue === "eua"
  )
    return "estados unidos";
  if (textValue.includes("germany") || textValue.includes("alemanha"))
    return "alemanha";
  if (textValue.includes("brazil") || textValue.includes("brasil"))
    return "brasil";
  if (textValue.includes("france") || textValue.includes("franca"))
    return "franca";
  if (textValue.includes("italy") || textValue.includes("italia"))
    return "italia";
  if (textValue.includes("russia")) return "russia";
  if (textValue.includes("switzerland") || textValue.includes("suica"))
    return "suica";
  if (textValue.includes("belgium") || textValue.includes("belgica"))
    return "belgica";
  if (textValue.includes("spain") || textValue.includes("espanha"))
    return "espanha";
  if (textValue.includes("finland") || textValue.includes("finlandia"))
    return "finlandia";
  return textValue;
}

function productType(product) {
  return product && product.tagsByDimension.tipo_obra.length
    ? product.tagsByDimension.tipo_obra[0].label
    : "";
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

function extractYear(value) {
  const match = cleanText(value).match(/(18|19|20)\d\d/);
  return match ? Number(match[0]) : YEAR_MIN;
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function hasAny(textValue, terms) {
  return terms.some((term) => textValue.includes(normalizeText(term)));
}

