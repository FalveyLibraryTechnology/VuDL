import Config from "../models/Config";
import DateSanitizer from "./DateSanitizer";
import Fedora from "./Fedora";
import FedoraData from "../models/FedoraData";
import HierarchyCollector from "./HierarchyCollector";
import http = require("needle");

interface SolrFields {
    [key: string]: string | Array<string>;
}

class SolrIndexer {
    hierarchyCollector: HierarchyCollector;
    // TODO: make configurable
    institution = "Villanova University";
    collection = "Digital Library";

    constructor() {
        // Make Fedora connection
        const fedora = new Fedora();
        // TODO: make configurable
        const topPids = ["vudl:1", "vudl:3"];
        this.hierarchyCollector = new HierarchyCollector(fedora, topPids);
    }

    protected padNumber(num: string): string {
        // Yes, I wrote a left_pad function.
        const paddedNumber = "0000000000" + num;
        return paddedNumber.substr(paddedNumber.length - 10);
    }

    protected getLanguageMap(): Record<string, string> {
        // TODO: make configurable
        return {
            ab: "Abkhazian",
            af: "Afrikaans",
            an: "Aragonese",
            ar: "Arabic",
            as: "Assamese",
            az: "Azerbaijani",
            be: "Belarusian",
            bg: "Bulgarian",
            bn: "Bengali",
            bo: "Tibetan",
            br: "Breton",
            bs: "Bosnian",
            ca: "Catalan / Valencian",
            ce: "Chechen",
            co: "Corsican",
            cs: "Czech",
            cu: "Church Slavic",
            cy: "Welsh",
            da: "Danish",
            de: "German",
            el: "Greek",
            en: "English",
            eo: "Esperanto",
            es: "Spanish / Castilian",
            et: "Estonian",
            eu: "Basque",
            fa: "Persian",
            fi: "Finnish",
            fj: "Fijian",
            fo: "Faroese",
            fr: "French",
            fy: "Western Frisian",
            ga: "Irish",
            gd: "Gaelic / Scottish Gaelic",
            gl: "Galician",
            grc: "Ancient Greek",
            gv: "Manx",
            he: "Hebrew",
            hi: "Hindi",
            hr: "Croatian",
            ht: "Haitian; Haitian Creole",
            hu: "Hungarian",
            hy: "Armenian",
            id: "Indonesian",
            is: "Icelandic",
            it: "Italian",
            ja: "Japanese",
            jv: "Javanese",
            ka: "Georgian",
            kg: "Kongo",
            ko: "Korean",
            ku: "Kurdish",
            kw: "Cornish",
            ky: "Kirghiz",
            la: "Latin",
            lb: "Luxembourgish; Letzeburgesch",
            li: "Limburgan; Limburger; Limburgish",
            ln: "Lingala",
            lt: "Lithuanian",
            lv: "Latvian",
            mg: "Malagasy",
            mk: "Macedonian",
            mn: "Mongolian",
            mo: "Moldavian",
            ms: "Malay",
            mt: "Maltese",
            my: "Burmese",
            nb: "Norwegian (Bokmål)",
            ne: "Nepali",
            nl: "Dutch",
            nn: "Norwegian (Nynorsk)",
            no: "Norwegian",
            oc: "Occitan (post 1500); Provençal",
            pl: "Polish",
            pt: "Portuguese",
            rm: "Raeto-Romance",
            ro: "Romanian",
            ru: "Russian",
            sc: "Sardinian",
            se: "Northern Sami",
            sk: "Slovak",
            sl: "Slovenian",
            so: "Somali",
            sq: "Albanian",
            sr: "Serbian",
            sv: "Swedish",
            sw: "Swahili",
            tk: "Turkmen",
            tr: "Turkish",
            ty: "Tahitian",
            uk: "Ukrainian",
            ur: "Urdu",
            uz: "Uzbek",
            vi: "Vietnamese",
            vo: "Volapuk",
            yi: "Yiddish",
            zh: "Chinese",
            "pt-BR": "Portuguese (Brazilian)",
        };
    }

    protected async getChangeTrackerDetails(pid: string, modificationDate: string): Promise<Record<string, string>> {
        const core = Config.getInstance().solrCore;
        const url = Config.getInstance().vufindUrl + "/XSLT/Home?";
        const query =
            "method[]=getLastIndexed&method[]=getFirstIndexed&id=" +
            encodeURIComponent(pid) +
            "&core=" +
            encodeURIComponent(core) +
            "&date=" +
            encodeURIComponent(modificationDate);
        const response = (await http("get", url + query)).body;
        if (
            typeof response.results.getFirstIndexed !== "string" ||
            typeof response.results.getLastIndexed !== "string"
        ) {
            throw new Error("Unexpected change tracker response.");
        }
        return response.results;
    }

