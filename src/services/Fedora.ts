const http = require("needle");

class Fedora {
    baseUrl: string;

    constructor() {
        this.baseUrl = "http://vua6743.villanova.edu:8089/rest/";
    }

    async getDC(pid) {
        console.log("Fedora::getDC");
        var res = await http("get", this.baseUrl + pid + "/DC");
        // TODO: Error
        // TODO: Massage????
        console.log("Fedora::then");
        return res.body;
    }
}

export default Fedora;
