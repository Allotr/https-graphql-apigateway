import { buildSchema } from "graphql";
import { parse } from 'graphql'
import { buildHTTPExecutor } from '@graphql-tools/executor-http'
import { stitchSchemas } from '@graphql-tools/stitch'
import { getLoadedEnvVariables } from '../utils/env-loader';

export async function makeGatewaySchema() {
    const {
        GRAPHQL_USERS_URL,
        GRAPHQL_RESOURCES_URL,
        GRAPHQL_NOTIFICATIONS_URL
    } = getLoadedEnvVariables()


    const usersExec = buildHTTPExecutor({
        endpoint: GRAPHQL_USERS_URL,
        credentials: 'include',
        headers: executorRequest => {
            return {
                Authorization: `Bearer ${executorRequest?.context?.sid ?? ""}`
            }
        }
    })
    const resourcesExec = buildHTTPExecutor({
        endpoint: GRAPHQL_RESOURCES_URL,
        credentials: 'include',
        headers: executorRequest => {
            return {
                Authorization: `Bearer ${executorRequest?.context?.sid ?? ""}`
            }
        }
    })
    const notificationsExec = buildHTTPExecutor({
        endpoint: GRAPHQL_NOTIFICATIONS_URL,
        credentials: 'include',
        headers: executorRequest => {
            return {
                Authorization: `Bearer ${executorRequest?.context?.sid ?? ""}`
            }
        }
    })


    const schemas = stitchSchemas({
        subschemas: [
            {
                schema: await fetchRemoteSchema(usersExec, "User"),
                executor: usersExec
            },
            {
                schema: await fetchRemoteSchema(resourcesExec, "Resource"),
                executor: resourcesExec
            },
            {
                schema: await fetchRemoteSchema(notificationsExec, "Notification"),
                executor: notificationsExec
            }
        ],

    })


    return schemas;
}

async function fetchRemoteSchema(executor, type: "Resource" | "User" | "Notification") {
    // 2. Fetch schemas from their raw SDL queries...
    const customSDL = `_sdl${type}`;
    const result = await executor({
        document: parse(`query ${customSDL} {  ${customSDL} }`)
    })
    if ('data' in result && customSDL in result.data) {
        return buildSchema(result.data[customSDL])
    }
    console.log("BUILD REMOTE SCHEMA", result)
    return buildSchema("")
}