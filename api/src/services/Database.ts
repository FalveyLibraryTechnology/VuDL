import fs = require("fs");
import { Knex, knex } from "knex";

interface User {
    id: number;
    username: string;
    password: string;
    hash: string;
}

let db: Knex = null;
async function getDatabase(): Promise<Knex> {
    if (db === null) {
        console.log("Database:setup");
        const dbFilename = "./data/auth.sqlite3";
        const config: Knex.Config = {
            client: "sqlite3",
            connection: {
                filename: dbFilename,
            },
            useNullAsDefault: true,
        };

        db = knex(config);

        if (!fs.existsSync(dbFilename)) {
            console.log("Database:createTable");
            await db.schema.createTable("users", (table) => {
                table.increments("id");
                table.string("username");
                table.string("password");
                table.string("hash");
            });
            console.log("Database:insert");
            const users = [
                { username: "chris", password: "air", hash: "V1StGXR8_Z5jdHi6B-myT" },
                { username: "geoff", password: "earth", hash: "CuhFfwkebs3RKr1Zo_Do_" },
                { username: "dkatz", password: "avatar", hash: "_HPZZ6uCouEU5jy-AYrDd" },
            ];
            for (const user of users) {
                await db("users").insert(user);
            }
        }
    }

    console.log("Database:ready");
    return db;
}

export async function getUserBy(key: string, val: string | number): Promise<User> {
    const db = await getDatabase();
    const users = await db<User>("users").where(key, val);
    return users[0] ?? null;
}
