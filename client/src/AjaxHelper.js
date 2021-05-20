import $ from "jquery";

class AjaxHelperInstance {
    constructor() {
        this.url = null;
        this._token = null;
    }

    get rootURL() {
        return this.url;
    }
    get logoutUrl() {
        return this.url + "/api/logout";
    }

    get token() {
        return this._token || "getFromCookies"; // TODO
    }
    set token(t) {
        this._token = t;
    }

    ajax(params) {
        params.beforeSend = function (xhr) {
            xhr.setRequestHeader("Authorization", "Token " + this.token);
        };
        $.ajax(params);
    }

    // TODO: Why does this one need url when getJobUrl and getImageUrl don't?
    getJSON(url = this.url, data, success) {
        this.ajax({
            dataType: "json",
            url: url,
            data: data,
            success: success,
        });
    }

    getJobUrl(category, job, extra) {
        return this.url + "/" + encodeURIComponent(category) + "/" + encodeURIComponent(job) + extra;
    }

    getImageUrl(category, job, filename, size) {
        return this.getJobUrl(category, job, "/" + encodeURIComponent(filename) + "/" + encodeURIComponent(size));
    }
}

class AjaxHelper {
    static instance;

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
