import React from 'react';
import { Formik, Form } from "formik";
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/core';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';

interface registerProps {

}

const Register: React.FC<registerProps> = ({}) => {
    const [{}, register] = useRegisterMutation();
    const router = useRouter();

    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ username: "", password: ""}}
                onSubmit={async (values, {setErrors}) => {
                    const res = await register(values)
                    if(res.data?.register.errors) {
                        // [{field: 'username', message: 'someth'}]
                        setErrors(toErrorMap(res.data.register.errors));
                    }else if(res.data?.register.user){
                        router.push("/");
                    }
                    // console.log(res.data?.register.user?.id);
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
                                register
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
    
}

export default Register
