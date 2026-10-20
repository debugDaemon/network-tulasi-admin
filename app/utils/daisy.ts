// Builds a Nuxt UI `ui` prop that replaces a component's slot classes with daisyUI ones.
// Accepts a string for single-slot components (`base`) or a slot-to-classes map.
export function daisy(slots: string | Record<string, string>) {
    const map = typeof slots === "string" ? { base: slots } : slots;

    return Object.fromEntries(
        Object.entries(map).map(([slot, classes]) => [slot, () => classes])
    );
}
