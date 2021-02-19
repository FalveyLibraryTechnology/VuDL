const http = require("needle");

interface Attributes {
    [key: string]: string;
}

interface DC_Child {
    name: string,
    value: string,
    attributes: Attributes,
    children: Array<DC_Child>,
}

interface DC {
    name: string,
    value: string,
    attributes: Attributes,
    children: Array<DC_Child>
}

class Fedora {
    baseUrl: string;

    constructor() {
        this.baseUrl = "http://vua6743.villanova.edu:8089/rest";
    }

    async getDC(pid): Promise<DC> {
        let options = {
            username: "fedoraAdmin", // Basic Auth
            password: "fedoraAdmin"
        };
        try {
            let url = this.baseUrl + "/" + pid + "/DC";
            let res = await http("get", url, null, options);
            return res.body;
        } catch (e) {
            console.log("Fedora::getDC failed", e);
        }
    }
}

export default Fedora;
