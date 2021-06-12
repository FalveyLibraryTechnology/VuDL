class PrivateConfig {
    protected ini;

    constructor(ini: Record<string, string>) {
        this.ini = ini;
    }

    get clientUrl(): string {
        return this.ini["client_url"];
    }

    get apiUrl(): string {
        // TODO: not used -- do we need this?
        return this.ini["api_url"];
    }

    get fedoraHostUrl(): string {
        // TODO: not used -- do we need this?
        return this.ini["fedora_host"];
    }

    get fedoraApiUrl(): string {
        // TODO: not used -- do we need this? How does it differ from restBaseUrl() below?
        return this.ini["fedora_api"];
    }

    get fedoraUsername(): string {
        return this.ini["fedora_username"];
    }

    get fedoraPassword(): string {
        return this.ini["fedora_password"];
    }

    get fedoraPidNameSpace(): string {
        return this.ini["fedora_pid_namespace"];
    }

    get solrQueryUrl(): string {
        return this.ini["solr_query_url"];
    }

    get ffmpegPath(): string {
        return this.ini["ffmpeg_path"];
    }

    get tesseractPath(): string {
        return this.ini["tesseract_path"];
    }

    get tesseractAllowedChars(): string {
        return this.ini["tesseract_allowed_characters"];
    }

    get vufindUrl(): string {
        return this.ini["vufind_url"];
    }

    get pdfDirectory(): string {
        return this.ini["pdf_directory"];
    }

    get textcleanerPath(): string {
        return this.ini["textcleaner_path"];
    }

    get textcleanerSwitches(): string {
        return this.ini["textcleaner_switches"];
    }

    get holdingArea(): string {
        return this.ini["holding_area_path"];
    }

    get ocrmypdfPath(): string {
        return this.ini["ocrmypdf_path"];
    }

    get processedAreaPath(): string {
        return this.ini["processed_area_path"];
    }

    get restBaseUrl(): string {
        return this.ini["base_url"];
    }

    get javaPath(): string {
        return this.ini["java_path"] ?? "java";
    }

    get tikaPath(): string {
        return this.ini["tika_path"];
    }

    get solrCore(): string {
        return this.ini["solr_core"] ?? "biblio";
    }

    get solrUrl(): string {
        return this.ini["solr_url"] ?? "http://localhost:8983/solr";
    }

    get requireLogin(): string {
        // TODO: do we need this, or will authentication be handled differently in future?
        return this.ini["require_login"];
    }

    get userWhitelist(): string {
        // TODO: do we need this, or will authentication be handled differently in future?
        return this.ini["user_whitelist"];
    }

    get allowedOrigins(): string[] {
        return this.ini["allowed_origins"];
    }
}

export default PrivateConfig;
