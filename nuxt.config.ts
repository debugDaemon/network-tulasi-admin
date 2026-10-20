// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        "@nuxt/eslint",
        "@nuxt/ui",
        "@nuxt/hints",
        "@nuxt/image",
        "@nuxt/test-utils/module",
        "@csrf-armor/nuxt",
        "@nuxtjs/google-fonts",
        "@nuxtjs/robots",
        "@nuxt/icon/module"
    ],

    devtools: {
        enabled: true
    },

    css: ["~/assets/css/main.css"],

    // Follow the OS preference (light -> daisyUI "light", dark -> "black"); default to dark when undetectable
    colorMode: {
        preference: "system",
        fallback: "dark"
    },

    // Strips all Nuxt UI default classes, including layout ones. Left off to keep Nuxt's original styling;
    // use the daisy() helper per component instead.
    // ui: {
    //     theme: {
    //         unstyled: true
    //     }
    // },

    routeRules: {
        "/": { prerender: true }
    },

    compatibilityDate: "2026-06-30",

    eslint: {
        config: {
            standalone: false
        }
    }
});
