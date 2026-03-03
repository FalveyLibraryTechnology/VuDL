import { Request, Response } from "express";

interface NextFunction {
    (err?: Error): void;
}

export const defaultSanitizeRegEx = /^[-.a-zA-Z0-9_]+$/;
export const pidSanitizeRegEx = /^[a-zA-Z]+:[0-9]+$/;

export function sanitizeParameters(customRules = {}, defaultRule = defaultSanitizeRegEx) {
    return function (req: Request, res: Response, next: NextFunction) {
        for (const key in req.params) {
            const val = req.params[key];

            // make sure it's a string before matching
            if (typeof val !== "string" || !val.match(customRules[key] ?? defaultRule)) {
                return res.status(400).json({ error: "invalid: " + key });
            }
        }
        next();
    };
}

export const pidSanitizer = sanitizeParameters({ pid: pidSanitizeRegEx }, /^$/);
export const datastreamSanitizer = sanitizeParameters({ pid: pidSanitizeRegEx, stream: defaultSanitizeRegEx }, /^$/);
