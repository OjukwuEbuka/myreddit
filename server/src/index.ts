import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from 'redis';
import session from 'express-session';
import cors from "cors";


const main = async () => {
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();

    const app = express();
    
    const RedisStore = require('connect-redis')(session);
    const redisClient = redis.createClient();
    app.use(
        cors({
            origin: "http://localhost:3000",
            credentials: true
        })
    );
    app.use(
        session({
            name: 'qid',
            store: new RedisStore({ 
                client: redisClient,
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
            return ({ em: orm.em, req, res });
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
