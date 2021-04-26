class PrivateConfig {
    constructor() {
        //this.message = 'I am an instance';
    }

    ini() {
        const fs = require('fs'), ini = require('ini');
        const config = ini.parse(fs.readFileSync(__dirname.replace(/\\/g, "/") + "/../../vudl.ini", 'utf-8'));
        return config;
    }

    fedoraHostUrl() {
        return this.ini()['fedora_host'];
    }

    fedoraApiUrl() {
        return this.ini()['fedora_api'];
    }

    fedoraUsername() {
        return this.ini()['fedora_username'];
    }

    fedoraPassword() {
        return this.ini()['fedora_password'];
    }

    fedoraPidNameSpace() {
        return this.ini()['fedora_pid_namespace'];
    }

    solrQueryUrl() {
        return this.ini()['solr_query_url'];
    }

    tesseractPath() {
        return this.ini()['tesseract_path'];
    }

    vufindUrl() {
        return this.ini()['vufind_url'];
    }

    pdfDirectory() {
        return this.ini()['pdf_directory'];
    }

    textcleanerPath() {
        return this.ini()['textcleaner_path'];
    }

    textcleanerSwitches() {
        return this.ini()['textcleaner_switches'];
    }

    holdingArea() {
        return this.ini()['holding_area_path'];
    }

    processedAreaPath() {
        return this.ini()['processed_area_path'];
    }

    restBaseUrl() {
        return this.ini()['base_url'];
    }

    requireLogin() {
        return this.ini()['require_login']
    }

    userWhitelist() {
        this.ini()['user_whitelist']
    }
}

export default PrivateConfig;