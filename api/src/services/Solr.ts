const http = require("needle");

class Solr {
    baseUrl: string;

    constructor() {
        // TODO: make configurable
        this.baseUrl = "http://localhost:8983/solr";
    }

    /**
     * Make request to Solr
     */
    protected _request(
        method: string = "get",
        _path: string = "/",
        data: any = null,
        options: object = {}
    ): Promise<any> {
        let path = _path[0] == "/" ? _path.slice(1) : _path;
        let url = this.baseUrl + "/" + path;
        console.log(method, url, data);
        return http(method, url, data, options);
    }

    async indexRecord(core, _data) {
        let data = { add: { doc: _data } };
        return this._request(
            "post",
            core + "/update?commit=true",
            JSON.stringify(data),
            {
                headers: { 'Content-Type' : 'application/json'}
            }
        );
    }
}

export default Solr;
