import fs = require("fs");
import { Knex, knex } from "knex";
import { nanoid } from "nanoid";

// TODO: Config
const dbFilename = "./data/auth.sqlite3";
const tokenLifetime = 24 * 60 * 60 * 1000;

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

let db: Knex = null;
const REBUILD_DB = true;
async function getDatabase(): Promise<Knex> {
    if (db === null) {
        console.log("Database:setup");
        const config: Knex.Config = {
            client: "sqlite3",
            connection: {
                filename: dbFilename,
            },
            useNullAsDefault: true,
        };

        db = knex(config);

        if (REBUILD_DB || !fs.existsSync(dbFilename)) {
            console.log("Database:createTables");
            await db.schema
                .dropTableIfExists("users")
                .createTable("users", (table) => {
                    table.increments("id");
                    table.string("username");
                    table.string("password");
                    table.string("hash");
                })
                .dropTableIfExists("tokens")
                .createTable("tokens", (table) => {
                    table.string("token").primary();
                    table.timestamp("created_at").defaultTo(Date.now());
                    table.integer("user_id").unsigned().references("users.id");
                });
            console.log("Database:insert");
            const users = [
                { username: "geoff", password: "earth", hash: "CuhFfwkebs3RKr1Zo_Do_" },
                { username: "chris", password: "air", hash: "V1StGXR8_Z5jdHi6B-myT" },
                { username: "dkatz", password: "avatar", hash: "_HPZZ6uCouEU5jy-AYrDd" },
            ];
            for (const user of users) {
                await db("users").insert(user);
            }
        }

        console.log("Database:ready");
    }

    return db;
}

export async function getUserBy(key: string, val: string | number): Promise<User> {
    const db = await getDatabase();
    const users = await db<User>("users").where(key, val);
    return users[0] ?? null;
}

export async function confirmToken(token: string): void {
    const db = await getDatabase();
    const rows = await db<Token>("tokens").where("token", token);
    const check = (rows ?? [null])[0];
    if (!check || check.created_at + tokenLifetime < Date.now()) {
        await db("tokens").where("token", token).delete();
        return false;
    }
    return true;
}

export async function makeToken(user: User): void {
    if (user === null) {
        return null;
    }
    const db = await getDatabase();
    const token = nanoid();
    await db("tokens").where("user_id", user.id).delete();
    await db("tokens").insert({ token, user_id: user.id });
    return token;
}
