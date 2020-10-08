import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";

const main = async () => {
    const orm = await MikroORM.init(microConfig);

    const post = orm.em.create(Post, {title: 'my first post'});
    await orm.em.persistAndFlush(post);
    await orm.em.nativeInsert(Post, {title: "Post num 2"});
};

main();

console.log('Hello world');

let n = 10;
while(n>0){
    console.log(n);
    n -= 2;
}