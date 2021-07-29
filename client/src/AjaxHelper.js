import $ from "jquery";

class AjaxHelperInstance {
    constructor() {
        this.url = null;
        this._token = sessionStorage.getItem("token") ?? null;
        // Bind
        this.handle4xx = this.handle4xx.bind(this);
    }

    get ingestApiUrl() {
        return this.url + "/api/ingest";
    }
    get loginUrl() {
        return this.ingestApiUrl + "/login";
    }
    get logoutUrl() {
        return this.ingestApiUrl + "/logout";
    }

    // TODO: Future-proof
    get testLoginAsChris() {
        console.warn("DEBUG LOGIN CODE BEING USED");
        return this.ingestApiUrl + "/user/confirm/V1StGXR8_Z5jdHi6B-myT";
    }

    isLoggedIn() {
        return this.token !== null;
    }

    get token() {
        return this._token || null; // TODO
    }
    set token(t) {
        sessionStorage.setItem("token", t);
        this._token = t;
    }

    addCredentials(params) {
        const credentials = {
            crossDomain: true,
            xhrFields: {
                withCredentials: true,
            },
        };

        // Add Token
        params.beforeSend = function (xhr) {
            xhr.setRequestHeader("Authorization", "Token " + this.token);
        }.bind(this);

        return Object.assign({}, params, credentials);
    }

    refreshToken() {
        if (!this.token) {
            $.ajax(
                this.addCredentials({
                    dataType: "json",
                    url: this.ingestApiUrl + "/token/mint",
                })
            )
                .done((token) => {
                    this.token = token;
                    if (this.prevAjaxParams) {
                        this.ajax(this.prevAjaxParams).done(() => {
                            this.prevAjaxParams = null;
                        });
                    }
                })
                .fail(() => {
                    window.location.href = this.loginUrl + "?referer=" + encodeURIComponent(window.location.href);
                });
        }
        return this.token;
    }

    handle4xx(res) {
        const { status } = res;
        // Unauthorized: Needs login
        if (status === 401) {
            this.refreshToken();
        }
        // Forbidden: Insufficient permissions
        if (status === 403) {
            // Pass
        }
    }

    ajax(params) {
        this.prevAjaxParams = params;
        return $.ajax(this.addCredentials(params)).catch(this.handle4xx);
    }

    getJSON(url = this.ingestApiUrl, data, success) {
        this.ajax({
            dataType: "json",
            url: url,
            data: data,
            success: success,
        });
    }

    getJobUrl(category, job, extra = "") {
        return this.ingestApiUrl + "/" + encodeURIComponent(category) + "/" + encodeURIComponent(job) + extra;
    }

    getImageUrl(category, job, filename, size) {
        return this.getJobUrl(category, job, "/" + encodeURIComponent(filename) + "/" + encodeURIComponent(size));
    }
}

class AjaxHelper {
    constructor() {
        throw new Error("Use AjaxHelper.getInstance()");
    }

    static getInstance() {
        if (!AjaxHelper.instance) {
            AjaxHelper.instance = new AjaxHelperInstance();
        }
        return AjaxHelper.instance;
    }
}

export default AjaxHelper;
