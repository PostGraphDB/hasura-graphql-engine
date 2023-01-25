import { useQuery } from 'react-query';
import { isCloudConsole } from '@/utils/cloudConsole';
import globals from '@/Globals';
import { cloudDataServiceApiClient } from '@/hooks/cloudDataServiceApiClient';
import { isArray } from '@/components/Common/utils/jsUtils';

// TODO: These types should be replaced by autogenerated types, when we use typescript graphql codegen
type NeonProjectsByProjectIdResponseData = {
  data: {
    neon_db_integration: NeonDBIntegrationOptions[];
  };
};

type NeonDBIntegrationOptions = {
  env_var: string | null;
  id: string;
  neon_project_id: string;
};

const FETCH_NEON_PROJECTS_BY_PROJECTID = `
query fetchNeonProjectsByProjectId ($hasura_cloud_project_id: uuid) {
    neon_db_integration(where: {hasura_cloud_project_id: {_eq: $hasura_cloud_project_id}}) {
      env_var
      id
      neon_project_id
    }
  }  
`;

const FETCH_NEON_PROJECTS_BY_PROJECTID_VARIABLES = {
  hasura_cloud_project_id: globals.hasuraCloudProjectId,
};

export const FETCH_NEON_PROJECTS_BY_PROJECTID_QUERYKEY =
  'FETCH_NEON_PROJECTS_BY_PROJECTID_QUERYKEY' as const;

const fetchNeonProjectsByProjectIdQueryFn = () => {
  // cloud uses cookie-based auth, so does not require an admin secret
  const headers = {
    'content-type': 'application/json',
  };
  return cloudDataServiceApiClient<NeonProjectsByProjectIdResponseData>(
    FETCH_NEON_PROJECTS_BY_PROJECTID,
    FETCH_NEON_PROJECTS_BY_PROJECTID_VARIABLES,
    headers
  );
};

// A stale time of 5 minutes for use in useQuery hook
const staleTime = 5 * 60 * 1000;

export const useShowNeonDashboardLink = () => {
  const isCloudEnv = !!isCloudConsole(globals);

  const { data } = useQuery(
    FETCH_NEON_PROJECTS_BY_PROJECTID_QUERYKEY,
    fetchNeonProjectsByProjectIdQueryFn,
    {
      // don't run the query if current environment is not cloud console
      enabled: isCloudEnv,
      staleTime,
    }
  );

  if (
    isCloudEnv &&
    data &&
    isArray(data.data?.neon_db_integration) &&
    data.data?.neon_db_integration.length > 0
  ) {
    return true;
  }
  return false;
};
