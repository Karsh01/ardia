import { displayHost, displayUrl, hostOf, type SearchScope, type Suggestion } from "@ardia/core";
import { memo, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text as NativeText, View } from "react-native";
import { Favicon } from "../favicon/Favicon";
import { Button, Symbol, useTheme, withAlpha } from "../ui";
import type { BarEvent } from "./barText";
import { SuggestionIcon, type RowActions } from "./SuggestionRow";
import { CREST } from "./tokens";

type Section = "topHit" | "intent" | "recentTabs" | "tabs" | "saved" | "history" | "actions" | "results" | "suggestions";

const ORDER: readonly Section[] = ["topHit", "intent", "recentTabs", "tabs", "saved", "history", "actions", "results", "suggestions"];

const TITLES: Record<Section, string | null> = {
  topHit: null,
  intent: null,
  recentTabs: "Recent Tabs",
  tabs: "Tabs",
  saved: "Pinned & Saved",
  history: "History",
  actions: "Actions",
  results: null,
  suggestions: "Search Suggestions",
};

const LIMITS: Record<Section, number> = {
  topHit: 1,
  intent: CREST.limits.intents,
  recentTabs: CREST.limits.recentTabs,
  tabs: CREST.limits.tabs,
  saved: CREST.limits.saved,
  history: CREST.limits.history,
  actions: CREST.limits.actions,
  results: CREST.limits.results,
  suggestions: CREST.limits.suggestions,
};

const HEADER_HEIGHT = 17;

export type CrestActions = RowActions & { select(index: number): void };

type CrestRow = { suggestion: Suggestion; index: number };
type CrestGroup = { section: Section; title: string | null; rows: CrestRow[] };

function sectionOf(s: Suggestion, idle: boolean): Section {
  if (idle) return "recentTabs";
  switch (s.kind) {
    case "search":
      return s.suggested ? "suggestions" : "intent";
    case "calc":
      return "intent";
    case "page":
      return s.tabId ? "tabs" : s.bookmarked ? "saved" : s.visited ? "history" : "intent";
    case "action":
    case "extension":
    case "create":
      return "actions";
    case "provider":
      return "results";
  }
}

function crestGroups(items: Suggestion[], idle: boolean): CrestGroup[] {
  const buckets = new Map<Section, Suggestion[]>();
  items.forEach((s, i) => {
    const section = i === 0 && !idle ? "topHit" : sectionOf(s, idle);
    const rows = buckets.get(section) ?? [];
    if (rows.length < LIMITS[section]) rows.push(s);
    buckets.set(section, rows);
  });
  let index = 0;
  return ORDER.filter((section) => buckets.get(section)?.length).map((section) => ({
    section,
    title: TITLES[section],
    rows: buckets.get(section)!.map((suggestion) => ({ suggestion, index: index++ })),
  }));
}

export const crestArrange = (items: Suggestion[], idle: boolean): Suggestion[] => crestGroups(items, idle).flatMap((g) => g.rows.map((r) => r.suggestion));

type RowText = { title: string; subtitle: string; action: string | null; symbol: string; keycap: string | null };

function rowText(s: Suggestion): RowText {
  const base = { action: null, keycap: null };
  switch (s.kind) {
    case "page": {
      const url = displayUrl(s.url);
      if (s.tabId) return { ...base, title: s.title || url, subtitle: url, action: "Switch to Tab", symbol: "globe" };
      if (s.bookmarked) return { ...base, title: s.title || url, subtitle: url, action: "Open", symbol: "bookmark" };
      if (s.visited) return { ...base, title: s.title || url, subtitle: url, action: "Open", symbol: "clock" };
      return { ...base, title: `Open ${displayHost(hostOf(s.url)) || url}`, subtitle: url, symbol: "globe" };
    }
    case "search":
      return s.suggested
        ? { ...base, title: s.query, subtitle: "", action: "Search", symbol: "magnifyingglass" }
        : { ...base, title: s.query, subtitle: `Search ${s.engine}`, symbol: "magnifyingglass" };
    case "calc":
      return { ...base, title: s.value, subtitle: s.expression, action: "Copy", symbol: "equal" };
    case "action":
      return { ...base, title: s.title, subtitle: "", symbol: s.icon ?? "command", keycap: s.hint ?? null };
    case "extension":
      return { ...base, title: s.title, subtitle: s.open === "action" ? "Open Extension" : "Extension Options", symbol: "puzzlepiece.extension" };
    case "create":
      return { ...base, title: s.title, subtitle: s.site, symbol: "plus" };
    case "provider": {
      const host = displayHost(hostOf(s.url)) || displayUrl(s.url);
      return { ...base, title: s.title, subtitle: s.subtitle ? `${host} · ${s.subtitle}` : host, action: "Open", symbol: "globe" };
    }
  }
}

