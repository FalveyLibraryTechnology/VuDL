import fs = require("fs");
import { Knex, knex } from "knex";

interface User {
    id: number;
    username: string;
    password: string;
    hash: string;
}

const dbFilename = "./auth.db";
const config: Knex.Config = {
    client: "sqlite3",
    connection: {
        filename: dbFilename,
    },
};

const db = knex(config);

if (!fs.existsSync(dbFilename)) {
    db.schema.createTable("users", table => {
        table.increments("id");
        table.string("username");
        table.string("password");
        table.string("hash");
    }).then(() => {
        const users = [
            { username: "chris", password: "air", hash: "V1StGXR8_Z5jdHi6B-myT" },
            { username: "geoff", password: "earth", hash: "CuhFfwkebs3RKr1Zo_Do_" },
            { username: "dkatz", password: "avatar", hash: "_HPZZ6uCouEU5jy-AYrDd" },
        ];
        for (const user of users) {
            db("users").insert(user);
        }
    });
}

export async function getUserBy(key, val): Promise<User> {
    let users = await db<User>('users').where(key, val);
    return users[0] ?? null;
}
