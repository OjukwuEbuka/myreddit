import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
// import microConfig from "./mikro-orm.config";
import { createConnection } from 'typeorm';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from 'ioredis';
import session from 'express-session';
import cors from "cors";
import k from "../keys";
import path from "path";
import { Updoot } from "./entities/Updoot";


const main = async () => {
    const conn = createConnection({
        type: 'postgres',
        database: k.dbName,
        username: k.username,
        password: k.password,
        logging: true,
        synchronize: true,
        migrations: [path.join(__dirname, "./migrations/*")],
        entities: [User, Post,Updoot],
    });
    await (await conn).runMigrations();

    const app = express();
    
    const RedisStore = require('connect-redis')(session);
    const redis = new Redis();
    app.use(
        cors({
            origin: "http://localhost:3000",
            credentials: true
        })
    );
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ 
                client: redis,
                disableTouch: true, 
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 48, //48 hour 
                httpOnly: true,
                sameSite: 'lax',
                secure: __prod__, //only https
            },
            saveUninitialized: false,
            secret: 'kaewrkjkrafdjklafoiaifjkl;a',
            resave: false
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [
                HelloResolver,
                PostResolver,
                UserResolver
            ],
            validate: false
        }),
        context: ({req, res}) => {
            return ({ req, res, redis });
        },
    });

    apolloServer.applyMiddleware({ 
        app, 
        cors: false
    });

    // app.get("/", (_, res) => {
    //     res.send('Hello express');
    // });
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log("Server started on localhost:"+PORT);
    });
    
};

main();
