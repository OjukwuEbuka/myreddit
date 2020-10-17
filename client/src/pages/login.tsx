import React from 'react';
import { Formik, Form } from "formik";
import { Box, Button, Flex, Link} from '@chakra-ui/core';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';


const Login: React.FC<{}> = ({}) => {
    const [{}, login] = useLoginMutation();
    const router = useRouter();

    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ usernameOrEmail: "", password: ""}}
                onSubmit={async (values, {setErrors}) => {
                    const res = await login(values)
                    if(res.data?.login.errors) {
                        // [{field: 'username', message: 'someth'}]
                        setErrors(toErrorMap(res.data.login.errors));
                    }else if(res.data?.login.user){
                        if(typeof router.query.next === "string") {
                            router.push(router.query.next);
                        } else {
                            router.push("/");
                        }
                    }
                    // console.log(res.data?.login.user?.id);
                }}
            >

                {({isSubmitting}) => (
                    <Form>
                        <InputField 
                            name="usernameOrEmail"
                            placeholder="username or email"
                            label="Username or Email"
                        />
                        <Box mt={4}>
                            <InputField 
                                name="password"
                                placeholder="password"
                                label="Password"
                                type="password"
                            />
                        </Box>
                        <Flex mt={2}>
                            <NextLink href="/forgot-password">
                                <Link ml="auto">Forgot password?</Link>
                            </NextLink>                            
                        </Flex>
                        <Button 
                            mt={4} 
                            isLoading={isSubmitting} 
                            type="submit" 
                            variantColor="teal">
                                login
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
    
}

export default withUrqlClient(createUrqlClient)(Login)
