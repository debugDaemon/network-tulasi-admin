<template>
    <UHeader>
        <template #left>
            <NuxtLink
                to="/"
                class="focus-visible:outline-3 outline-primary/25 rounded-md p-1 -ms-1"
            >
                <AppLogo class="w-auto h-6 shrink-0" />
            </NuxtLink>

            <TemplateMenu />
        </template>

        <template #right>
            <UColorModeButton />

            <UButton
                to="https://github.com/nuxt-ui-templates/starter"
                target="_blank"
                icon="i-simple-icons-github"
                aria-label="GitHub"
                color="neutral"
                variant="ghost"
            />
        </template>
    </UHeader>
</template>
