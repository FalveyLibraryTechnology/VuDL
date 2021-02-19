import Fedora from './Fedora';

class SolrIndexer {
    fedora: Fedora;

    constructor() {
        // TODO: Config
        // Make Fedora connection
        this.fedora = new Fedora();
    }

    async getFields(pid: string) {
        // Use Fedora to get data
        // TODO: type
        let dc = await this.fedora.getDC(pid);

        // Massage data
        let fields: any = {};
        for (let field of dc.children) {
            // TODO: Abstract to key-value map
            if (field.name == "dc:title") {
                fields.title = field.value;
            }
            if (field.name == "dc:identifier") {
                fields.id = field.value;
            }
        }

        return fields;
    }
}

export default SolrIndexer;