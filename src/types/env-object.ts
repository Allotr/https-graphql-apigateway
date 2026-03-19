export interface EnvObject extends Record<string, string> {
    SESSION_SECRET: string,
    REDIRECT_URL: string,
    MONGO_DB_ENDPOINT: string,
    VAPID_PUBLIC_KEY: string,
    VAPID_PRIVATE_KEY: string,
    REDIS_ENDPOINT: string,
    REDIS_PORT: string,
    DB_NAME: string,
    HTTPS_PORT: string
    GRAPHQL_USERS_URL: string,
    GRAPHQL_RESOURCES_URL: string,
    GRAPHQL_NOTIFICATIONS_URL: string
}