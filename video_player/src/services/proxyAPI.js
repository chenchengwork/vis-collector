import EnumEnv from 'constants/EnumEnv';
const apiPrefix = EnumEnv.apiPrefix || '/';

export const proxyAPI = (api) => apiPrefix.replace(/\/$/, "") + "/" + api.replace(/^\//, "");

