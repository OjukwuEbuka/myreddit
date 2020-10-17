import { isAuth } from "../middleware/isAuth";
import { MyContext } from "src/types";
import { 
    Resolver, 
    Query, 
    Mutation, 
    Arg, 
    Ctx, 
    Int, 
    Field, 
    InputType, 
    UseMiddleware, 
    FieldResolver, 
    Root 
} from "type-graphql";
import { Post } from '../entities/Post';
import { getConnection } from "typeorm";

@InputType()
class PostInput {
    @Field()
    title: string
    
    @Field()
    text: string;
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet( @Root() root: Post) {
        return root.text.slice(0, 50);
    }

    @Query(() => [Post])
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    ): Promise<Post[]> {
        // await sleep(2000);
        // return Post.find();
        const realLimit = Math.min(50, limit);
        const qb = getConnection()
            .getRepository(Post)
            .createQueryBuilder("p")
            .orderBy('"createdAt"', "DESC")
            .take(realLimit);

        if(cursor) {
            qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
        }

        return qb.getMany();
    }
   
    @Query(() => Post, { nullable: true })
    post(
        @Arg('id', () => Int) id: number
        ): Promise<Post | undefined> {
        return Post.findOne(id);
    }
   
    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('input') input: PostInput,
        @Ctx() { req } : MyContext
    ): Promise<Post> {
        const post = Post.create({
            ...input,
            creatorId: req.session.userId,            
        }).save();
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