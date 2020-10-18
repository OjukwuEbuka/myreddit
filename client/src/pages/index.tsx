import React, { useState } from 'react';
import {Layout} from "../components/Layout";
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { Link, Stack, Box, Text, Heading, Flex,Button } from '@chakra-ui/core';
import NextLink from 'next/link';

const Index = () => {
  const [variables, setVariables] = useState({limit: 10, cursor: null as null | string});
  const [{data, fetching}] = usePostsQuery({
    variables,
  });

  if(!fetching && !data) {
    return <div>You have no posts!</div>;
  }

  return (
    <Layout>

      <Flex align="center">
        <Heading>MyReddit</Heading>
        <NextLink href="/create-post">
          <Link ml="auto" >
            Create Post
          </Link>
        </NextLink>
      </Flex>

      {/* <div>Hello Next-Chakra</div> */}
      <br/>
      {!data && fetching ? 
        <div>Loading...</div> 
        : 
        <Stack spacing={8}>
          {data!.posts.posts.map(p => (
            <Box key={p.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{p.title}</Heading>
              <Text mt={4}>{p.textSnippet}</Text>
            </Box>
            ))
          }
        </Stack>
      }
      {data && data.posts.hasMore  ? 
        (<Flex>
          <Button 
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            isLoading={fetching} m="auto" my={8}>
            Load more
          </Button>
        </Flex>)
        : null
      }
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
