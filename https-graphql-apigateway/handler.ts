import { getMongoDBConnection } from "./src/utils/mongodb-connector";
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
import { getUserInfoFromRequest, initializeSessionStore, logoutSession } from "./src/middlewares/auth";
import { corsRequestHandler } from "./src/middlewares/cors";
import { ServerContext, UserContext } from "./src/types/yoga-context";


function onServerCreated(app: TemplatedApp) {
  // Create GraphQL HTTP server
  // IMPORTANT: ENVIRONMENT VARIABLES ONLY ARE AVAILABLE HERE AND ON onServerListen
  const redis = getRedisConnection().connection;
  const cache = createRedisCache({ redis }) as UseResponseCacheParameter["cache"]
  initializeSessionStore();

  const yoga = createYoga<ServerContext, UserContext>({
    schema: makeGatewaySchema(),
    context: async ({ req, res, request }) => {
      // Context factory gets called for every request
      const [sid,userId] = await getUserInfoFromRequest(request);
      return {
        req,
        res,
        user: {
          _id: userId! // After login the user id is not null
        },
        mongoDBConnection: getMongoDBConnection(),
        redisConnection: getRedisConnection(),
        sid: sid!, // After login the session id is not null
        logout: logoutSession,
        cache
      }
    },
    cors: corsRequestHandler,
    graphiql: true,
    plugins: [
      useGraphQlJit(),
      useParserCache(),
      useResponseCache({
        session: (request) => {
          const cookieList = request.headers.get('cookie') ?? "";
          const parsedCookie = cookie.parse(cookieList);
          return parsedCookie?.['connect.sid'];
        },
        cache
      })
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
