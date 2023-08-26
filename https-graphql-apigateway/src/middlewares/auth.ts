import { getLoadedEnvVariables } from "../utils/env-loader";
import { Store } from "express-session";
import MongoStore from 'connect-mongo';
import { signedCookie } from "cookie-parser"
import cookie from "cookie";
import { ObjectId } from "mongodb";
import { GraphQLError } from "graphql";

let store: Store;
let sessionSecret: string;

function initializeSessionStore() {
    const {
        MONGO_DB_ENDPOINT,
        SESSION_SECRET
    } = getLoadedEnvVariables();

    store = new MongoStore({ mongoUrl: MONGO_DB_ENDPOINT });
    sessionSecret = SESSION_SECRET;
}

async function getUserInfoFromRequest(request: Request): Promise<[sid: string | null, userId: ObjectId | null]> {
    const sid = getSessionIdFromCookie(request);
    const userId = await getUserIdFromSessionStore(sid);
    if(userId == null){
        throw new GraphQLError("Unauthorized, log in!");
    }
    return [sid, userId];
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

async function getUserIdFromSessionStore(sid: string | null): Promise<ObjectId | null> {
    if (sid == null) {
        return null;
    }
    return new Promise((resolve) => {
        store.get(sid, (err, session: any) => {
            if (err != null) {
                resolve(null);
                return;
            }

            const userId = session?.passport?.user ?? "";

            resolve(new ObjectId(userId));
        })
    })
}


function logoutSession(sid: string): Promise<void> {
    return new Promise((resolve, reject) => {
        store.destroy(sid, (err) => {
            if (err != null) {
                console.log("Error logging out")
                reject();
            }

            resolve();
        })
    })
}


export { initializeSessionStore, getUserInfoFromRequest, logoutSession }