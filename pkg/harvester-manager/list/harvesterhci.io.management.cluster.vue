<script>
import BrandImage from '@shell/components/BrandImage';
import TypeDescription from '@shell/components/TypeDescription';
import ResourceTable from '@shell/components/ResourceTable';
import Masthead from '@shell/components/ResourceList/Masthead';
import Loading from '@shell/components/Loading';
import { HARVESTER_NAME as VIRTUAL } from '@shell/config/features';
import { CAPI, HCI, MANAGEMENT } from '@shell/config/types';
import { isHarvesterCluster } from '@shell/utils/cluster';
import { allHash } from '@shell/utils/promise';
// import Vue2App from 'vue2App';

import { defineAsyncComponent } from 'vue';


export default {
  components: {
    BrandImage,
    ResourceTable,
    Masthead,
    TypeDescription,
    Loading,
    Vue2App: defineAsyncComponent(() => import('vue2App')),
  },

  props: {
    schema: {
      type:     Object,
      required: true,
    },
    useQueryParamsForSimpleFiltering: {
      type:    Boolean,
      default: false
    }
  },

  async fetch() {
    const inStore = this.$store.getters['currentProduct'].inStore;

    const hash = await allHash({
      hciClusters:  this.$store.dispatch(`${ inStore }/findAll`, { type: HCI.CLUSTER }),
      mgmtClusters: this.$store.dispatch(`${ inStore }/findAll`, { type: MANAGEMENT.CLUSTER })
    });

    this.hciClusters = hash.hciClusters;
    this.mgmtClusters = hash.mgmtClusters;
  },

  data() {
    const resource = CAPI.RANCHER_CLUSTER;

    return {
      navigating:   false,
      VIRTUAL,
      hciDashboard: HCI.DASHBOARD,
      resource,
      hResource:    HCI.CLUSTER,
      realSchema:   this.$store.getters['management/schemaFor'](CAPI.RANCHER_CLUSTER),
      hciClusters:  [],
      mgmtClusters: []
    };
  },

  computed: {
    importLocation() {
      return {
        name:   'c-cluster-product-resource-create',
        params: {
          product:  this.$store.getters['currentProduct'].name,
          resource: this.schema.id,
        },
      };
    },

    canCreateCluster() {
      const schema = this.$store.getters['management/schemaFor'](CAPI.RANCHER_CLUSTER);

      return !!schema?.collectionMethods.find((x) => x.toLowerCase() === 'post');
    },

    rows() {
      return this.hciClusters.filter((c) => {
        const cluster = this.mgmtClusters.find((cluster) => cluster?.metadata?.name === c?.status?.clusterName);

        return isHarvesterCluster(cluster);
      });
    },

    typeDisplay() {
      return this.t(`typeLabel."${ HCI.CLUSTER }"`, { count: this.row?.length || 0 });
    },
  },

  methods: {
    async goToCluster(row) {
      const timeout = setTimeout(() => {
        // Don't show loading indicator for quickly fetched plugins
        this.navigating = row.id;
      }, 1000);

      try {
        await row.goToCluster();

        clearTimeout(timeout);
        this.navigating = false;
      } catch {
        // The error handling is carried out within goToCluster, but just in case something happens before the promise chain can catch it...
        clearTimeout(timeout);
        this.navigating = false;
      }
    }
  }
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    
    <Vue2App />

    <iframe
        src='http://localhost:3002'
        title='Child Application'></iframe>

  </div>
</template>

<style lang="scss" scoped>
  .cluster-link {
    display: flex;
    align-items: center;

    .icon {
      // Use visibility to avoid the columns re-adjusting when the icon is shown
      visibility: hidden;

      &.navigating {
        visibility: visible;
      }
    }

  }
  .no-clusters {
    text-align: center;
  }

  .info-section {
    margin-top: 60px;
  }

  .logo {
    display: flex;
    justify-content: center;
    margin: 60px 0 40px 0;
  }

  .tagline {
    display: flex;
    justify-content: center;
    margin-top: 30px;

    > div {
      font-size: 16px;
      line-height: 22px;
      max-width: 80%;
      text-align: center;
    }
  }

 .link {
    cursor: pointer;
  }

</style>
