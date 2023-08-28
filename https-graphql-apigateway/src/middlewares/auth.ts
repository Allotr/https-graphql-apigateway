import { getLoadedEnvVariables } from "../utils/env-loader";
import { signedCookie } from "cookie-parser"
import cookie from "cookie";

let sessionSecret: string;

function initializeSessionStore() {
    const {
        SESSION_SECRET
    } = getLoadedEnvVariables();

    sessionSecret = SESSION_SECRET;
}

function getSessionIdFromCookie(request: Request): string | null {
    const cookieList = request.headers.get('cookie') ?? "";
    const parsedCookie = cookie.parse(cookieList);
    const sid = parsedCookie?.['connect.sid'];
    const sidParsed = signedCookie(sid, sessionSecret) || null;

    if (sidParsed == null) {
        console.log("Bad cookie: " + JSON.stringify({ cookieList, parsedCookie, sid, sidParsed }),);
    }
    return sidParsed
}



export { initializeSessionStore, getSessionIdFromCookie }