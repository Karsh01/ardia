import { displayHost, displayUrl, hostOf, type Suggestion } from "@ardia/core";
import { memo, useState } from "react";
import { Image, Pressable, Text as NativeText, View } from "react-native";
import { Button, Symbol, Text, useHover, useTheme, withAlpha, type Theme } from "../ui";
import { Favicon } from "../favicon/Favicon";
import { CRA_BAR, SELECTED_SUGGESTION_ALPHA, SUGGESTION } from "./tokens";

const ICON_BOX = { width: SUGGESTION.iconBox, height: SUGGESTION.iconBox } as const;

const selectedFill = (theme: Theme) =>
  theme.powerUpColor ? withAlpha(theme.powerUpColor, theme.dark ? SELECTED_SUGGESTION_ALPHA.dark : SELECTED_SUGGESTION_ALPHA.light) : theme.commandBarSelected;

export function SuggestionIcon({ suggestion: s, color }: { suggestion: Suggestion; color?: string }) {
  const theme = useTheme();
  const tint = color ?? theme.textSecondary;
  switch (s.kind) {
    case "page":
      return <Favicon url={s.url} favicon={s.favicon} />;
    case "create":
      return <Favicon url={`https://${s.site}`} />;
    case "search":
      return <Symbol name="magnifyingglass" size={SUGGESTION.icon} color={tint} style={ICON_BOX} />;
    case "calc":
      return <Symbol name="equal.circle" size={SUGGESTION.calcIcon} color={tint} style={ICON_BOX} />;
    case "action":
      return <Symbol name={s.icon ?? "command"} size={SUGGESTION.icon} color={tint} style={ICON_BOX} />;
    case "extension":
      return s.icon ? (
        <Image source={{ uri: s.icon }} style={ICON_BOX} />
      ) : (
        <Symbol name="puzzlepiece.extension" size={SUGGESTION.icon} color={tint} style={ICON_BOX} />
      );
    case "provider":
      return <Favicon url={s.url} favicon={s.icon} />;
  }
}

function labels(s: Suggestion): [string, string | null] {
  switch (s.kind) {
    case "page":
      if (s.tabId) return [s.title || displayUrl(s.url), null];
      return s.title ? [s.title, displayUrl(s.url)] : [displayUrl(s.url), null];
    case "search":
      return [s.bang ? `Search ${s.engine} for ${s.query}` : s.query, null];
    case "calc":
      return [s.value, s.expression];
    case "action":
    case "create":
      return [s.title, null];
    case "extension":
      return [s.title, s.open === "action" ? "Open Extension" : "Extension Options"];
    case "provider": {
      const host = displayHost(hostOf(s.url)) || displayUrl(s.url);
      return [s.title, s.subtitle ? `${host} · ${s.subtitle}` : host];
    }
  }
}

function SwitchToTabChip() {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: SUGGESTION.chip.gap, paddingHorizontal: SUGGESTION.chip.padX, height: SUGGESTION.chip.height, borderRadius: SUGGESTION.chip.radius, backgroundColor: theme.commandBarHover }}>
      <Text size="small" tone="textSecondary">Switch to Tab</Text>
      <Symbol name="arrow.right" size={SUGGESTION.chip.arrow} weight="semibold" color={theme.textSecondary} style={{ width: SUGGESTION.chip.arrow, height: SUGGESTION.chip.arrow }} />
    </View>
  );
}

export const craSelection = (theme: Theme) => withAlpha(theme.powerUpColor ?? CRA_BAR.defaultSelection, CRA_BAR.selectionAlpha);

function craDetail(s: Suggestion): string {
  switch (s.kind) {
    case "page": {
      if (s.tabId || !s.title) return "";
      const url = displayUrl(s.url);
      return url.toLowerCase() === s.title.toLowerCase() ? "" : ` — ${url}`;
    }
    case "calc":
      return ` — ${s.expression}`;
    case "provider": {
      const host = displayHost(hostOf(s.url)) || displayUrl(s.url);
      return ` — ${s.subtitle ? `${host} · ${s.subtitle}` : host}`;
    }
    case "extension":
      return ` — ${s.open === "action" ? "Open Extension" : "Extension Options"}`;
    default:
      return "";
  }
}

function craTitle(s: Suggestion): string {
  return labels(s)[0];
}

function CraList({ items, selectedIndex, trailing, actions }: { items: Suggestion[]; selectedIndex: number; trailing: string | null; actions: RowActions }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const lit = hovered ?? selectedIndex;
  return (
    <View
      onMouseLeave={() => setHovered(null)}
      style={{ paddingHorizontal: CRA_BAR.listX, paddingTop: CRA_BAR.listTop, paddingBottom: CRA_BAR.listBottom, gap: CRA_BAR.row.gap }}
    >
      {items.map((s, i) => (
        <CraRow key={i} suggestion={s} lit={i === lit} hint={i === 0 ? trailing : null} actions={actions} onHover={() => setHovered(i)} />
      ))}
    </View>
  );
}

