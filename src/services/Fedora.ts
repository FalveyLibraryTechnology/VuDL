const http = require("needle");

class Fedora {
    baseUrl: string;

    constructor() {
        this.baseUrl = "http://vua6743.villanova.edu:8089/rest";
    }

    async getDC(pid) {
        let options = {
            username: "fedoraAdmin", // Basic Auth
            password: "fedoraAdmin"
        };
        try {
            let url = this.baseUrl + "/" + pid + "/DC";
            var res = await http("get", url, null, options);
            console.log("Fedora::then");
            return res.body;
        } catch (e) {
            console.log("edora::getDC failed", e);
        }
    }
}

export default Fedora;
