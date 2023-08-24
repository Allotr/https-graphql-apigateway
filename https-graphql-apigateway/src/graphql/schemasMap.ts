import 'graphql-import-node';

import { buildSchema } from "graphql";
import { parse } from 'graphql'
import { buildHTTPExecutor } from '@graphql-tools/executor-http'
import { stitchSchemas } from '@graphql-tools/stitch'
import { stitchingDirectives } from '@graphql-tools/stitching-directives'
import { getLoadedEnvVariables } from '../utils/env-loader';

const { stitchingDirectivesTransformer } = stitchingDirectives();

export async function createGatewaySchema(cookie) {
    const {
        // GRAPHQL_USERS_URL,
        GRAPHQL_RESOURCES_URL,
        // GRAPHQL_NOTIFICATIONS_URL
    } = getLoadedEnvVariables()

    // const usersExec = buildHTTPExecutor({
    //     endpoint: GRAPHQL_USERS_URL,
    //     credentials: 'include',
    //     headers: { 'cookie': cookie }
    // })
    const resourcesExec = buildHTTPExecutor({
        endpoint: GRAPHQL_RESOURCES_URL,
        credentials: 'include',
        headers: { 'cookie': cookie }
    })
    // const notificationsExec = buildHTTPExecutor({
    //     endpoint: GRAPHQL_NOTIFICATIONS_URL,
    //     credentials: 'include',
    //     headers: { 'cookie': cookie }
    // })

    return stitchSchemas({
        // 1. Include directives transformer...
        subschemaConfigTransforms: [stitchingDirectivesTransformer],
        subschemas: [
            // {
            //     schema: await fetchRemoteSchema(usersExec),
            //     executor: usersExec
            // },
            {
                schema: await fetchRemoteSchema(resourcesExec),
                executor: resourcesExec
            },
            // {
            //     schema: await fetchRemoteSchema(notificationsExec),
            //     executor: notificationsExec
            // }
        ]
    })
}

async function fetchRemoteSchema(executor) {
    // 2. Fetch schemas from their raw SDL queries...
    const result = await executor({ document: parse('{ _sdl }') })
    return buildSchema(result.data._sdl)
}