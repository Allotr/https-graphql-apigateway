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