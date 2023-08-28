import * as Redis from 'ioredis';
import { getLoadedEnvVariables } from "./env-loader";


let getRedisConnection = (): { connection: Redis.Redis } => {
    var instance: { connection: Redis.Redis };

    getRedisConnection = () => {
        return instance;
    }

    function createConnection() {
        if (instance) {
            return instance;
        }
        const { REDIS_ENDPOINT, REDIS_PORT } = getLoadedEnvVariables();
        const options = {
            host: REDIS_ENDPOINT,
            port: Number(REDIS_PORT),
            retryStrategy: (times: number) => {
                // reconnect after
                return Math.min(times * 50, 2000);
            }
        };
        instance = {
            connection: new Redis.default(options)
        };
        return instance;
    }
    return createConnection();
}

export { getRedisConnection };