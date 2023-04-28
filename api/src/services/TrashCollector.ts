import Config from "../models/Config";
import Fedora from "./Fedora";

class TrashCollector {
    private static instance: TrashCollector;
    protected config: Config;
    protected fedora: Fedora;

    constructor(config: Config, fedora: Fedora) {
        this.config = config;
        this.fedora = fedora;
    }

    public static getInstance(): TrashCollector {
        if (!TrashCollector.instance) {
            TrashCollector.instance = new TrashCollector(Config.getInstance(), Fedora.getInstance());
        }
        return TrashCollector.instance;
    }

    public static setInstance(collector: TrashCollector): void {
        TrashCollector.instance = collector;
    }

    /**
     * Check whether or not the provided PID is safe to purge.
     *
     * @param pid PID to check
     */
    public async pidIsSafeToPurge(pid: string): Promise<boolean> {
        // TODO: check
        return true;
    }

    /**
     * Purge a single PID. Return true on success, false on failure (due to technical problem or ineligibility for purging)
     *
     * @param pid PID to purge
     */
    public async purgePid(pid: string): Promise<boolean> {
        if (!(await this.pidIsSafeToPurge(pid))) {
            return false;
        }
        // We need to both mark the object as deleted AND delete its subsequent tombstone to fully reclaim space from Fedora:
        this.fedora.deleteObject(pid);
        this.fedora.deleteObjectTombstone(pid);
        return true;
    }

    /**
     * Purge a list of PIDs; return an array of PIDs that could NOT be deleted.
     *
     * @param pids PIDs to purge
     */
    public async purgePids(pids: Array<string>): Promise<Array<string>> {
        const notDeleted: Array<string> = [];
        for (const pid of pids) {
            let result = false;
            try {
                result = await this.purgePid(pid);
            } catch (e) {
                console.error(e);
            }
            if (!result) {
                notDeleted.push(pid);
            }
        }
        return notDeleted;
    }
}

export default TrashCollector;
