# Using daisyUI with Nuxt UI

Goal: keep Nuxt UI's components (Reka UI behavior, ARIA, keyboard support) and use daisyUI's **themes** and **component classes**, without editing either library and without defining our own colors.

Stack: Nuxt 4, `@nuxt/ui` v4 (Tailwind v4), `daisyui` v5, `@nuxtjs/color-mode` (pulled in by Nuxt UI).

> Nuxt 4 ships Tailwind through `@nuxt/ui`. Do **not** add `@nuxtjs/tailwindcss`; it conflicts and breaks `pnpm dev`.

## Setup (3 pieces)

### 1. daisyUI plugin: `main.css`

```css
@import "tailwindcss";
@import "@nuxt/ui";
@plugin "daisyui" {
    themes:
        black --default,
        light;
}
```

- daisyUI stays global (`:root`), so `<html data-theme>` themes everything. It also writes `--color-primary` etc. on `:root`, which would override Nuxt UI, so Nuxt UI is scoped (below).
- The plugin name is `daisyui` (not `@daisyui`).
- Every theme you use must be listed in `themes:`, or daisyUI will not emit it.
- If VS Code warns about `@plugin`/`@theme`, set `"css.lint.unknownAtRules": "ignore"` in `.vscode/settings.json`.

### 2. Theme switching and Nuxt UI scope

`UColorModeButton` and `@nuxtjs/color-mode` only ever toggle `light` / `dark`, and Nuxt UI's `dark:` classes depend on the `dark` class. So keep that; `app/plugins/daisy-theme.ts` maps the mode to a daisyUI theme and sets `<html data-theme>`:

```ts
const daisyThemes = {
    light: "light",
    dark: "black"
} as const;

export default defineNuxtPlugin(() => {
    const colorMode = useColorMode();

    useHead({
        htmlAttrs: {
            "data-theme": computed(() => daisyThemes[colorMode.value as keyof typeof daisyThemes] ?? daisyThemes.dark)
        }
    });
});
```

The names in `daisyThemes` and the `themes:` line in `main.css` must stay in sync.

**Nuxt UI scope:** `app.vue` wraps `<UApp>` in `<div id="nuxt-ui-scope">` and passes `portal="#nuxt-ui-scope"`, so teleported menus/modals stay inside it. Both libraries define `--color-primary/secondary/success/info/warning/error`, so `main.css` does three things:

1. Inside `#nuxt-ui-scope`, those variables point at Nuxt's `--ui-*` values, so Nuxt UI components keep their stock colors (amber primary).
2. Nuxt UI paints the page from `--ui-bg`, `--ui-text`, `--ui-border` tokens; `:root` points those at daisyUI's `base-100/200/300` and `base-content`. No element styles are replicated, the page simply shows the active daisyUI theme.
3. The `daisy` utility restores daisyUI's colors on an element inside the scope (using copies saved on `<html>` as `--daisy-*`). Only `daisy()` adds it, so daisyUI colors are opt-in: a raw `class="btn"` is plain daisyUI CSS stacked on Nuxt UI classes, so use the helper, `:ui="daisy('btn btn-secondary')"` renders with the daisyUI theme.

`nuxt.config.ts`, default to dark, follow the OS otherwise:

```ts
export default defineNuxtConfig({
    colorMode: {
        preference: "system",
        fallback: "dark"
    }
});
```

Note: `colorMode.dataValue` does **not** work for this; it writes the mode name (light/dark), never a theme name.

### 3. The `daisy()` helper: `app/utils/daisy.ts` (auto-imported)

```ts
export function daisy(slots: string | Record<string, string>) {
    const map = typeof slots === "string" ? { base: slots } : slots;

    return Object.fromEntries(
        Object.entries(map).map(([slot, classes]) => [slot, () => classes])
    );
}
```

Usage:

```vue
<UButton :ui="daisy('btn btn-secondary')">
Contact us
</UButton>

<!-- multi-slot (untested): -->
<UCard :ui="daisy({ root: 'card', body: 'card-body' })" />
```

## Why a helper is needed

- daisyUI classes (`btn`, `card`...) are plain CSS using theme variables, **not** `@apply` macros, so they cannot be expanded into utilities.
- Nuxt UI builds classes with `tailwind-variants` + `tailwind-merge`, which do not know `btn`. Writing `<UButton class="btn btn-secondary">` keeps Nuxt's utilities too, and they beat daisyUI's CSS layer (mixed padding/radius).
- A daisyUI `prefix` does not help: the problem is stacking, not naming.
- The `ui` prop accepts a **function** per slot that _replaces_ the resolved classes. `daisy()` wraps that, giving a pure daisyUI element. (`:class` does not accept functions.)
- Only `ULink` has a `raw` prop; `<ULink raw class="btn">` is also clean.

## "Override" strategy

Nuxt UI v2 had `strategy: "override"`. v4 has no such option; the equivalent is the function slot replacer used by `daisy()`: it **replaces** the resolved slot classes instead of merging. The same function in `app.config.ts` replaces only the theme defaults (define it in one place only).

## `ui.theme.unstyled` (currently off)

`nuxt.config.ts` has a commented-out `ui: { theme: { unstyled: true } }`. It strips **all** default Nuxt UI classes, including layout ones (header, footer, modal positioning), so those must be re-supplied. It is left off so Nuxt's layout stays intact and `daisy()` overrides per component.

Behavior, ARIA, keyboard navigation and focus management come from Reka UI and are unaffected either way. Only class-dependent presentation changes.

## Gotchas

- Dark theme `black` is flat by design: radius 0 and `--depth: 0` (no shadows). `light` has rounded corners and depth. This is the theme, not a bug. Of 35 built-in themes, only `cyberpunk` (bright yellow) is also flat and light.
- If the dev server shows a conflict after `nuxt module add tailwindcss`, restore `nuxt.config.ts`, `package.json` and `pnpm-lock.yaml` with git and reinstall.
- Editing `nuxt.config.ts` restarts the dev server; expect brief 503s.
- Slot-class replacement for multi-slot components (Card, Modal, ...) has not been verified yet.
