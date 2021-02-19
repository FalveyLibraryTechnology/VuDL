const http = require("needle");

class Fedora {
    baseUrl: string;

    constructor() {
        this.baseUrl = "http://vua6743.villanova.edu:8089/rest/";
    }

    getDC(pid) {
        console.log("Fedora::getDC");
        return new Promise((done, fail) => {
            http.get(
                this.baseUrl + pid + "/DC",
                function rawDC(err, res) {
                    // TODO: Error
                    // TODO: Massage????
                    console.log("Fedora::then");
                    done(res.body);
                }
            );
        });
    }
}

export default Fedora;
