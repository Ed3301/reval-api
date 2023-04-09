import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import axios from 'axios';

const Login = () => {
    const [key, setKey] = useState('');
    const [secret, setSecret] = useState('');

    const handleKeyChange = (event) => {
        setKey(event.target.value);
    };

    const handleSecretChange = (event) => {
        setSecret(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        await axios.get('https://api.example.com/data').then(res => {
            console.log(res);
        }).catch(err => {
            console.log(err);
        })
    };

    return (
        <div className='login-form'>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                    <TextField
                        type="text"
                        label="Key"
                        value={key}
                        onChange={handleKeyChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        type="password"
                        label="Secret"
                        value={secret}
                        onChange={handleSecretChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <Button type="submit" variant="contained" color="primary">
                        Login
                    </Button>
                </form>
        </div>
    );
};

export default Login;