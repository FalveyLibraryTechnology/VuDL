import crypto = require("crypto");
import passport = require("passport");
import saml = require("passport-saml");
import LocalStrategy = require("passport-local");
import Config from "../models/Config";
import { User, Database } from "./Database";

class Authentication {
    private static instance: Authentication;
    config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    public static getInstance(): Authentication {
        if (!Authentication.instance) {
            Authentication.instance = new Authentication(Config.getInstance());
        }
        return Authentication.instance;
    }

    public isLegalUsername(username: string): boolean {
        const legalUsers = this.config.authenticationLegalUsernames;
        // If there is no legal user list, then all users are legal:
        if (legalUsers.length === 0) {
            return true;
        }
        return legalUsers.includes(username);
    }

    protected getLocalStrategy(): LocalStrategy {
        const db = Database.getInstance();
        const passwordRequired = this.config.authenticationRequirePasswords;
        return new LocalStrategy(
            async function (username, password, done) {
                if (!this.isLegalUsername(username)) {
                    return done(null, false);
                }
                if (passwordRequired) {
                    const user = await db.getUserBy("username", username);
                    if (user?.hash === Authentication.getInstance().hashPassword(password)) {
                        return done(null, user);
                    }
                } else {
                    const user = await db.getOrCreateUser(username);
                    return done(null, user);
                }
                return done(null, false);
            }.bind(this)
        );
    }

    public getSamlStrategy(): saml.Strategy {
        return new saml.Strategy(
            {
                path: "/api/auth/login",
                callbackUrl: `${this.config.backendUrl}/api/auth/login`,
                entryPoint: this.config.samlEntryPoint,
                issuer: this.config.backendUrl,
                cert: this.config.samlCertificate,
            },
            async function (profile, done) {
                let user: User | boolean = false;
                if (this.isLegalUsername(profile.nameID)) {
                    const db = Database.getInstance();
                    user = await db.getOrCreateUser(profile.nameID);
                }
                // There is a problem with types in passport-saml, which the below casting works around.
                // TODO: find better solution; see https://github.com/node-saml/passport-saml/issues/549
                (done as unknown as (x, user: User | boolean) => void)(null, user);
            }.bind(this)
        );
    }

    public hashPassword(password: string): string {
        const hash = crypto.createHash(this.config.authenticationHashAlgorithm);
        hash.update(password + this.config.authenticationSalt);
        return hash.digest("hex");
    }

    public initializePassport(): void {
        passport.serializeUser(function (user, done) {
            done(null, user.id);
        });

        passport.deserializeUser(async function (id, done) {
            const user = await Database.getInstance().getUserBy("id", id);
            done(null, user);
        });

        const authStrategy = Config.getInstance().authenticationStrategy;
        if (authStrategy === "local") {
            passport.use(this.getLocalStrategy());
        } else if (authStrategy === "saml") {
            const samlStrategy = this.getSamlStrategy();
            passport.use(samlStrategy);
        } else {
            throw new Error(`Unsupported auth strategy: ${authStrategy}`);
        }
    }
}

export default Authentication;
