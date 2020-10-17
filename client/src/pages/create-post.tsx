import React from "react";
import { Formik, Form } from "formik";
import { Box, Button } from '@chakra-ui/core';
// import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
// import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
// import NextLink from 'next/link';
import { useCreatePostMutation } from "../generated/graphql";
import { Layout } from '../components/Layout';
import { useIsAuth } from "../utils/useIsAuth";

const CreatePost: React.FC<{}> = ({}) => {
    const router = useRouter();
    const [, createPost] = useCreatePostMutation();
    useIsAuth();
    return(
        <Layout variant="small">
            <Formik
                initialValues={{ title: "", text: ""}}
                onSubmit={async (values) => {
                    const res = await createPost({input: values})
                    if(!res.error) {
                        router.push("/");
                    }
                    // else if(res.data?.login.user){
                    // }
                    // console.log(res.data?.login.user?.id);
                }}
            >

                {({isSubmitting}) => (
                    <Form>
                        <InputField 
                            name="title"
                            placeholder="Title"
                            label="Title"
                        />
                        <Box mt={4}>
                            <InputField 
                                textarea
                                name="text"
                                placeholder="Text..."
                                label="Body"
                            />
                        </Box>
                        <Button 
                            mt={4} 
                            isLoading={isSubmitting} 
                            type="submit" 
                            variantColor="teal">
                                Create Post
                        </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient)(CreatePost);