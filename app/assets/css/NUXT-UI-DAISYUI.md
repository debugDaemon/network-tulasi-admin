# Using daisyUI with Nuxt UI

Goal: keep Nuxt UI's components (Reka UI behavior, ARIA, keyboard support) and use daisyUI's **themes** and **component classes**, without editing either library and without defining our own colors.

Stack: Nuxt 4, `@nuxt/ui` v4 (Tailwind v4), `daisyui` v5, `@nuxtjs/color-mode` (pulled in by Nuxt UI).

> Nuxt 4 ships Tailwind through `@nuxt/ui`. Do **not** add `@nuxtjs/tailwindcss`; it conflicts and breaks `pnpm dev`.

## Setup (4 pieces)

### 1. daisyUI plugin: `main.css`

```css
@import "tailwindcss";
@import "@nuxt/ui";
@plugin "daisyui" {
    themes: black --default, light;
};
```

- The plugin name is `daisyui` (not `@daisyui`).
- Every theme you use must be listed in `themes:`, or daisyUI will not emit it.
- If VS Code warns about `@plugin`/`@theme`, set `"css.lint.unknownAtRules": "ignore"` in `.vscode/settings.json`.

### 2. Point Nuxt UI surface tokens at daisyUI: `main.css`

Nuxt UI uses its own `--ui-*` variables. Map them to the active daisyUI theme (no colors are defined here):

```css
:root {
    --ui-bg: var(--color-base-100);
    --ui-bg-muted: var(--color-base-200);
    --ui-bg-elevated: var(--color-base-200);
    --ui-bg-accented: var(--color-base-300);
    --ui-border: var(--color-base-300);
    --ui-border-muted: var(--color-base-300);
    --ui-border-accented: var(--color-base-300);
    --ui-text: var(--color-base-content);
    --ui-text-highlighted: var(--color-base-content);
    --ui-text-toned: var(--color-base-content);
    --ui-text-muted: var(--color-base-content);
    --ui-text-dimmed: var(--color-base-content);
}
```

Trade-off: every text token points to the same `base-content`, so muted/dimmed text shades are lost. Nuxt UI's primary/neutral palette (`app.config.ts`) is not mapped to daisyUI.

### 3. Theme switching: `app/plugins/daisy-theme.ts`

`UColorModeButton` and `@nuxtjs/color-mode` only ever toggle `light` / `dark`, and Nuxt UI's `dark:` classes depend on the `dark` class. So keep that, and map the mode to a daisyUI theme name on `<html data-theme>`:

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

`nuxt.config.ts`, default to dark, follow the OS otherwise:

```ts
colorMode: {
    preference: "system",
    fallback: "dark"
},
```

Note: `colorMode.dataValue` does **not** work for this; it writes the mode name (light/dark), never a theme name.

### 4. The `daisy()` helper: `app/utils/daisy.ts` (auto-imported)

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
<UButton :ui="daisy('btn btn-secondary')">Contact us</UButton>
<!-- multi-slot (untested): -->
<UCard :ui="daisy({ root: 'card', body: 'card-body' })" />
```

## Why a helper is needed

- daisyUI classes (`btn`, `card`...) are plain CSS using theme variables, **not** `@apply` macros, so they cannot be expanded into utilities.
- Nuxt UI builds classes with `tailwind-variants` + `tailwind-merge`, which do not know `btn`. Writing `<UButton class="btn btn-secondary">` keeps Nuxt's utilities too, and they beat daisyUI's CSS layer (mixed padding/radius).
- A daisyUI `prefix` does not help: the problem is stacking, not naming.
- The `ui` prop accepts a **function** per slot that *replaces* the resolved classes. `daisy()` wraps that, giving a pure daisyUI element. (`:class` does not accept functions.)
- Only `ULink` has a `raw` prop; `<ULink raw class="btn">` is also clean.

## `ui.theme.unstyled` (currently off)

`nuxt.config.ts` has a commented-out `ui: { theme: { unstyled: true } }`. It strips **all** default Nuxt UI classes, including layout ones (header, footer, modal positioning), so those must be re-supplied. It is left off so Nuxt's layout stays intact and `daisy()` overrides per component.

Behavior, ARIA, keyboard navigation and focus management come from Reka UI and are unaffected either way. Only class-dependent presentation changes.

## Gotchas

- Dark theme `black` is flat by design: radius 0 and `--depth: 0` (no shadows). `light` has rounded corners and depth. This is the theme, not a bug. Of 35 built-in themes, only `cyberpunk` (bright yellow) is also flat and light.
- If the dev server shows a conflict after `nuxt module add tailwindcss`, restore `nuxt.config.ts`, `package.json` and `pnpm-lock.yaml` with git and reinstall.
- Editing `nuxt.config.ts` restarts the dev server; expect brief 503s.
- Slot-class replacement for multi-slot components (Card, Modal, ...) has not been verified yet.
