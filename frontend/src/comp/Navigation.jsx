import React from 'react'; 
import { useHistory } from 'react-router';
import {Link} from 'react-router-dom';
import { ApiContext } from '../api';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import {NavBar, Logo, LogoutButton, FlexRows } from '../styles/styling';
import { Button } from '@material-ui/core';
import {TextInput} from "../styles/styling"; 
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Switch from '@mui/material/Switch';
import Autocomplete from '@mui/material/Autocomplete';



const label = { inputProps: { 'aria-label': 'toggle' } };

const Navigation = () => {
    const api = React.useContext(ApiContext);
    const history = useHistory();

    // const [query, setQuery] = React.useState('');
    const [queryRes, setRes] = React.useState([]);
    // textinput state
    const [search, setSearch ] = React.useState("");
    const [currCode, setCode] = React.useState("");

    var request = require('request');

    // replace the "demo" apikey below with your own key from https://www.alphavantage.co/support/#api-key
    var url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${search}&apikey=59SO8FIM49NYQS21`;

   // handle logout
   const onLogOut = async () => {
    const token = localStorage.getItem('token');
    const resp = await api.authLogout(token);
    if (resp.status === 403) alert('Invalid token');
    if (resp.status === 200) {
        alert('Token has been invalidated');
        history.push('/');
    } else {
        alert(`Server returned unexpected status code of ${resp.status}`);
    }
  }

    // handle search submission 
    const searchBar = async(e) =>{
        e.preventDefault(); 
        request.get({
            url: url,
            json: true,
            headers: {'User-Agent': 'request'}
        }, (err, res, data) => {
            if (err) {
            console.log('Error:', err);
            } else if (res.statusCode !== 200) {
            console.log('Status:', res.statusCode);
            } else {
            // data is successfully parsed as a JSON object:
            const response =  data.bestMatches;

            if (response){
                const newList = []; 
                response.forEach((obj) => {
                    newList.push({
                        code: obj["1. symbol"],
                        name: obj["2. name"]
                    });
                })
                setRes(newList);
            }
            }
        });
    }
    
    const submitQuery = () => {
        history.push(`/stock/${currCode}`);
    }

    return (
        <NavBar>
            <Link to="/dashboard">
                <Logo>
                    Stock Overflow 
                </Logo>
            </Link>
            friends
            <Switch {...label} defaultChecked />
            stocks
            <FlexRows style={{margin:'1%', background:'white', justifyContent:'center'}}>
            <Autocomplete
                disablePortal
                options={queryRes.map((e)=> e.code+" "+ e.name)}
                sx={{ width: 300 }}
                inputValue={search}
                onInputChange={(e,v) => {
                    setSearch(v);
                    var code = v.split(" ")[0];
                    setCode(code); 
                }}
                renderInput={(params) => (
                <TextInput 
                    {...params} 
                    label="Search Stock" 
                    onKeyDown={e => {
                        if (e.keyCode === 13 && e.target.value) {
                            searchBar(e);
                        }
                    }}
                />)}
            />
            <IconButton type="submit" sx={{p:'10px'}} onClick={submitQuery}>
                <SearchIcon />
            </IconButton>
            </ FlexRows> 
            <FlexRows style={{padding:"1%"}}>
                <Link to="/profile">
                    <Button>
                        Edit Profile
                    </Button>
                </Link>
                <LogoutButton 
                    name="logOut"
                    startIcon={<ExitToAppRoundedIcon />}
                    onClick={onLogOut}
                >
                    Log Out
                </LogoutButton >
            </FlexRows>
        </NavBar>
    );
};

export default Navigation;