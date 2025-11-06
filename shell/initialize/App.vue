<script>
import { watch } from 'vue';

import NuxtLoading from '@shell/components/nav/GlobalLoading.vue';
import WindowManager from '@shell/components/nav/WindowManager/index.vue';

import '@shell/assets/styles/app.scss';

export default {
  components: {
    WindowManager,
    NuxtLoading
  },

  data: () => ({
    isOnline: true,
    windowManagerContainerReady: false,
    unwatch: null,
  }),

  created() {
    // add to window so we can listen when ready
    window.$globalApp = this;

    // This is needed for Harvester https://github.com/rancher/dashboard/issues/10681
    const isHarvester = this.$globalApp?.$store.getters['currentCluster']?.isHarvester;

    if (!isHarvester) {
      Object.defineProperty(window, '$nuxt', {
        get() {
          console.warn('window.$nuxt is deprecated. It would be best to stop using globalState all together. For an alternative you can use window.$globalApp.'); // eslint-disable-line no-console

          return window.$globalApp;
        }
      });
    }

    this.refreshOnlineStatus();
    // Setup the listeners
    window.addEventListener('online', this.refreshOnlineStatus);
    window.addEventListener('offline', this.refreshOnlineStatus);

    // Add $nuxt.context
    this.context = this.$options.context;
  },

  mounted() {
    this.$loading = this.$refs.loading;

    // setTimeout(() => {
    //   this.windowManagerContainerReady = true;
    // }, 3000);

    this.unwatch = watch(
      () => this.$loading,
      (newVal) => {
        console.log('------ Loading state changed:', newVal.state.pending); // eslint-disable-line no-console
        if (!newVal.state.pending) {
          this.windowManagerContainerReady = true;
          // this.unwatch(); // stop watching after first load complete
        }
      },
      { immediate: true }
    );
  },

  computed: {
    isOffline() {
      return !this.isOnline;
    },
  },

  methods: {
    refreshOnlineStatus() {
      if (typeof window.navigator.onLine === 'undefined') {
        // If the browser doesn't support connection status reports
        // assume that we are online because most apps' only react
        // when they now that the connection has been interrupted
        this.isOnline = true;
      } else {
        this.isOnline = window.navigator.onLine;
      }
    },
  },
};
</script>
<template>
  <div id="__nuxt">
    <NuxtLoading ref="loading" />
    <div
      id="__layout"
    >
      <router-view />
      <WindowManager v-if="windowManagerContainerReady" />
    </div>
  </div>
</template>
