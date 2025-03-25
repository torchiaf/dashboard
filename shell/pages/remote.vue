<script>

const REMOTE_IFRAME = 'remote';
const REMOTE_IFRAME_CLASS = 'iframe-container';

export default {
  name:       'HarvesterRemoteIFrame',

  components: {
  },

  data() {
    return {
      src: 'https://localhost:8005/api/v1/namespaces/default/services/http:microfrontend:80/proxy/remote/harvester/c/c-m-hl6w427t/harvesterhci.io.dashboard#vm',
      iframe: null,
    };
  },

  mounted() {
    window.addEventListener('message', this.receiveMessage);
    this.init();
  },

  methods: {
    init() {
      const iframe = document.createElement('iframe');
      iframe.onload = this.onload;
      iframe.setAttribute('id', REMOTE_IFRAME);
      iframe.setAttribute('src', this.src);
      iframe.classList.add(REMOTE_IFRAME_CLASS);

      const frameParent = document.getElementById('iframe-parent');

      frameParent.appendChild(iframe);

      this.iframe = iframe;
    },

    onload(v) {
      console.log('--- REMOTE LOADED ---', v)
    },

    receiveMessage(event) {
      if (!this.iframe) {
        console.warn('iframe is not ready');
        return
      }

      const msg = event.data;

      if (msg.origin !== 'remote') {
        return;
      }


      switch (msg.action) {
        case 'ready':
          console.log('--- REMOTE msg ---', msg)
          this.iframe?.contentWindow?.postMessage({ action: 'show-header', value: false, origin: 'host' });
          break;
      
        default:
          break;
      }
    }
  },

  beforeUnmount() {
    // this.$store.dispatch('side-nav/show');
  },
};
</script>

<template>
  <div id="iframe-parent">
  </div>
</template>

<style lang="scss">
  .iframe-container {
    border: 0;
    left: calc($app-bar-collapsed-width);
    height: calc(100vh - var(--header-height));
    position: absolute;
    top: var(--header-height);
    width: calc(100vw - $app-bar-collapsed-width);
    visibility: show;
  }
</style>
