import { Grid,Paper, Avatar, TextField, Button, Typography,Link } from '@material-ui/core'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Welcome } from '../styles/styling';
import axios from 'axios';
import { apiBaseUrl } from '../comp/const';

function Login() {
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    let history = useHistory();
    const onLogIn = async () => {
        try {
            const res = await axios.post(`${apiBaseUrl}/auth/login`, 
                {username, password});
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('uid', res.data.uid); 
            history.push('/dashboard');
        } catch (e) {
            alert(`Status Code ${e.response.status} : ${e.response.data.message}`);
        }
    }
    const paperStyle={padding :'3%', width:'50%', margin:"20px auto"}
    const avatarStyle={backgroundColor:'#1bbd7e'}
    const btnstyle={margin:'3% 0'}
    const gridStyle = {
        height: '100vh',
        placeItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor:'#6d6875',
    }
    return(
        <Grid style={gridStyle} className="font-two">
            <Welcome> Welcome to Stock Overflow </Welcome>
            <Paper elevation={10} style={paperStyle}>
                <Grid align='center'>
                     <Avatar style={avatarStyle}><LockOutlinedIcon/></Avatar>
                    <h2>Log In</h2>
                </Grid>
                <TextField 
                    value = {username} onChange={e => setUsername(e.target.value)}
                    label='Username' placeholder='Enter username' fullWidth required/>
                <br />
                <TextField
                    style={{margin: "1em 0"}}
                    value = {password} onChange={e => setPassword(e.target.value)}
                    label='Password' placeholder='Enter password' type='password' fullWidth required/>
                <br />
                <Button 
                    onClick = {onLogIn}
                    type='submit' color='primary' variant="contained" style={btnstyle} fullWidth>Log in</Button>

                <Typography >
                    Don't have an account? &nbsp;
                    <Link onClick={() => {history.push('/signup')}}>
                    Sign Up Here
                    </Link>
                </Typography>
            </Paper>
        </Grid>
    )
}

export default Login