function rowOffsets(groups: CrestGroup[]): number[] {
  const offsets: number[] = [];
  let y = CREST.listPad;
  groups.forEach((group, g) => {
    if (g > 0) y += CREST.groupGap;
    if (group.title) y += HEADER_HEIGHT + CREST.headerGap;
    group.rows.forEach((row, r) => {
      if (r > 0) y += CREST.rowGap;
      offsets[row.index] = y;
      y += CREST.row.height;
    });
  });
  return offsets;
}

export const CrestResults = memo(function CrestResults({
  items,
  idle,
  selectedIndex,
  actions,
}: {
  items: Suggestion[];
  idle: boolean;
  selectedIndex: number;
  actions: CrestActions;
}) {
  const theme = useTheme();
  const groups = crestGroups(items, idle);
  const scroll = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const [viewport, setViewport] = useState(0);
  const offsets = rowOffsets(groups);
  const selectedTop = offsets[selectedIndex];
  useEffect(() => {
    if (selectedTop === undefined || !viewport) return;
    const bottom = selectedTop + CREST.row.height;
    if (selectedTop - CREST.listPad < scrollY.current) scroll.current?.scrollTo({ y: Math.max(0, selectedTop - CREST.listPad), animated: false });
    else if (bottom + CREST.listPad > scrollY.current + viewport) scroll.current?.scrollTo({ y: bottom + CREST.listPad - viewport, animated: false });
  }, [selectedTop, viewport]);
  return (
    <ScrollView
      ref={scroll}
      style={{ flex: 1 }}
      onLayout={(e) => setViewport(e.nativeEvent.layout.height)}
      onScroll={(e) => (scrollY.current = e.nativeEvent.contentOffset.y)}
      scrollEventThrottle={16}
      contentContainerStyle={{ padding: CREST.listPad, gap: CREST.groupGap }}
    >
      {groups.map((group) => (
        <View key={group.section} style={{ gap: CREST.rowGap }}>
          {group.title ? (
            <View style={{ height: HEADER_HEIGHT, justifyContent: "flex-end", paddingHorizontal: CREST.headerPadX, marginBottom: CREST.headerGap - CREST.rowGap }}>
              <NativeText style={{ ...CREST.header, color: theme.textSecondary }}>{group.title}</NativeText>
            </View>
          ) : null}
          {group.rows.map((row) => (
            <CrestRowView
              key={row.index}
              suggestion={row.suggestion}
              index={row.index}
              intent={group.section === "topHit" || group.section === "intent"}
              selected={row.index === selectedIndex}
              actions={actions}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
});

const CrestRowView = memo(function CrestRowView({
  suggestion: s,
  index,
  intent,
  selected,
  actions,
}: {
  suggestion: Suggestion;
  index: number;
  intent: boolean;
  selected: boolean;
  actions: CrestActions;
}) {
  const theme = useTheme();
  const row = CREST.row;
  const text = rowText(s);
  const tab = s.kind === "page" && !!s.tabId;
  const pictured = tab || s.kind === "provider" || s.kind === "create" || (s.kind === "extension" && !!s.icon);
  const arrow = intent || selected ? "arrow.turn.down.left" : "arrow.right";
  return (
    <Pressable onPress={() => actions.choose(s)}>
      <View
        onMouseEnter={() => actions.select(index)}
        style={{
          minHeight: row.height,
          borderRadius: row.radius,
          paddingHorizontal: row.padX,
          flexDirection: "row",
          alignItems: "center",
          gap: row.gap,
          backgroundColor: withAlpha(selected ? theme.accent : theme.textPrimary, selected ? row.selected : row.resting),
        }}
      >
        <View
          style={{
            width: row.tile,
            height: row.tile,
            borderRadius: row.tileRadius,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: withAlpha(theme.textPrimary, row.tileFill),
          }}
        >
          {tab && s.kind === "page" ? (
            <Favicon url={s.url} favicon={s.favicon} size={row.favicon} />
          ) : pictured ? (
            <SuggestionIcon suggestion={s} />
          ) : (
            <Symbol
              name={text.symbol}
              size={intent ? row.intentSymbol : row.symbol}
              weight="semibold"
              color={intent ? theme.textPrimary : theme.textSecondary}
              style={{ width: row.tile, height: row.tile }}
            />
          )}
        </View>
        <View style={{ flex: 1, gap: row.textGap }}>
          <NativeText numberOfLines={1} style={{ ...row.title, color: theme.textPrimary }}>
            {text.title}
          </NativeText>
          {text.subtitle ? (
            <NativeText numberOfLines={1} style={{ ...row.detail, color: theme.textSecondary }}>
              {text.subtitle}
            </NativeText>
          ) : null}
        </View>
        {text.keycap ? (
          <View
            style={{
              paddingHorizontal: CREST.keycap.padX,
              minHeight: CREST.keycap.height,
              borderRadius: CREST.keycap.radius,
              justifyContent: "center",
              backgroundColor: withAlpha(theme.textPrimary, CREST.keycap.fill),
            }}
          >
            <NativeText style={{ ...CREST.keycap.font, color: theme.textSecondary }}>{text.keycap}</NativeText>
          </View>
        ) : text.action ? (
          <NativeText style={{ ...row.trailing, color: theme.textSecondary }}>{text.action}</NativeText>
        ) : null}
        <Symbol
          name={arrow}
          size={intent ? row.intentArrow : row.arrow}
          weight={intent ? "semibold" : "regular"}
          color={theme.textSecondary}
          style={{ width: row.arrow + 4, height: row.arrow + 4 }}
        />
      </View>
    </Pressable>
  );
});

export function CrestTabHint() {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: CREST.chip.gap }}>
      <Symbol name="arrow.right.to.line" size={CREST.chip.tabGlyph} color={theme.textSecondary} style={{ width: CREST.chip.tabGlyph + 4, height: CREST.chip.tabGlyph + 4 }} />
      <NativeText style={{ ...CREST.chip.tabHint, color: theme.textSecondary }}>Tab</NativeText>
    </View>
  );
}

export function CrestChip({ label, color, closes }: { label: string; color: string; closes?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: CREST.chip.gap,
        paddingHorizontal: CREST.chip.padX,
        paddingVertical: CREST.chip.padY,
        borderRadius: CREST.chip.padY * 2 + CREST.chip.font.fontSize,
        backgroundColor: withAlpha(color, CREST.row.selected * 2),
      }}
    >
      <NativeText numberOfLines={1} style={{ ...CREST.chip.font, color: theme.textPrimary }}>
        {label}
      </NativeText>
      {closes ? <Symbol name="xmark" size={CREST.chip.tabGlyph} weight="semibold" color={theme.textPrimary} style={{ width: CREST.chip.tabGlyph + 4, height: CREST.chip.tabGlyph + 4 }} /> : null}
    </View>
  );
}

export function CrestEnds({
  scope,
  offered,
  completion,
  from,
  dispatch,
  onClose,
}: {
  scope: SearchScope | null;
  offered: SearchScope | null;
  completion: boolean;
  from: string;
  dispatch(event: BarEvent): void;
  onClose(): void;
}) {
  return {
    lead: scope ? <CrestScopeToken scope={scope} onLeave={() => dispatch({ kind: "leftScope", restore: null })} /> : null,
    trailing: <CrestTrailing offered={scope ? null : offered} completion={completion} onEnter={(s) => dispatch({ kind: "enteredScope", scope: s, from })} onAccept={() => dispatch({ kind: "tabAccepted", text: from })} onClose={onClose} />,
  };
}

function CrestScopeToken({ scope, onLeave }: { scope: SearchScope; onLeave(): void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onLeave}>
      <CrestChip label={scope.name} color={theme.accent} closes />
    </Pressable>
  );
}

function CrestTrailing({ offered, completion, onEnter, onAccept, onClose }: { offered: SearchScope | null; completion: boolean; onEnter(scope: SearchScope): void; onAccept(): void; onClose(): void }) {
  const theme = useTheme();
  return (
    <>
      {offered ? (
        <Pressable onPress={() => onEnter(offered)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: CREST.chip.padX }}>
            <CrestChip label={offered.name} color={theme.accent} />
            <CrestTabHint />
          </View>
        </Pressable>
      ) : completion ? (
        <Pressable onPress={onAccept}>
          <CrestTabHint />
        </Pressable>
      ) : null}
      <Button variant="icon" icon="xmark" size="s" color={theme.textSecondary} tooltip="Close" onPress={onClose} />
    </>
  );
}
