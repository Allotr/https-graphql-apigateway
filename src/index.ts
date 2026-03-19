import { App } from "uWebSockets.js";
require('dotenv').config({ path: ".env" });
import { makeGatewaySchema } from "./graphql/schemasMap";
import { getLoadedEnvVariables } from "./utils/env-loader";
import { createYoga } from "graphql-yoga";
import { useGraphQlJit } from '@envelop/graphql-jit'
import { useParserCache } from "@envelop/parser-cache";

import { getSessionIdFromCookie, initializeSessionStore } from "./middlewares/auth";
import { corsRequestHandler } from "./middlewares/cors";
import { ServerContext, UserContext } from "./types/yoga-context";

const app = App({});

// uWebSockets server created. Do any initialization required in the handler
// Create GraphQL HTTP server
// IMPORTANT: ENVIRONMENT VARIABLES ONLY ARE AVAILABLE HERE AND ON onServerListen
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
    useParserCache()
  ]
})
app.any("/graphql", yoga);

const port = Number(process.env.http_port) || 3000;
app.listen(port, (listenSocket) => {
  if (listenSocket) {
    // MongoDB Connection
    const { HTTPS_PORT } = getLoadedEnvVariables();

    console.log(`GraphQL server running on port ${HTTPS_PORT}`);
  }
});