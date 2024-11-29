<script>
import { mapGetters } from 'vuex';
import { isAdminUser } from '@shell/store/type-map';
import AsyncButton from '@shell/components/AsyncButton';
import BrandImage from '@shell/components/BrandImage';
import TypeDescription from '@shell/components/TypeDescription';
import ResourceTable from '@shell/components/ResourceTable';
import Masthead from '@shell/components/ResourceList/Masthead';
import Loading from '@shell/components/Loading';
import { HARVESTER_NAME as VIRTUAL } from '@shell/config/features';
import { CAPI, HCI, MANAGEMENT, CATALOG } from '@shell/config/types';
import { isHarvesterCluster } from '@shell/utils/cluster';
import { allHash } from '@shell/utils/promise';
import { NAME as APP_PRODUCT } from '@shell/config/product/apps';
import { BLANK_CLUSTER } from '@shell/store/store-types.js';
import { UI_PLUGIN_NAMESPACE } from '@shell/config/uiplugins';
import { HARVESTER_EXTENSION, HARVESTER_REPO } from '../types';
import { CATALOG as CATALOG_ANNOTATIONS } from '@shell/config/labels-annotations';

export default {
  components: {
    AsyncButton,
    BrandImage,
    ResourceTable,
    Masthead,
    TypeDescription,
    Loading
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

    const _hash = {
      hciClusters:  this.$store.dispatch(`${ inStore }/findAll`, { type: HCI.CLUSTER }),
      mgmtClusters: this.$store.dispatch(`${ inStore }/findAll`, { type: MANAGEMENT.CLUSTER }),
      catalogLoad:  this.$store.dispatch('catalog/load', { reset: true }),
    };

    if (this.$store.getters[`${ inStore }/schemaFor`](CATALOG.CLUSTER_REPO)) {
      _hash.clusterrepos = this.$store.dispatch(`${ inStore }/findAll`, { type: CATALOG.CLUSTER_REPO, force: true });
    }

    const hash = await allHash(_hash);

    this.hciClusters = hash.hciClusters;
    this.mgmtClusters = hash.mgmtClusters;
  },

  data() {
    const resource = CAPI.RANCHER_CLUSTER;

    return {
      isAdmin:         isAdminUser(this.$store.getters),
      navigating:      false,
      VIRTUAL,
      hciDashboard:    HCI.DASHBOARD,
      resource,
      hResource:       HCI.CLUSTER,
      realSchema:      this.$store.getters['management/schemaFor'](CAPI.RANCHER_CLUSTER),
      hciClusters:     [],
      mgmtClusters:    [],
      clusterRepoLink: {
        name:   'c-cluster-product-resource',
        params: {
          cluster:  'local',
          product:  APP_PRODUCT,
          resource: CATALOG.CLUSTER_REPO
        }
      },
      extensionsLink: {
        name:   'c-cluster-uiplugins',
        params: { cluster: BLANK_CLUSTER }
      },
    };
  },

  computed: {
    ...mapGetters({ uiplugins: 'uiplugins/plugins' }),

    clusterrepos() {
      const inStore = this.$store.getters['currentProduct'].inStore;

      return this.$store.getters[`${ inStore }/all`](CATALOG.CLUSTER_REPO);
    },

    harvesterRepo() {
      const repository = this.clusterrepos?.find((c) => c.spec?.gitRepo === HARVESTER_REPO.spec.gitRepo && c.spec?.gitBranch === HARVESTER_REPO.spec.gitBranch);
    
      if (repository?.state === 'active') {
        return repository;
      }

      return null;
    },

    charts() {
      return this.$store.getters['catalog/rawCharts'];
    },

    harvesterExtension() {
      return this.uiplugins?.find((c) => c.name === HARVESTER_EXTENSION);
    },

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
    async installHarvesterExtension(btnCb) {

      // Create repo
      try {
        if (!this.harvesterRepo) {
          const repository = await this.$store.dispatch('management/create', HARVESTER_REPO, { root: true });

          await repository.save();
        } else {
          await this.harvesterRepo.refresh();
        }
      } catch (error) {
        btnCb(false);
      }

      const harvesterChart = {
        chartName:   'harvester',
        version:     '1.0.0',
        releaseName: 'harvester',
        annotations: {
          [CATALOG_ANNOTATIONS.SOURCE_REPO_TYPE]: 'cluster',
          [CATALOG_ANNOTATIONS.SOURCE_REPO_NAME]: 'harvester'
        },
        values: {}
      };

      if (!this.harvesterExtension) {
        const input = {
          charts:    [harvesterChart],
          namespace: UI_PLUGIN_NAMESPACE,
        };

        const action = 'install';

        try {
          console.log('--- intall ---', action, input)

          const res = await repository.doAction(action, input);
          const operationId = `${ res.operationNamespace }/${ res.operationName }`;

          await repository.waitForOperation(operationId);

          await this.$store.dispatch(`management/find`, {
            type: CATALOG.OPERATION,
            id:   operationId
          });
        } catch (e) {
          this.$store.dispatch('growl/error', {
            title:   this.t('plugins.error.generic'),
            message: e.message ? e.message : e,
            timeout: 10000
          }, { root: true });
        }
      }


      // // Create extension
      // const app = await this.$store.dispatch('management/findAll', {
      //   type: CATALOG.APP,
      //   // id:   `${ UI_PLUGIN_NAMESPACE }/${ 'harvester' }`,
      //   // opt:  { force: true },
      // });


      

      console.log(this.harvesterRepo, app, this.uiplugins,  this.charts) // should wait until not in progress

      btnCb(true);
    },

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
    <div v-if="!!harvesterExtension">
      <Masthead
        :schema="realSchema"
        :resource="resource"
        :is-creatable="false"
        :type-display="typeDisplay"
      >
        <template #typeDescription>
          <TypeDescription :resource="hResource" />
        </template>

        <template
          v-if="canCreateCluster"
          #extraActions
        >
          <router-link
            :to="importLocation"
            class="btn role-primary"
          >
            {{ t('cluster.importAction') }}
          </router-link>
        </template>
      </Masthead>
      <ResourceTable
        v-if="rows && rows.length"
        :schema="schema"
        :rows="rows"
        :is-creatable="true"
        :namespaced="false"
        :use-query-params-for-simple-filtering="useQueryParamsForSimpleFiltering"
      >
        <template #col:name="{row}">
          <td>
            <span class="cluster-link">
              <a
                v-if="row.isReady"
                class="link"
                :disabled="navigating ? true : null"
                @click="goToCluster(row)"
              >{{ row.nameDisplay }}</a>
              <span v-else>
                {{ row.nameDisplay }}
              </span>
              <i
                class="icon icon-spinner icon-spin ml-5"
                :class="{'navigating': navigating === row.id}"
              />
            </span>
          </td>
        </template>

        <template #cell:harvester="{row}">
          <router-link
            class="btn btn-sm role-primary"
            :to="row.detailLocation"
          >
            {{ t('harvesterManager.manage') }}
          </router-link>
        </template>
      </ResourceTable>
      <div v-else>
        <div class="no-clusters">
          {{ t('harvesterManager.cluster.none') }}
        </div>
        <hr class="info-section">
      </div>
    </div>
    <template v-if="!harvesterExtension || !rows || !rows.length">
      <div class="logo">
        <BrandImage
          file-name="harvester.png"
          height="64"
        />
      </div>
      <div class="tagline">
        <div>{{ t('harvesterManager.cluster.description') }}</div>
      </div>
      <div class="tagline">
        <div v-clean-html="t('harvesterManager.cluster.learnMore', {}, true)" />
      </div>
      <template v-if="!harvesterExtension">
        <div class="tagline extension-warning-panel">
          <div class="extensions-separator"></div>
          <div
            v-clean-html="t('harvesterManager.extension.install.warning', {}, true)"
            class="extension-warning"
          />
          <div class="tagline">
            <div
              v-clean-html="t('harvesterManager.extension.install.prompt', {}, true)"
              class="extension-prompt"
            />
          </div>
        </div>
        <div
          v-if="isAdmin"
          class="extension-info"
        >
          <AsyncButton
            mode="apply"
            @click="installHarvesterExtension"
          />
        </div>
        <div
          v-else
          class="tagline"
        >
          <div v-clean-html="t('harvesterManager.extension.install.admin', {}, true)" />
        </div>
      </template>
    </template>
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

  .extensions-separator {
    border: 1px solid var(--border);
    margin-bottom: 20px;
    width: 50%;
  }

  .extension-warning-panel {
    align-items: center;
    flex-direction: column;
  }

  .extension-warning {
    font-size: 24px !important;
    font-weight: 400;
  }

  .extension-info {
    display: flex;
    justify-content: center;

    .steps {
      > li {
        margin-top: 5px;
        font-size: 14px;
      }
    }
  }

 .link {
    cursor: pointer;
  }

</style>
