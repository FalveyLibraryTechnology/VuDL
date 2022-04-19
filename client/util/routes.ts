import config from "./config";

const baseUrl = config.API_SERVER_BASE_URL;
const apiUrl = `${baseUrl}/api`;
const authApiUrl = `${apiUrl}/auth`;
const ingestApiUrl = `${apiUrl}/ingest`;
const loginUrl = `${authApiUrl}/login`;
const logoutUrl = `${authApiUrl}/logout`;
const editObjectUrl = `${apiUrl}/edit/object`;
const newEditObjectUrl = `${editObjectUrl}/new`;
const datastreamsUrl = `${editObjectUrl}/datastreams`;
const editObjectCatalogUrl = `${apiUrl}/edit/catalog`;

const getJobUrl = (category: string, job: string, extra = ""): string => {
    return `${ingestApiUrl}/${encodeURIComponent(category)}/${encodeURIComponent(job)}${extra}`;
};
const getImageUrl = (category: string, job: string, filename: string, size: string): string => {
    return getJobUrl(category, job, `/${encodeURIComponent(filename)}/${encodeURIComponent(size)}`);
};

const getDerivUrl = (category: string, children: string): string => {
    return getJobUrl(category, children, "/derivatives");
};

const getIngestUrl = (category: string, children: string): string => {
    return getJobUrl(category, children, "/ingest");
};

const getStatusUrl = (category: string, children: string): string => {
    return getJobUrl(category, children, "/status");
};

const getObjectChildrenUrl = (pid: string): string => {
    return pid.length > 0 ? `${editObjectUrl}/${encodeURIComponent(pid)}/children` : `${apiUrl}/edit/treeTop`;
}

const getObjectDetailsUrl = (pid: string): string => {
    return `${editObjectUrl}/${encodeURIComponent(pid)}/details`;
}

const getObjectModelsDatastreamsUrl = (pid: string): string => {
    return `${editObjectUrl}/${encodeURIComponent(pid)}/modelsdatastreams`;
}

const getObjectParentsUrl = (pid: string): string => {
    return `${editObjectUrl}/${encodeURIComponent(pid)}/parents`;
}

const postObjectDatastreamUrl = (pid: string): string => {
    return `${editObjectUrl}/${encodeURIComponent(pid)}`;
}

const deleteObjectDatastreamUrl = (pid: string, datastream: string): string => {
    return `${editObjectUrl}/${encodeURIComponent(pid)}/datastream/${encodeURIComponent(datastream)}`;
}

const downloadObjectDatastreamUrl = (pid: string, datastream: string) => {
    return `${editObjectUrl}/${encodeURIComponent(pid)}/datastream/${encodeURIComponent(datastream)}/download`;
}

const getObjectDatastreamMetadataUrl = (pid: string, datastream: string) => {
    return `${editObjectUrl}/${encodeURIComponent(pid)}/datastream/${encodeURIComponent(datastream)}/metadata`;
}

export {
    baseUrl,
    apiUrl,
    authApiUrl,
    ingestApiUrl,
    loginUrl,
    logoutUrl,
    newEditObjectUrl,
    datastreamsUrl,
    editObjectCatalogUrl,
    getJobUrl,
    getImageUrl,
    getDerivUrl,
    getIngestUrl,
    getStatusUrl,
    getObjectChildrenUrl,
    getObjectDetailsUrl,
    getObjectModelsDatastreamsUrl,
    getObjectParentsUrl,
    postObjectDatastreamUrl,
    deleteObjectDatastreamUrl,
    downloadObjectDatastreamUrl,
    getObjectDatastreamMetadataUrl
};
