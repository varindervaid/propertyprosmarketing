<script setup>
import { useLayout } from '@/layout/composables/layout';
import AppConfigurator from '@/layout/AppConfigurator.vue';
const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <span>Affilate Customer Portal</span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <router-link to="/profile" class="layout-config-menu"
                :class="{ 'active-link': $route.path === '/profile' }">
                <button type="button" class="layout-topbar-action">
                    <i class="pi pi-user"></i>
                </button>
            </router-link>
        </div>
    </div>
</template>

<style scoped>
.active-link {
    background-color: #10b981;
    border-radius: 50px; /* Optional: for better UI */
}

.active-link button i{
    color: #ffffff;
}

</style>
