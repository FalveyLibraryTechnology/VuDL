import fs = require("fs");
import path = require("path");
import Config from "../models/Config";
import { Knex, knex } from "knex";
import { nanoid } from "nanoid";
import Authentication from "./Authentication";

interface User {
    id: number;
    username: string;
    password: string;
    hash: string;
}
interface Token {
    token: string;
    created_at: number;
    user_id: number;
}
interface Pid {
    namespace: string;
    pid: number;
}

class Database {
    private static instance: Database;
    config: Config;
    auth: Authentication;
    connection: Knex = null;
    tokenLifetime = 24 * 60 * 60 * 1000;

    constructor(config: Config, auth: Authentication) {
        this.config = config;
        this.auth = auth;
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database(Config.getInstance(), Authentication.getInstance());
        }
        return Database.instance;
    }

    protected async connect(): Promise<void> {
        console.log("Database:connect");

        const config: Knex.Config = {
            client: this.config.databaseClient,
            connection: this.config.databaseConnectionSettings,
            useNullAsDefault: true,
        };

        this.connection = await knex(config);

        await this.initialize(this.connection);

        console.log("Database:ready");
    }

    protected async initialize(db: Knex): Promise<void> {
        // Special case: if we're using a disk-based database, make sure the containing directory exists:
        if (this.config.databaseClient === "sqlite3") {
            const dbFilename = this.config.databaseConnectionSettings.filename as string;
            const dataDir = path.dirname(dbFilename);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir);
            }
        }

        // If the database has already been initialized, we are done!
        try {
            // Try to select from the user table; if this throws an exception, we probably need to initialize.
            await this.getUserBy("id", -1);
            // If we got this far, the database is already initialized.
            return;
        } catch (e) {
            // Not the expected error message -- rethrow!
            if (!e.message.match(/no such table|Table .* doesn't exist/)) {
                throw e;
            }
            console.log("Database:createTables");
        }

        await db.schema.dropTableIfExists("users");
        await db.schema.createTable("users", (table) => {
            table.increments("id");
            table.string("username");
            table.string("hash");
        });
        await db.schema.dropTableIfExists("tokens");
        await db.schema.createTable("tokens", (table) => {
            table.string("token").primary();
            table.timestamp("created_at").notNullable();
            table.integer("user_id").unsigned().references("users.id");
        });
        await db.schema.dropTableIfExists("pids");
        await db.schema.createTable("pids", (table) => {
            table.string("namespace").primary();
            table.integer("pid");
        });
        const initialPid: Pid = {
            namespace: this.config.fedoraPidNameSpace,
            pid: this.config.initialPidValue,
        };
        await db("pids").insert(initialPid);

        const users = this.config.databaseInitialUsers;
        for (const username in users) {
            const pass = users[username];
            const hash = this.auth.hashPassword(pass);
            console.log(`Database:insert: ${username}`);
            await db("users").insert({ username, hash });
        }
    }

    protected async getConnection(): Promise<Knex> {
        if (this.connection === null) {
            await this.connect();
        }
        return this.connection;
    }

    public async getUserBy(key: string, val: string | number): Promise<User> {
        const db = await this.getConnection();
        const users = await db<User>("users").where(key, val);
        return users[0] ?? null;
    }

    public async confirmToken(token: string): Promise<boolean> {
        const db = await this.getConnection();
        const rows = await db<Token>("tokens")
            .select("*", db.raw("? as ??", [db.fn.now(), "now"]))
            .where("token", token);
        const check = (rows ?? [null])[0];
        // Failed check -- something is wrong!
        if (!check) {
            return false;
        }
        // If token has expired, clear it out:
        const timePassedInSeconds = (new Date(check.now).getTime() - new Date(check.created_at).getTime()) / 1000;
        if (timePassedInSeconds > this.tokenLifetime) {
            await db("tokens").where("token", token).delete();
            return false;
        }
        return true;
    }

    public async getNextPid(namespace: string): Promise<string> {
        const db = await this.getConnection();
        let pid = "";
        // We don't want to create a duplicate PID or get out of sync, so we need to
        // do this as a transcation!
        await db.transaction(async function (trx) {
            // Get the latest PID, and fail if we can't find it:
            const current = await trx<Pid>("pids").where("namespace", namespace);
            if (current.length < 1) {
                throw new Error("Cannot find PID for namespace: " + namespace);
            }
            // Increment the PID and update the database:
            const numericPortion = current[0].pid + 1;
            await trx("pids").where("namespace", namespace).update("pid", numericPortion);
            // Commit the transaction:
            await trx.commit();
            // Only update the variable AFTER everything has been successful:
            pid = namespace + ":" + numericPortion;
        });
        if (pid.length === 0) {
            throw new Error("Unexpected pid generation error.");
        }
        return pid;
    }

    public async makeToken(user: User): Promise<string> {
        if (user === null) {
            return null;
        }
        const db = await this.getConnection();
        const token = nanoid();
        await db("tokens").insert({
            token,
            user_id: user.id,
            created_at: db.fn.now(),
        });
        return token;
    }
}

export default Database;
