class PrivateConfig {
    protected ini;

    constructor(ini: Record<string, string>) {
        this.ini = ini;
    }

    fedoraHostUrl(): string {
        return this.ini["fedora_host"];
    }

    fedoraApiUrl(): string {
        return this.ini["fedora_api"];
    }

    fedoraUsername(): string {
        return this.ini["fedora_username"];
    }

    fedoraPassword(): string {
        return this.ini["fedora_password"];
    }

    fedoraPidNameSpace(): string {
        return this.ini["fedora_pid_namespace"];
    }

    solrQueryUrl(): string {
        return this.ini["solr_query_url"];
    }

    tesseractPath(): string {
        return this.ini["tesseract_path"];
    }

    vufindUrl(): string {
        return this.ini["vufind_url"];
    }

    pdfDirectory(): string {
        return this.ini["pdf_directory"];
    }

    textcleanerPath(): string {
        return this.ini["textcleaner_path"];
    }

    textcleanerSwitches(): string {
        return this.ini["textcleaner_switches"];
    }

    holdingArea(): string {
        return this.ini["holding_area_path"];
    }

    processedAreaPath(): string {
        return this.ini["processed_area_path"];
    }

    restBaseUrl(): string {
        return this.ini["base_url"];
    }

    requireLogin(): string {
        return this.ini["require_login"];
    }

    userWhitelist(): string {
        return this.ini["user_whitelist"];
    }
}

export default PrivateConfig;
