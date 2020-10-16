import React, { useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Link } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import InputField from '../../components/InputField';
import Wrapper from '../../components/Wrapper';
import { toErrorMap } from '../../utils/toErrorMap';
import { useChangePasswordMutation } from '../../generated/graphql';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
// import 


const ChangePassword: NextPage<{token: string}> = ({token}) => {
    const router = useRouter();
    const [, changePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError ] = useState('')
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ newPassword: ""}}
                onSubmit={async (values, {setErrors}) => {
                    const res = await changePassword({
                        newPassword: values.newPassword, 
                        token,
                    });
                    if(res.data?.changePassword.errors) {
                        const errorMap = toErrorMap(res.data.changePassword.errors);
                        if('token' in errorMap){
                            setTokenError(errorMap.token)
                        }

                        setErrors(errorMap);
                    }else if(res.data?.changePassword.user){
                        router.push("/");
                    }
                    // console.log(res.data?.register.user?.id);
                }}
            >

                {({isSubmitting}) => (
                    <Form>
                        <InputField 
                            name="newPassword"
                            placeholder="New Password"
                            label="New password"
                            type="password"
                        />
                        {tokenError ? (
                            <Box>
                                <Box style={{color:"red"}}>{tokenError}</Box>
                                <NextLink href="/forgot-password">
                                    <Link>Click to try again.</Link>
                                </NextLink>
                            </Box>
                            ) 
                            : null}
                        <Button 
                            mt={4} 
                            isLoading={isSubmitting} 
                            type="submit" 
                            variantColor="teal">
                                Change Password
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

ChangePassword.getInitialProps = ({query}) => {
    return {
        token: query.token as string
    }
}

export default withUrqlClient(createUrqlClient)(ChangePassword);