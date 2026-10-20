// Nuxt UI toggles only "light" | "dark"; map them to daisyUI theme names
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
