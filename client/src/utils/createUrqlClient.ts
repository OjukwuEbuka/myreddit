import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import { dedupExchange, fetchExchange, stringifyVariables } from "urql";
import { 
  LogoutMutation, 
  MeQuery, 
  MeDocument, 
  LoginMutation, 
  RegisterMutation, 
  VoteMutationVariables
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { pipe, tap } from 'wonka';
import { Exchange } from 'urql';
import Router from 'next/router';
import gql from 'graphql-tag';

export const errorExchange: Exchange = ({ forward }) => ops$ => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if(error?.message.includes("not authenticated")) {
        Router.replace("/login");
      }
    })
  );
};

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isKeyInTheCache = cache.resolve(
      cache.resolveFieldByKey(entityKey, fieldKey) as string,
      "posts"
    );
    info.partial = !isKeyInTheCache;
    const results: string[] = [];
    let hasMore = true;
    fieldInfos.forEach(fi => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore");
      if(!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data)
    });

    return {
      __typename: "PaginatedPosts",
      posts: results,
      hasMore
    };
  }
}

export const createUrqlClient = (ssrExchange: any) => ({
    url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: "include" as const
  }, 
  exchanges: [
    dedupExchange, 
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          vote: (_result, args, cache, info) => {
            const {postId, value} = args as VoteMutationVariables;
            const data = cache.readFragment(
              gql`
                fragment _ on Post {
                  id
                  points
                  voteStatus
                }
              `,
              { id: postId } as any
            );
            if(data){
              if(data.voteStatus === args.value){
                return;
              }
              const newPoints = (data.points as number) + ( !data.voteStatus ? 1 : 2 ) * value;
              cache.writeFragment(
                gql`
                  fragment __ on Post {
                    points
                    voteStatus
                  }
                `,
                { id: postId, points: newPoints, voteStatus: value } as any
              )
            }
          },
          createPost: (_result, args, cache, info) => {
            const allFields = cache.inspectFields('Query');
            const fieldInfos = allFields.filter((info) => info.fieldName === 'posts');
            fieldInfos.forEach((fi) => {
              cache.invalidate('Query', 'posts', fi.arguments || {});
            })
          },
          logout: (_result, args, cache, info) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              {query: MeDocument},
              _result,
              () =>({me: null})
            )
          },
          login: (_result, args, cache, info) => {
            // cache.updateQuery({ query: MeDocument});
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache, 
              {query: MeDocument},
              _result,
              (result, query) => {
                if(result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user,
                  };
                }
              }
            );
          },
          register: (_result, args, cache, info) => {
            // cache.updateQuery({ query: MeDocument});
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache, 
              {query: MeDocument},
              _result,
              (result, query) => {
                if(result.register.errors) {
                  return query;
                } else {
                  return {
                    me: result.register.user,
                  };
                }
              }
            );
          },
        },
      },
    }),
  errorExchange,
  ssrExchange, 
  fetchExchange]
});

