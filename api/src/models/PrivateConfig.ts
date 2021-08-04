class PrivateConfig {
    protected ini;

    constructor(ini: Record<string, string>) {
        this.ini = ini;
    }

    get clientUrl(): string {
        return this.ini["client_url"];
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

    get ffmpegPath(): string {
        return this.ini["ffmpeg_path"];
    }

    get fitsCommand(): string {
        return this.ini["fits_command"];
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
        const holdingArea = this.ini["holding_area_path"];
        return holdingArea.endsWith("/") ? holdingArea : holdingArea + "/";
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

    get allowedOrigins(): string[] {
        return this.ini["allowed_origins"];
    }

    get pidNamespace(): string {
        return this.ini["fedora_pid_namespace"] ?? "vudl";
    }

    get initialPidValue(): number {
        return parseInt(this.ini["fedora_initial_pid"] ?? "1");
    }

    get institution(): string {
        return this.ini["institution"] ?? "My University";
    }

    get collection(): string {
        return this.ini["collection"] ?? "Digital Library";
    }

    get topLevelPids(): Array<string> {
        return this.ini["top_level_pids"] ?? [];
    }

    get articlesToStrip(): Array<string> {
        return this.ini["articles_to_strip"] ?? [];
    }

    get languageMap(): Record<string, string> {
        return this.ini["LanguageMap"] ?? {};
    }

    get minimumValidYear(): number {
        return parseInt(this.ini["minimum_valid_year"] ?? 1000);
    }
}

export default PrivateConfig;
