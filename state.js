let icones = {};

let fontes = {};
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
let leftPanelTab = "filtros"; // "filtros", "exportar", "sobre"
let leftPanelExtendedOpen = true; // controls visibility of extended filter/export/sobre panel

// Per-frame cache for expensive computations
let _cacheFrame = -1;
let _cachedSelectedTags = null;
let _cachedVisibleProducts = null;
let _cachedVisibleProductsNoYear = null;
let _cachedTagCounts = null;
let _cachedBubbleGroups = null;
let _bubbleCacheKey = "";

let activeCategoryByDimension = Object.fromEntries(
  DIMENSION_ORDER.map((dim) => [dim, -1]),
);
let categorySelectorOpen = false;
let tagSearch = "";
let tagSearchActive = false;
let tagScroll = 0;
let detailScroll = 0;
let savedScroll = 0;
let savedSearch = "";
let savedSearchActive = false;
let savedSortMode = 0;
let rightPanelTab = "material"; // "tecnicas", "material", "estetico", "salvos"
let lightMode = true;
let activeView = VISAO_CIRCULAR;
let yearStart = YEAR_MIN;
let yearEnd = YEAR_MAX;
let draggedYearHandle = null;
let hitAreas = [];
let focusedCircularTagKey = "";
let exportViewsSelection = VIEWS_CONFIG.map(() => true);
let exportFormatDropdownOpen = false;
let exportFormatSelected = "PDF";

let mapState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  dragging: false,
  previousX: 0,
  previousY: 0,
};
let imageCache = new Map();
let exportDropdownAnim = 0;
let tagClickAnim = new Map();
let clickRipples = [];
let currentFrameCursor = null;

