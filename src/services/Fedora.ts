const http = require("needle");

class Fedora {
    baseUrl: string;

    constructor() {
        this.baseUrl = "http://vua6743.villanova.edu:8089/rest";
    }

    async getDC(pid) {
        console.log("Fedora::getDC");
        let options = {
            username: "fedoraAdmin", // Basic Auth
            password: "fedoraAdmin"
        };
        try {
            let url = this.baseUrl + "/" + pid + "/DC";
            console.log(url, options);
            var res = await http("get", url, null, options);
            // TODO: Error
            // TODO: Massage????
            console.log("Fedora::then");
            return res.body;
        } catch (e) {
            console.log("that failed", e);
        }
    }
}

export default Fedora;
