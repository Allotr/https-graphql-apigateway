import { buildSchema } from "graphql";
import { parse } from 'graphql'
import { DIRECTIVES } from '@graphql-codegen/typescript-mongodb';
import 'graphql-import-node';
import * as userTypeDefs from "allotr-graphql-schema-types/src/schemas/user.graphql"
import * as resourceTypeDefs from "allotr-graphql-schema-types/src/schemas/resource.graphql"
import * as notificationTypeDefs from "allotr-graphql-schema-types/src/schemas/resourceNotification.graphql"
import { buildHTTPExecutor } from '@graphql-tools/executor-http'
import { stitchSchemas } from '@graphql-tools/stitch'
import { stitchingDirectives } from '@graphql-tools/stitching-directives'
import { getLoadedEnvVariables } from '../utils/env-loader';

const { allStitchingDirectivesTypeDefs, stitchingDirectivesTransformer } = stitchingDirectives()

export async function createGatewaySchema(cookie) {
    const {
        GRAPHQL_USERS_URL,
        GRAPHQL_RESOURCES_URL,
        GRAPHQL_NOTIFICATIONS_URL
    } = getLoadedEnvVariables()

    const usersExec = buildHTTPExecutor({
        endpoint: GRAPHQL_USERS_URL,
        credentials: 'include',
        headers: { 'cookie': cookie }
    })
    const resourcesExec = buildHTTPExecutor({
        endpoint: GRAPHQL_RESOURCES_URL,
        credentials: 'include',
        headers: { 'cookie': cookie }
    })
    const notificationsExec = buildHTTPExecutor({
        endpoint: GRAPHQL_NOTIFICATIONS_URL,
        credentials: 'include',
        headers: { 'cookie': cookie }
    })

    const usersTypeDefs = /* GraphQL */ `
    ${allStitchingDirectivesTypeDefs}
    ${DIRECTIVES?.loc?.source?.body}
    ${userTypeDefs?.loc?.source?.body}
    `


    const resourcesTypeDefs = /* GraphQL */ `
    ${allStitchingDirectivesTypeDefs}
    ${DIRECTIVES?.loc?.source?.body}
    ${resourceTypeDefs?.loc?.source?.body}
    `


    const notificationsTypeDefs = /* GraphQL */ `
    ${allStitchingDirectivesTypeDefs}
    ${DIRECTIVES?.loc?.source?.body}
    ${notificationTypeDefs?.loc?.source?.body}
    `

    return stitchSchemas({
        // 1. Include directives transformer...
        subschemaConfigTransforms: [stitchingDirectivesTransformer],
        subschemas: [
            {
                schema: buildSchema(usersTypeDefs),
                executor: usersExec
            },
            {
                schema: buildSchema(resourcesTypeDefs),
                executor: resourcesExec
            },
            {
                schema: buildSchema(notificationsTypeDefs),
                executor: notificationsExec
            }
        ]
    })
}

async function fetchRemoteSchema(executor) {
    // 2. Fetch schemas from their raw SDL queries...
    const result = await executor({ document: parse('{ _sdl }') })
    return buildSchema(result.data._sdl)
}