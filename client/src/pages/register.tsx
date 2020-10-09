import React from 'react';
import { Formik, Form } from "formik";
import { Box, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/core';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';

interface registerProps {

}

const Register: React.FC<registerProps> = ({}) => {
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ username: "", values: ""}}
                onSubmit={(values) => {
                    console.log(values);
                }}
            >

                {(values, handleChange) => (
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
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
    
}

export default Register