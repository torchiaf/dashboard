import { EPINIO_APP_ENV_VAR_GIT } from '../types';
import startCase from 'lodash/startCase';

interface Repo {
  owner: any,
  description: string,
  // eslint-disable-next-line camelcase
  created_at: string,
  // eslint-disable-next-line camelcase
  updated_at: string,
  htmlUrl: string,
  name: string,
}

interface Commit {
  message: string,
  htmlUrl: string,
  sha?: string,
  commitId: string,
  author: object,
  isChecked: false,
  date: string
}

type Utils = Record<string, {
  application: {
    env: (data: object) => EPINIO_APP_ENV_VAR_GIT
  },
  normalize: {
    repo: (data: object) => Repo,
    commit: (data: object) => Commit
  }
}>

function getShortHash(commit: string) {
  return !!commit ? commit.slice(0, 7) : undefined;
}

function applicationEnv(data: any) {
  return {
    type:          toLabel(data.type),
    usernameOrOrg: data.usernameOrOrg as string,
    repo:          data.repo,
    branch:        data.branch,
  };
}

export function toLabel(type: string, options = { startCase: false }) {
  const res = type.replace('_', '');

  if (options?.startCase) {
    return startCase(res);
  }

  return res;
}

export const GitUtils: Utils = {
  github: {
    application: { env: applicationEnv },
    normalize:   {
      repo: (data: any) => ({
        owner: {
          name:      data.owner.login,
          htmlUrl:   data.owner.html_url,
          avatarUrl: data.owner.avatar_url
        },
        description: data.description,
        created_at:  data.created_at,
        updated_at:  data.updated_at,
        htmlUrl:     data.html_url,
        name:        data.name
      }),
      commit: (data: any) => ({
        message:  data.commit?.message,
        htmlUrl:  data.html_url,
        sha:      getShortHash(data.sha),
        commitId: data.sha,
        author:   {
          name:      data.author.login,
          avatarUrl: data.author.avatar_url,
          htmlUrl:   data.author.htmlUrl
        },
        isChecked: false,
        date:      data.commit?.committer.date
      }),
    },
  },
  gitlab: {
    application: { env: applicationEnv },
    normalize:   {
      repo: (data: any) => ({
        owner: {
          name:      data.namespace.name,
          htmlUrl:   data.namespace.web_url,
          avatarUrl: data.namespace.avatar_url
        },
        description: data.description,
        created_at:  data.created_at,
        updated_at:  data.last_activity_at,
        htmlUrl:     data.http_url_to_repo,
        name:        data.name
      }),
      commit: (data: any) => ({
        message:  data.message,
        htmlUrl:  data.web_url,
        sha:      data.short_id,
        commitId: data.id,
        author:   {
          name:      data.author_name,
          avatarUrl: data.avatar_url,
          htmlUrl:   data.web_url
        },
        isChecked: false,
        date:      data.committed_date
      }),
    },
  }
};