function CraRow({ suggestion: s, lit, hint, actions, onHover }: { suggestion: Suggestion; lit: boolean; hint: string | null; actions: RowActions; onHover(): void }) {
  const theme = useTheme();
  const tone = theme.dark ? "dark" : "light";
  const row = CRA_BAR.row;
  const selection = craSelection(theme);
  const inkColor = lit ? row.ink.selected : row.ink[tone];
  const secondary = lit ? row.secondary.selected : row.secondary[tone];
  const isTab = s.kind === "page" && !!s.tabId;
  const favicon = s.kind === "page" || s.kind === "create" || s.kind === "provider" || (s.kind === "extension" && !!s.icon);
  const tileFill = favicon ? (lit ? row.tileFill.selected : undefined) : s.kind === "action" ? row.tileFill[tone] : undefined;
  const end = hint ?? (s.kind === "action" ? s.hint : s.kind === "provider" ? s.provider : null);
  const onRemove = isRemovable(s) && lit ? () => actions.remove(s.url) : undefined;
  return (
    <Pressable onPress={() => actions.choose(s)}>
      <View
        onMouseEnter={onHover}
        style={{
          height: row.height,
          borderRadius: row.radius,
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: row.left,
          paddingRight: row.right,
          backgroundColor: lit ? selection : undefined,
        }}
      >
        <View style={{ width: row.tile, height: row.tile, borderRadius: row.tileRadius, alignItems: "center", justifyContent: "center", backgroundColor: tileFill }}>
          <SuggestionIcon suggestion={s} color={inkColor} />
        </View>
        <NativeText numberOfLines={1} style={{ flex: 1, marginLeft: row.titleGap, ...row.title, color: inkColor }}>
          {craTitle(s)}
          <NativeText style={{ ...row.detail, color: secondary }}>{craDetail(s)}</NativeText>
        </NativeText>
        {onRemove ? <Button variant="icon" icon="xmark" size="s" color={inkColor} tooltip="Remove from History" onPress={onRemove} /> : null}
        {!onRemove && isTab ? (
          <>
            <NativeText style={{ marginLeft: row.trailingGap, ...row.tabTrailing, color: secondary }}>Switch to Tab</NativeText>
            <View style={{ marginLeft: row.arrowGap, width: row.tile, height: row.tile, borderRadius: row.tileRadius, alignItems: "center", justifyContent: "center", backgroundColor: lit ? row.tileFill.selected : row.tileFill[tone] }}>
              <Symbol name="arrow.right" size={row.arrowGlyph} weight="medium" color={lit ? withAlpha(selection, 1) : row.arrow[tone]} style={{ width: row.tile, height: row.tile }} />
            </View>
          </>
        ) : null}
        {!onRemove && !isTab && end ? <NativeText style={{ marginLeft: row.trailingGap, ...row.trailing, color: secondary }}>{end}</NativeText> : null}
      </View>
    </Pressable>
  );
}

export type RowActions = {
  choose(s: Suggestion): void;
  remove(url: string): void;
};

export const SuggestionList = memo(function SuggestionList({
  items,
  selectedIndex,
  trailing,
  dropdown,
  actions,
  cra = false,
}: {
  items: Suggestion[];
  selectedIndex: number;
  trailing: string | null;
  dropdown: boolean;
  actions: RowActions;
  cra?: boolean;
}) {
  if (!items.length) return null;
  if (cra) return <CraList items={items} selectedIndex={selectedIndex} trailing={trailing} actions={actions} />;
  return (
    <View style={{ paddingHorizontal: dropdown ? SUGGESTION.dropdownListX : SUGGESTION.listX, paddingBottom: dropdown ? SUGGESTION.dropdownListBelow : SUGGESTION.listBelow }}>
      {items.map((s, i) => (
        <SuggestionRow
          key={i}
          suggestion={s}
          selected={i === selectedIndex}
          trailing={i === 0 ? trailing : null}
          actions={actions}
        />
      ))}
    </View>
  );
});

function sameSuggestion(a: Suggestion, b: Suggestion): boolean {
  if (a === b) return true;
  const ka = Object.keys(a) as (keyof Suggestion)[];
  return ka.length === Object.keys(b).length && ka.every((k) => a[k] === b[k]);
}

export const isRemovable = (s: Suggestion | undefined): s is Extract<Suggestion, { kind: "page" }> => s?.kind === "page" && !!s.visited && !s.tabId;

const SuggestionRow = memo(
  function SuggestionRow({
    suggestion: s,
    selected,
    trailing,
    actions,
  }: {
    suggestion: Suggestion;
    selected: boolean;
    trailing: string | null;
    actions: RowActions;
  }) {
    const theme = useTheme();
    const { hovered, hoverProps } = useHover();
    const [title, accessory] = labels(s);
    const hint = trailing ?? (s.kind === "action" ? s.hint : s.kind === "provider" ? s.provider : null);
    const onRemove = isRemovable(s) ? () => actions.remove(s.url) : undefined;
    const removable = !!onRemove && (hovered || selected);
    return (
      <View {...hoverProps}>
        <Pressable onPress={() => actions.choose(s)}>
          <View
            style={{
              height: SUGGESTION.height,
              marginVertical: SUGGESTION.gapY,
              borderRadius: SUGGESTION.radius,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: SUGGESTION.padX,
              gap: SUGGESTION.gap,
              backgroundColor: selected ? selectedFill(theme) : hovered ? theme.commandBarHover : undefined,
            }}
          >
            <SuggestionIcon suggestion={s} />
            <Text lines={1} size="title" style={{ flexShrink: 1 }}>
              {title}
              {accessory ? (
                <NativeText style={{ color: theme.textSecondary }}>
                  {" — "}
                  {accessory}
                </NativeText>
              ) : null}
            </Text>
            <View style={{ flex: 1 }} />
            {hint && !removable ? <Text size="small" tone="textTertiary">{hint}</Text> : null}
            {!hint && !removable && s.kind === "page" && s.tabId && (selected || hovered) ? <SwitchToTabChip /> : null}
            {removable ? (
              <Button variant="icon" icon="xmark" size="s" color={theme.textSecondary} tooltip="Remove from History" onPress={onRemove} />
            ) : null}
          </View>
        </Pressable>
      </View>
    );
  },
  (a, b) => a.selected === b.selected && a.trailing === b.trailing && a.actions === b.actions && sameSuggestion(a.suggestion, b.suggestion),
);
