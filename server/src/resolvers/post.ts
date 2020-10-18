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
    Root, 
    ObjectType
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

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[];
    @Field()
    hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet( @Root() root: Post) {
        return root.text.slice(0, 50);
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    ): Promise<PaginatedPosts> {
        // await sleep(2000);
        // return Post.find();
        const realLimit = Math.min(50, limit) + 1;
        const realLimitPlusOne = realLimit + 1;
        const qb = getConnection()
            .getRepository(Post)
            .createQueryBuilder("p")
            .orderBy('"createdAt"', "DESC")
            .take(realLimitPlusOne);

        if(cursor) {
            qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
        }

        const posts = await qb.getMany();
        return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne };
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