    async getFields(pid: string): Promise<SolrFields> {
        // Collect hierarchy data
        const fedoraData = await this.hierarchyCollector.getHierarchy(pid);

        // Start with basic data:
        const fields: SolrFields = {
            id: pid,
            record_format: "vudl",
            institution: this.institution,
            collection: this.collection,
            modeltype_str_mv: fedoraData.models,
            datastream_str_mv: fedoraData.fedoraDatastreams,
            hierarchytype: "",
            hierarchy_all_parents_str_mv: fedoraData.getAllParents(),
        };

        // Load RELS-EXT data (some of this is used below):
        for (const field in fedoraData.relations) {
            const fieldName = "relsext." + field + "_txt_mv";
            fields[fieldName] = fedoraData.relations[field];
        }

        // Is this a hierarchy?
        if (fedoraData.models.includes("vudl-system:FolderCollection")) {
            fields.is_hierarchy_id = fedoraData.pid;
            fields.is_hierarchy_title = fedoraData.title;
        }

        // Add sequence/order data:
        const sequenceIndex = {};
        for (const sequence of fedoraData.sequences) {
            const [seqPid, seqNum] = sequence.split("#", 2);
            sequenceIndex[seqPid] = seqNum;
            const sequence_str = seqPid.replace(":", "_");
            const dynamic_sequence_field_name = "sequence_" + sequence_str + "_str";
            fields[dynamic_sequence_field_name] = this.padNumber(seqNum);
        }

        // Process parent data:
        const hierarchyParents: Array<FedoraData> = [];
        const hierarchySequences: Array<string> = [];
        for (const parent of fedoraData.parents) {
            // If the object is a Data, the parentPID is the Resource it belongs
            // to (skip the List object):
            if (fedoraData.models.includes("vudl-system:DataModel")) {
                for (const grandParent of parent.parents) {
                    hierarchyParents.push(grandParent);
                    hierarchySequences.push(this.padNumber(sequenceIndex[grandParent.pid] ?? 0));
                }
            } else {
                // ...else it is the immediate parent (Folder most likely):
                hierarchyParents.push(parent);
                hierarchySequences.push(this.padNumber(sequenceIndex[parent.pid] ?? 0));
            }
        }
        const hierarchyTops: Array<FedoraData> = fedoraData.getAllHierarchyTops();
        if (hierarchyTops.length > 0) {
            fields.hierarchy_top_id = [];
            fields.hierarchy_top_title = [];
            for (const top of hierarchyTops) {
                if (!fields.hierarchy_top_id.includes(top.pid)) {
                    fields.hierarchy_top_id.push(top.pid);
                    fields.hierarchy_top_title.push(top.title);
                }
            }
        }
        if (hierarchyParents.length > 0) {
            // This is what we are collapsing on:
            fields.hierarchy_first_parent_id_str = fedoraData.models.includes("vudl-system:DataModel")
                ? hierarchyParents[0].pid
                : pid;
            fields.hierarchy_browse = [];
            fields.hierarchy_parent_id = [];
            fields.hierarchy_parent_title = [];
            for (const parent of hierarchyParents) {
                if (!fields.hierarchy_parent_id.includes(parent.pid)) {
                    fields.hierarchy_browse.push(parent.title + "{{{_ID_}}}" + parent.pid);
                    fields.hierarchy_parent_id.push(parent.pid);
                    fields.hierarchy_parent_title.push(parent.title);
                }
            }
        } else {
            // If no parents, we still need to include the current object as
            // its own parent for field-collapsing purposes, and we can figure
            // out which top-level container is in play using RELS data.
            fields.hierarchy_first_parent_id_str = pid;
            if (typeof fields["relsext.isMemberOf_txt_mv"] !== "undefined") {
                fields.hierarchy_parent_id = (fields["relsext.isMemberOf_txt_mv"] as Array<string>).map((id) => {
                    return id.split("/").pop();
                });
            }
            fields.hierarchy_sequence = this.padNumber("0");
            // We don't have easy access to parent titles in this case, so we have
            // to look them up manually in Fedora. Perhaps this can be optimized or
            // simplified somehow...
            const titlePromises = ((fields.hierarchy_parent_id ?? []) as Array<string>).map(async (id) => {
                const currentObject = await this.hierarchyCollector.getFedoraData(id, false);
                return currentObject.title;
            });
            fields.hierarchy_parent_title = await Promise.all(titlePromises);
        }
        if (hierarchySequences.length > 0) {
            fields.hierarchy_sequence_sort_str = hierarchySequences[0] ?? this.padNumber("0");
            fields.hierarchy_sequence = hierarchySequences;
        }

        // Load all the Dublin Core data into dynamic fields AND allfields:
        fields.allfields = [];
        for (const field in fedoraData.metadata) {
            const fieldName = field.replace(":", ".") + "_txt_mv";
            fields[fieldName] = fedoraData.metadata[field];
            fields.allfields = fields.allfields.concat(fedoraData.metadata[field]);
        }

        // This map copies existing values as-is to other fields:
        const copyFields = {
            author: "dc.creator_txt_mv",
            author2: "dc.contributor_txt_mv",
            dc_collection_str_mv: "dc.collection_txt_mv", // possibly unused
            dc_source_str_mv: "dc.source_txt_mv",
            description: "dc.description_txt_mv",
            format: "dc.format_txt_mv",
            publisher: "dc.publisher_txt_mv",
            publisher_str_mv: "dc.publisher_txt_mv",
            series: "dc.relation_txt_mv",
            topic: "dc.subject_txt_mv",
            topic_facet: "dc.subject_txt_mv",
            topic_str_mv: "dc.subject_txt_mv",
        };
        for (const field in copyFields) {
            if (typeof fields[copyFields[field]] !== "undefined") {
                fields[field] = fields[copyFields[field]];
            }
        }

        // This map copies the first value from existing fields to
        // new fields:
        const firstOnlyFields = {
            author_sort: "dc.creator_txt_mv",
            dc_date_str: "dc.date_txt_mv",
            dc_relation_str: "dc.relation_txt_mv",
            dc_title_str: "dc.title_txt_mv",
            title: "dc.title_txt_mv",
            title_full: "dc.title_txt_mv",
            title_short: "dc.title_txt_mv",
            title_sort: "dc.title_txt_mv",
        };
        for (const field in firstOnlyFields) {
            if (typeof fields[firstOnlyFields[field]] !== "undefined") {
                fields[field] = fields[firstOnlyFields[field]][0];
            }
        }

        // This map copies all values AFTER the first to new fields:
        const secondaryValueFields = {
            title_alt: "dc.title_txt_mv",
        };
        for (const field in secondaryValueFields) {
            if (
                typeof fields[secondaryValueFields[field]] !== "undefined" &&
                fields[secondaryValueFields[field]].length > 1
            ) {
                fields[field] = fields[secondaryValueFields[field]].slice(1);
            }
        }

        // If this is a data model, we want to pull the date from its parent.
        const dateString = fedoraData.models.includes("vudl-system:DataModel")
            ? (hierarchyParents[0].metadata["dc:date"] ?? [])[0] ?? ""
            : (fields["dc.date_txt_mv"] ?? [])[0] ?? "";
        const strippedDate = dateString.substr(0, 4);
        // TODO: configurable date cut-off?
        if (parseInt(strippedDate) > 1000) {
            fields.publishDate = strippedDate;
            fields.publishDateSort = strippedDate;
            fields.normalized_sort_date = DateSanitizer.sanitize(dateString);
        }

        if (typeof fields["dc.language_txt_mv"] !== "undefined") {
            fields.language = (fields["dc.language_txt_mv"] as Array<string>).map((lang) => {
                return this.getLanguageMap()[lang] ?? lang;
            });
        }

        if (typeof fields["title"] !== "undefined") {
            // TODO: configurable article list:
            const articles = ["a ", "an ", "the "];
            let sortTitle = (fields["title"] as string).toLowerCase();
            for (const article of articles) {
                if (sortTitle.substr(0, article.length) === article) {
                    sortTitle = sortTitle.substr(article.length);
                    break;
                }
            }
            fields.title_sort = sortTitle.trim();
            if (!fedoraData.models.includes("vudl-system:DataModel")) {
                fields.collection_title_sort_str = fields.title_sort;
            }
        }

        fields.has_order_str = ((fields["relsext.sortOn_txt_mv"] ?? [])[0] ?? "title") === "custom" ? "yes" : "no";

        for (const field in fedoraData.fedoraDetails) {
            const fieldName = "fgs." + field + "_txt_mv";
            fields[fieldName] = fedoraData.fedoraDetails[field];
        }

        for (const field in fedoraData.agents) {
            const fieldName = "agent." + field + "_txt_mv";
            fields[fieldName] = fedoraData.agents[field];
        }

        if (fedoraData.license !== null) {
            fields["license.mdRef_str"] = fedoraData.license;
        }
        if ((fields["license.mdRef_str"] ?? null) === "http://digital.library.villanova.edu/copyright.html") {
            fields.license_str = "protected";
        }
        fields.has_thumbnail_str = fedoraData.fedoraDatastreams.includes("THUMBNAIL") ? "true" : "false";
        if (fields.has_thumbnail_str === "true") {
            fields.THUMBNAIL_contentDigest_digest_str = fedoraData.getThumbnailHash("md5");
        }

        // FITS details:
        if (fedoraData.fileSize !== null) {
            fields.sizebytes_str = fedoraData.fileSize;
        }
        if (fedoraData.imageHeight !== null) {
            fields.height_str = fedoraData.imageHeight;
        }
        if (fedoraData.imageWidth !== null) {
            fields.width_str = fedoraData.imageWidth;
        }
        if (fedoraData.mimetype.length > 0) {
            fields.mime_str_mv = fedoraData.mimetype;
        }

        // Full text:
        const fullText = fedoraData.fullText;
        if (fullText.length > 0) {
            fields.fulltext = fullText;
        }

        // Change tracker details:
        const change = await this.getChangeTrackerDetails(
            pid,
            fields["fgs.lastModifiedDate_txt_mv"][0] ?? "1900-01-01T00:00:00Z"
        );
        fields.first_indexed = change.getFirstIndexed;
        fields.last_indexed = change.getLastIndexed;

        return fields;
    }
}

export default SolrIndexer;
