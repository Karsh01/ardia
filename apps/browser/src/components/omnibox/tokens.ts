import { curve, duration } from "../ui/motion";
import { capsule, concentric, font, radius, space } from "../ui/tokens";

export const PANEL_TEXT_LEFT = 48;
const PANEL_ICON_LEFT = 21;
const FIELD_TEXT_INSET = 2.5;
const ICON_SLOT = 18;

export const BAR_TYPE = {
  heroField: font.large,
  floatingField: font.title,
  panelField: font.body,
  goLabel: font.title,
  scope: font.title,
  heroScope: font.title,
} as const;

export const BAR = {
  iconSlot: ICON_SLOT,
  leadingIcon: 15,
  panelFieldLift: -3,
  panel: {
    height: 55,
    heroHeight: 60,
    iconLeft: PANEL_ICON_LEFT,
    heroIconLeft: 18,
    right: 18,
    heroGap: space.m,
    gap: PANEL_TEXT_LEFT - FIELD_TEXT_INSET - PANEL_ICON_LEFT - ICON_SLOT,
  },
  dropdown: { height: 44, left: 13, right: 9, gap: 9 },
  siteControls: { glyph: 15 },
  bottom: { left: 14, heroLeft: 13, right: 13, heroRight: 15, height: 52, heroHeight: 43, heroBelow: space.m, mic: 14 },
} as const;

export const CREST = {
  cardMaxWidth: 720,
  cardPadding: 24,
  cardRadius: 26,
  openScale: 0.97,
  fieldHeight: 68,
  fieldPadX: 20,
  fieldGap: 12,
  fieldInputHeight: 32,
  field: { fontSize: 17 },
  glyph: 17,
  close: 13,
  hairline: 1,
  resultsMax: 390,
  resultsMin: 82,
  scrim: "rgba(0,0,0,0.18)",
  listPad: 14,
  groupGap: 16,
  headerGap: 6,
  headerPadX: 4,
  header: { fontSize: 10, fontWeight: "600" as const },
  rowGap: 6,
  row: {
    height: 54,
    padX: 12,
    radius: 12,
    gap: 12,
    textGap: 2,
    selected: 0.16,
    resting: 0.045,
    tile: 34,
    tileRadius: 8,
    tileFill: 0.08,
    favicon: 20,
    symbol: 16,
    intentSymbol: 18,
    title: { fontSize: 13, fontWeight: "600" as const },
    detail: { fontSize: 10 },
    trailing: { fontSize: 10 },
    arrow: 13,
    intentArrow: 10,
  },
  keycap: { padX: 6, height: 20, radius: 5, fill: 0.07, font: { fontSize: 10, fontWeight: "500" as const, fontFamily: "Menlo" } },
  chip: { padX: 8, padY: 4, gap: 4, font: { fontSize: 12, fontWeight: "600" as const }, tabHint: { fontSize: 10 }, tabGlyph: 9 },
  limits: { tabs: 8, saved: 5, history: 6, actions: 3, suggestions: 3, recentTabs: 5, results: 12, intents: 2 },
} as const;

export const ADD_CHIP = {
  height: 32,
  radius: capsule(32),
  border: 1,
  left: 9,
  right: 12,
  gap: 5,
  glyph: 10,
  glyphBox: 14,
  otherTabs: 12,
} as const;

export const GO_BUTTON = {
  before: space.m,
  minWidth: 99,
  height: 32,
  padX: space.xl,
  radius: capsule(32),
  hoverOpacity: 0.9,
  gap: space.s,
  glyph: 11,
  glyphBox: 14,
  glyphAlpha: "99",
} as const;

export const SCOPE_CHIP = {
  height: 26,
  heroHeight: 28,
  radius: radius.tile,
  left: 7,
  right: 9,
  gap: space.s,
  favicon: 14,
  maxWidth: 220,
} as const;

export const SUGGESTION = {
  listX: 8,
  dropdownListX: space.s,
  listBelow: space.xxs,
  dropdownListBelow: space.s,
  height: 36,
  gapY: 2,
  radius: radius.tile,
  padX: 13,
  gap: 11,
  icon: 13,
  calcIcon: 14,
  iconBox: 16,
  chip: { height: 22, padX: space.m, gap: space.xs, radius: radius.toolbar, arrow: 10 },
} as const;

export const SELECTED_SUGGESTION_ALPHA = { dark: 0.56, light: 0.3 } as const;

export const GROW = { duration: 130, easing: curve.outExpo } as const;

export const SCOPE_PULSE = {
  fill: { dark: 0.28, light: 0.2 },
  ring: { dark: 0.55, light: 0.45 },
  ringWidth: 1,
  rest: 0.25,
  rise: { duration: duration.fast, easing: curve.enter },
  settle: { duration: duration.long, easing: curve.move },
  waitForColor: duration.base,
  luminance: { dark: [0.16, 0.6], light: [0.06, 0.3] },
  neutralBelowSaturation: 0.16,
  radius: { panel: radius.hero, hero: concentric(radius.hero, 0.5), sidebar: radius.panel },
} as const;

export const SITE_BRAND_COLORS: Readonly<Record<string, string>> = {
  "youtube.com": "#FF0000",
  "google.com": "#4285F4",
  "maps.google.com": "#34A853",
  "drive.google.com": "#1FA463",
  "mail.google.com": "#EA4335",
  "translate.google.com": "#4285F4",
  "bing.com": "#008373",
  "duckduckgo.com": "#DE5833",
  "perplexity.ai": "#20808D",
  "chatgpt.com": "#10A37F",
  "ecosia.org": "#36ACB8",
  "search.brave.com": "#FB542B",
  "kagi.com": "#FFB319",
  "startpage.com": "#6573FF",
  "search.yahoo.com": "#6001D2",
  "baidu.com": "#2932E1",
  "yandex.com": "#FC3F1D",
  "wikipedia.org": "#000000",
  "github.com": "#181717",
  "amazon.com": "#FF9900",
  "reddit.com": "#FF4500",
  "x.com": "#000000",
  "twitter.com": "#000000",
  "stackoverflow.com": "#F48024",
  "npmjs.com": "#CB3837",
  "imdb.com": "#F5C518",
  "open.spotify.com": "#1DB954",
  "linkedin.com": "#0A66C2",
  "ebay.com": "#E53238",
  "pinterest.com": "#E60023",
  "news.ycombinator.com": "#FF6600",
  "developer.mozilla.org": "#000000",
  "figma.com": "#A259FF",
  "notion.so": "#000000",
  "apps.apple.com": "#0D96F6",
};
