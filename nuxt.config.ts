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
        "@nuxtjs/robots"
    ],

    devtools: {
        enabled: true
    },

    css: ["~/assets/css/main.css"],

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
