import { Resolver, Query, Mutation, Arg, Int } from "type-graphql";
import { Post } from '../entities/Post';

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts(): Promise<Post[]> {
        // await sleep(2000);
        return Post.find();
    }
   
    @Query(() => Post, { nullable: true })
    post(
        @Arg('id', () => Int) id: number
        ): Promise<Post | undefined> {
        return Post.findOne(id);
    }
   
    @Mutation(() => Post)
    async createPost(
        @Arg('title') title: string
    ): Promise<Post | undefined> {
        const post = Post.create({title}).save();
        return post;
    }
   
    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title') title: string
    ): Promise<Post | undefined> {
        // const res = await em.nativeUpdate(Post, { id }, {title});
        // if(res == 1) return em.findOne(Post, { id });
        const post = await Post.findOne(id);
        if(!post) return undefined;

        if(typeof title !== "undefined"){
            await Post.update({ id }, { title });
        }
        return post;
    }
    
    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id', () => Int) id: number
    ): Promise<Boolean> {        
        await Post.delete(id);
        return true;
    }
}