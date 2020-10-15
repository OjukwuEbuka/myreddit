import { Resolver, Query, Mutation, Ctx, Arg, Int } from "type-graphql";
import { Post } from '../entities/Post';
import { MyContext } from '../types';

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts(@Ctx() { em }: MyContext): Promise<Post[]> {
        // await sleep(2000);
        return em.find(Post, {});
    }
   
    @Query(() => Post, { nullable: true })
    post(
        @Arg('id', () => Int) id: number,
        @Ctx() { em }: MyContext): Promise<Post | null> {
        return em.findOne(Post, { id });
    }
   
    @Mutation(() => Post)
    async createPost(
        @Arg('title') title: string,
        @Ctx() { em }: MyContext
    ): Promise<Post | null> {
        const post = em.create(Post, {title});
        await em.persistAndFlush(post)
        return post;
    }
   
    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title') title: string,
        @Ctx() { em }: MyContext
    ): Promise<Post | null> {
        // const res = await em.nativeUpdate(Post, { id }, {title});
        // if(res == 1) return em.findOne(Post, { id });
        const post = await em.findOne(Post, { id });
        if(!post) return null;

        if(typeof title !== "undefined"){
            post.title = title;
            await em.persistAndFlush(post);            
        }
        return post;
    }
    
    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() { em }: MyContext
    ): Promise<Boolean> {
        
        await em.nativeDelete(Post, { id });
        return true;
    }
}