export const HARVESTER_EXTENSION = 'harvester';

export const HARVESTER_REPO = {
  type: 'catalog.cattle.io.clusterrepo',
  metadata: { 
    name: 'harvester',
  },
  spec: {
    clientSecret: null,
    gitRepo: 'https://github.com/harvester/harvester-ui-extension',
    gitBranch: 'gh-pages'
  }
};
