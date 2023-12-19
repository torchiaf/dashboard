<script>
import { Banner } from '@components/Banner';
import ArrayListGrouped from '@shell/components/form/ArrayListGrouped';
import MatchExpressions from '@shell/components/form/MatchExpressions';
import ArrayList from '@shell/components/form/ArrayList';
import { Checkbox } from '@components/Form/Checkbox';

export default {
  components: {
    Banner,
    ArrayListGrouped,
    MatchExpressions,
    ArrayList,
    Checkbox
  },

  props: {
    mode: {
      type:     String,
      required: true,
    },

    value: {
      type:     Object,
      required: true,
    },

    haveArgInfo: {
      type:     Boolean,
      required: true
    },

    selectedVersion: {
      type:     Object,
      required: true
    },

  },

  computed: {
    rkeConfig() {
      return this.value.spec.rkeConfig;
    },
    agentArgs() {
      return this.selectedVersion?.agentArgs || {};
    },
    canRemoveKubeletRow(row, idx) {
      return idx !== 0;
    },
    serverArgs() {
      return this.selectedVersion?.serverArgs || {};
    },
    serverConfig() {
      return this.value.spec.rkeConfig.machineGlobalConfig;
    },
    agentConfig() {
      return this.value.agentConfig;
    },
    advancedTitleAlt() {
      const machineSelectorLength = this.rkeConfig.machineSelectorConfig.length;

      return this.t('cluster.advanced.argInfo.machineSelector.titleAlt', { count: machineSelectorLength });
    },
    showAgentConfig() {
      return this.agentArgs['protect-kernel-defaults'] && Object.keys(this.agentConfig || {}).find((k) => k === 'protect-kernel-defaults');
    }
  },

  methods: {
    kubeletArgs(index) {
      if (!this.rkeConfig.machineSelectorConfig[index]) {
        return [];
      }

      if (!this.rkeConfig.machineSelectorConfig[index].config) {
        this.rkeConfig.machineSelectorConfig[index].config = {};
      }

      return this.rkeConfig.machineSelectorConfig[index].config['kubelet-arg'] || [];
    },
    updateKubeletArgs(index, args) {
      this.rkeConfig.machineSelectorConfig[index].config['kubelet-arg'] = args;
    },
  },
};
</script>

<template>
  <div>
    <template v-if="haveArgInfo">
      <h3>{{ t('cluster.advanced.argInfo.title') }}</h3>
      <ArrayListGrouped
        v-if="agentArgs['kubelet-arg']"
        v-model="rkeConfig.machineSelectorConfig"
        class="mb-20"
        :add-label="t('cluster.advanced.argInfo.machineSelector.label')"
        :can-remove="canRemoveKubeletRow"
        :default-add-value="{machineLabelSelector: { matchExpressions: [], matchLabels: {} }, config: {'kubelet-arg': []}}"
      >
        <template #default="{row, i}">
          <template v-if="row.value.machineLabelSelector">
            <h3>{{ t('cluster.advanced.argInfo.machineSelector.title') }}</h3>
            <MatchExpressions
              v-model="row.value.machineLabelSelector"
              class="mb-20"
              :mode="mode"
              :show-remove="false"
              :initial-empty-row="true"
            />
            <h3>{{ t('cluster.advanced.argInfo.machineSelector.subTitle') }}</h3>
          </template>
          <h3 v-else>
            {{ advancedTitleAlt }}
          </h3>

          <ArrayList
            :value="kubeletArgs(i)"
            :mode="mode"
            :add-label="t('cluster.advanced.argInfo.machineSelector.listLabel')"
            :initial-empty-row="!!row.value.machineLabelSelector"
            @input="updateKubeletArgs(i, $event)"
          />
        </template>
      </ArrayListGrouped>
      <Banner
        v-if="rkeConfig.machineSelectorConfig.length > 1"
        color="info"
        :label="t('cluster.advanced.argInfo.machineSelector.bannerLabel')"
      />

      <ArrayList
        v-if="serverArgs['kube-controller-manager-arg']"
        v-model="serverConfig['kube-controller-manager-arg']"
        :mode="mode"
        :title="t('cluster.advanced.argInfo.machineSelector.kubeControllerManagerTitle')"
        class="mb-20"
      />
      <ArrayList
        v-if="serverArgs['kube-apiserver-arg']"
        v-model="serverConfig['kube-apiserver-arg']"
        :mode="mode"
        :title="t('cluster.advanced.argInfo.machineSelector.kubeApiServerTitle')"
        class="mb-20"
      />
      <ArrayList
        v-if="serverArgs['kube-scheduler-arg']"
        v-model="serverConfig['kube-scheduler-arg']"
        :mode="mode"
        :title="t('cluster.advanced.argInfo.machineSelector.kubeSchedulerTitle')"
      />
    </template>
    <template v-if="showAgentConfig">
      <div class="spacer" />

      <div class="row">
        <div class="col span-12">
          <Checkbox
            v-model="agentConfig['protect-kernel-defaults']"
            :mode="mode"
            :label="t('cluster.advanced.agentArgs.label')"
          />
        </div>
      </div>
    </template>
  </div>
</template>
