import { getRedisConnection } from "./src/utils/redis-connector";
import { makeGatewaySchema } from "./src/graphql/schemasMap";
import { getLoadedEnvVariables } from "./src/utils/env-loader";
import { createYoga } from "graphql-yoga";
import { TemplatedApp } from "uWebSockets.js";
import { useGraphQlJit } from '@envelop/graphql-jit'
import { useParserCache } from "@envelop/parser-cache";
import cookie from "cookie";

import { useResponseCache, UseResponseCacheParameter } from '@graphql-yoga/plugin-response-cache'
import { createRedisCache } from '@envelop/response-cache-redis'
import { getSessionIdFromCookie, initializeSessionStore } from "./src/middlewares/auth";
import { corsRequestHandler } from "./src/middlewares/cors";
import { ServerContext, UserContext } from "./src/types/yoga-context";
import { queryNames } from "./src/consts/query-names";
import _ from "lodash";


function onServerCreated(app: TemplatedApp) {
  // Create GraphQL HTTP server
  // IMPORTANT: ENVIRONMENT VARIABLES ONLY ARE AVAILABLE HERE AND ON onServerListen
  const redis = getRedisConnection().connection;
  const cache = createRedisCache({ redis }) as UseResponseCacheParameter["cache"]
  initializeSessionStore();

    const yoga = createYoga<ServerContext, UserContext>({
    schema: makeGatewaySchema(),
    context: ({ request }) => {
      // Context factory gets called for every request
      const sid = getSessionIdFromCookie(request);
      return {
        sid
      }
    },
    cors: corsRequestHandler,
    graphiql: true,
    plugins: [
      useGraphQlJit(),
      useParserCache(),
      // useResponseCache({
      //   idFields: ["id", "_id"],
      //   session: (request) => {
      //     const sid = getSessionIdFromCookie(request);
      //     return `Bearer ${sid ?? ""}`;
      //   },
      //   shouldCacheResult: ({ result }) => {
      //     const functionBlacklist = [
      //       'myNotificationData'
      //     ]

      //     const data = result?.data as any;
      //     const isEmptyValue = queryNames.some(query => data?.[query] != null && _.isEmpty(data?.[query]))
      //     const isValidFunction = functionBlacklist.every(key => data?.[key] == null);

      //     return !isEmptyValue && isValidFunction
      //   },
      //   cache
      // })
    ]
  })
  app.any("/graphql", yoga);
}

async function onServerListen(app: TemplatedApp) {
  // MongoDB Connection
  const { HTTPS_PORT } = getLoadedEnvVariables();

  console.log(`GraphQL server running on port ${HTTPS_PORT}`);
}


export { onServerCreated, onServerListen };
