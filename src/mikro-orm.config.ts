import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import keys from '../keys';

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    entities: [Post],
    dbName: keys.dbName,
    user: keys.username,
    password: keys.password,
    type: 'postgresql',
    debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];