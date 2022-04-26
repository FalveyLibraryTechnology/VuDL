import crypto = require("crypto");
import passport = require("passport");
import saml = require("passport-saml");
import LocalStrategy = require("passport-local");
import Config from "../models/Config";
import Database from "./Database";

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

    public hashPassword(password: string): string {
        const hash = crypto.createHash(this.config.authenticationHashAlgorithm);
        // TODO: add salt
        hash.update(password);
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
            passport.use(
                new LocalStrategy(async function (username, password, done) {
                    const user = await Database.getInstance().getUserBy("username", username);
                    if (user?.hash === Authentication.getInstance().hashPassword(password)) {
                        return done(null, user);
                    }
                    return done(null, false);
                })
            );
        } else if (authStrategy === "saml") {
            passport.use(
                new saml.Strategy(
                    {
                        path: "/login",
                        entryPoint: this.config.samlEntryPoint,
                        issuer: this.config.clientUrl,
                        cert: this.config.samlCertificate,
                    },
                    function (profile, done) {
                        console.log(profile);
                        //done(null, false);
                    }
                )
            );
        } else {
            throw new Error(`Unsupported auth strategy: ${authStrategy}`);
        }
    }
}

export default Authentication;
