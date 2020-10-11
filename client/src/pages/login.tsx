import React from 'react';
import { Formik, Form } from "formik";
import { Box, Button} from '@chakra-ui/core';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';


const Login: React.FC<{}> = ({}) => {
    const [{}, login] = useLoginMutation();
    const router = useRouter();

    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ username: "", password: ""}}
                onSubmit={async (values, {setErrors}) => {
                    const res = await login({options: values})
                    if(res.data?.login.errors) {
                        // [{field: 'username', message: 'someth'}]
                        setErrors(toErrorMap(res.data.login.errors));
                    }else if(res.data?.login.user){
                        router.push("/");
                    }
                    // console.log(res.data?.login.user?.id);
                }}
            >

                {({isSubmitting}) => (
                    <Form>
                        <InputField 
                            name="username"
                            placeholder="username"
                            label="Username"
                        />
                        <Box mt={4}>
                            <InputField 
                                name="password"
                                placeholder="password"
                                label="Password"
                                type="password"
                            />
                        </Box>
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

export default Login
