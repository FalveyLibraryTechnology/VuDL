import config from "./config";

const baseUrl = config.API_SERVER_BASE_URL;
const apiUrl = `${baseUrl}/api`;
const authApiUrl = `${apiUrl}/auth`;
const ingestApiUrl = `${apiUrl}/ingest`;
const loginUrl = `${authApiUrl}/login`;
const logoutUrl = `${authApiUrl}/logout`;
const getJobUrl = (category, job, extra = "") => {
    return `${ingestApiUrl}/${encodeURIComponent(category)}/${encodeURIComponent(job)}${extra}`;
};
const getImageUrl = (category, job, filename, size) => {
    return getJobUrl(category, job, `/${encodeURIComponent(filename)}/${encodeURIComponent(size)}`);
};

const getDerivUrl = (category, children) => {
    return getJobUrl(category, children, "/derivatives");
};

const getIngestUrl = (category, children) => {
    return getJobUrl(category, children, "/ingest");
};

const getStatusUrl = (category, children) => {
    return getJobUrl(category, children, "/status");
};

export {
    baseUrl,
    apiUrl,
    authApiUrl,
    ingestApiUrl,
    loginUrl,
    logoutUrl,
    getJobUrl,
    getImageUrl,
    getDerivUrl,
    getIngestUrl,
    getStatusUrl,
};
