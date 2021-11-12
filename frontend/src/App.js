import Login from "./pages/Login";
import {BrowserRouter, Route, Switch} from 'react-router-dom'; 
import Dashboard from "./pages/Dashboard";
import API, { ApiContext } from "./api";
import SignUp from "./pages/SignUp";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";
import Stock from "./pages/Stock";
import './App.css';
import AdminPage from "./admin/AdminPage";
import CelebrityRequestPage from "./celebrity/CelebrityRequestPage";
import Friend from "./pages/Friend";
import DiscoverCelebrityPage from "./celebrity/DiscoverCelebrity";
import { Snackbar } from "@material-ui/core";
import { createContext, useState } from "react";

export const AlertContext = createContext();

function App() {
  const api = new API();
  const [ alertMessage, setAlertMessage ] = useState('');
  const [ showAlert, setShowAlert ] = useState(false);
  // Custom alert function
  const alert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  }
  
  return (
    <ApiContext.Provider value={api}>
      <AlertContext.Provider value={alert}>
        <BrowserRouter>
          <div className="App">
            {/* This is a custom alert component (default alert is ugly) */}
            <Snackbar 
              open={showAlert}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              onClose={() => setShowAlert(false)}
              message={alertMessage}
            />
            <Switch>
              <Route path="/user" component={Friend} /> 
              <Route path="/signup" component={SignUp} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/portfolio/:pid" component={Portfolio} />
              <Route path="/profile" component={Profile} />
              <Route path="/stock/:stockCode" component={Stock} />
              <Route path="/admin" component={AdminPage} />
              <Route path="/celebrity/request" component={CelebrityRequestPage}/>
              <Route path="/celebrity/discover" component={DiscoverCelebrityPage}/>
              <Route path="/" component={Login} />
            </Switch>  
          </div>
        </BrowserRouter>
      </AlertContext.Provider>
    </ApiContext.Provider>
  );
}

export default App;
