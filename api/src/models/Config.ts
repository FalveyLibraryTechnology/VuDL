import fs = require("fs");
import ini = require("ini");
import { FedoraModel } from "../services/FedoraCatalog";

type ConfigValue = string | string[] | ConfigRecord;
interface ConfigRecord {
    [key: string]: ConfigValue;
}

class Config {
    private static instance: Config;

    protected ini;

    constructor(ini: ConfigRecord) {
        this.ini = ini;
    }

    public static getInstance(): Config {
        if (!Config.instance) {
            const filename = __dirname.replace(/\\/g, "/") + "/../../vudl.ini";
            let config;
            try {
                config = ini.parse(fs.readFileSync(filename, "utf-8"));
            } catch (e) {
                console.warn(`Could not load ${filename}; defaulting to empty configuration.`);
                config = {};
            }
            // ini returns any, but we can cast it to what we need:
            Config.setInstance(new Config(config as Record<string, string>));
        }
        return Config.instance;
    }

    public static setInstance(config: Config): void {
        Config.instance = config;
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
        return this.ini["vufind_url"] ?? "";
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

    get dataModels(): Record<string, string> {
        return this.ini["data_models"];
    }

    get collectionModels(): Record<string, string> {
        return this.ini["collection_models"];
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

    get models(): Record<string, FedoraModel> {
        return this.ini["models"] || {};
    }

    get databaseSettings(): ConfigRecord {
        return this.ini["Database"] ?? {};
    }

    get databaseClient(): string {
        return (this.databaseSettings["client"] as string) ?? "sqlite3";
    }

    get databaseConnectionSettings(): ConfigRecord {
        return (this.databaseSettings["connection"] as ConfigRecord) ?? { filename: "./data/auth.sqlite3" };
    }
}

export default Config;
