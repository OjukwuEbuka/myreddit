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
import { Updoot } from "../entities/Updoot";
// import { User } from "../entities/User";

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

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() {req}: MyContext
    ){
        const isUpdoot = value !== -1;
        const realValue = isUpdoot ? 1 : -1;
        const { userId } = req.session;
        // await Updoot.insert({
        //     userId,
        //     postId,
        //     value: realValue,
        // });
        await getConnection().query(
            `
            START TRANSACTION;

            insert into updoot ("userId", "postId", value)
            values (${userId}, ${postId}, ${realValue});

            update post set points = points + ${realValue}
            where id = ${postId};

            COMMIT;
            `
        )
        return true
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

        const replacements: any[] = [realLimitPlusOne];

        if(cursor) {
            replacements.push(new Date(parseInt(cursor)))
        }

        const posts = await getConnection().query(`
            select p.*,
            json_build_object(
                'id', u.id,
                'username', u.username,
                'email', u.email,
                'createdAt', u."createdAt",
                'updatedAt', u."updatedAt"
            ) creator
            from post p
            left join "user" u on u.id = p."creatorId"
            ${cursor ? `where p."createdAt" < $2` : ''}
            order by p."createdAt" DESC
            limit $1
        `, replacements)

        // const qb = getConnection()
        //     .getRepository(Post)
        //     .createQueryBuilder('p')
        //     .leftJoinAndSelect(
        //         'p.creator',
        //         'u'
        //     )
        //     .where('u.id = p."creatorId"')
        //     .orderBy('p."createdAt"', "DESC")
        //     .take(realLimitPlusOne);

        // if(cursor) {
        //     qb.where('p."createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
        // }

        // const posts = await qb.getMany();
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