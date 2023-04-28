import Fedora from "./Fedora";
import FedoraDataCollector from "./FedoraDataCollector";

class TrashCollector {
    private static instance: TrashCollector;
    protected fedora: Fedora;
    protected collector: FedoraDataCollector;

    constructor(fedora: Fedora, collector: FedoraDataCollector) {
        this.fedora = fedora;
        this.collector = collector;
    }

    public static getInstance(): TrashCollector {
        if (!TrashCollector.instance) {
            TrashCollector.instance = new TrashCollector(Fedora.getInstance(), FedoraDataCollector.getInstance());
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
        let data = null;
        try {
            data = await this.collector.getObjectData(pid);
        } catch (e) {
            // Special case: if an object was partially deleted but its tombstone wasn't purged, it will return a 410.
            // If this happens, we should go ahead and finish the job!
            if (e.message === "Unexpected status code: 410") {
                return true;
            }
            throw e;
        }
        // Only allow purging if the item is flagged as deleted in the system:
        return data?.fedoraDetails?.state?.[0] === "Deleted";
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
        await this.fedora.deleteObject(pid);
        await this.fedora.deleteObjectTombstone(pid);
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
