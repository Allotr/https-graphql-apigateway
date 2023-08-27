import { UserDbObject } from "allotr-graphql-schema-types";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { UseResponseCacheParameter } from "@graphql-yoga/plugin-response-cache";
import { MongoClient, Db } from "mongodb";
import { Redis } from "ioredis";
import { HttpRequest, HttpResponse } from "uWebSockets.js";


interface ServerContext {
    req: HttpRequest
    res: HttpResponse
  }

type UserContext = {
    sid: string | null,
}

type GraphQLContext = ServerContext & UserContext;


export { ServerContext, UserContext, GraphQLContext }