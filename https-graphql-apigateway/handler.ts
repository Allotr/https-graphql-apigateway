import https from "https";
import * as http from "http";
import * as core from 'express-serve-static-core';

import { createGatewaySchema } from "./src/graphql/schemasMap";
import { getLoadedEnvVariables } from "./src/utils/env-loader";
import { graphqlHTTP } from 'express-graphql';
import { parse } from "graphql";
import { compileQuery } from "graphql-jit";
import { initializeCORS } from "./src/cors/cors-middleware";

async function handle(event: any, context: any, cb: any) {
  // When using graphqlHTTP this is not being executed
}

function onExpressServerCreated(app: core.Express) {
  // Create GraphQL HTTP server
  // IMPORTANT: ENVIRONMENT VARIABLES ONLY ARE AVAILABLE HERE AND ON onExpressServerListen
  initializeCORS(app);

  const cache = {};
  app.use("/graphql", graphqlHTTP(async (req, res, params) => {
    const schema = await createGatewaySchema(req.headers?.cookie);
    const query = params?.query;
    if (query == null) {
      return { schema, graphiql: true, context: req };
    }
    if (!(query in cache)) {
      const document = parse(query);
      cache[query] = compileQuery(schema, document);
    }

    return {
      schema,
      customExecuteFn: ({ rootValue, variableValues, contextValue }) =>
        cache[query].query(rootValue, contextValue, variableValues),
      context: req,
      graphiql: true
    };
  }));
}

async function onExpressServerListen(server: https.Server | http.Server) {
  // MongoDB Connection
  const { HTTPS_PORT } = getLoadedEnvVariables();

  console.log(`GraphQL server running on port ${HTTPS_PORT}`);
}


export { handle, onExpressServerCreated, onExpressServerListen };
