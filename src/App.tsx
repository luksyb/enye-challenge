import React, { useState, useEffect, } from "react";
import firebase from "./services/firestore";
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import { Button } from "@material-ui/core";
import Home from "./Home";


const App = () => {
    const [signedIn, setSignedIn] = useState(false);
    const [userId, setUserId] = useState<any>()
    const uiConfig = {
        signInFlow: "popup",
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        callBacks: {
            signInSuccess: () => false
        }
    }

    useEffect(() => {
        const handleAuth = () => {

            firebase.auth().onAuthStateChanged((user) => {
                console.log(user?.uid);
                setUserId(user?.uid);
                window.localStorage.setItem('uid', `${user?.uid}`);
                console.log(userId);
                console.log(window.localStorage.getItem('uid'));
                setSignedIn(!!user);

            })
        }
        handleAuth();
    },
        []);
    const handleLogOut = (event: React.MouseEvent<HTMLElement>) => {
        window.localStorage.clear();
        firebase.auth().signOut()
    }
    if (signedIn === true) {
        return (

            <div>

                <li>
                    <Button onClick={handleLogOut}>Logout</Button>
                </li>

                <div className="container">
                    <Home />
                </div>
            </div>
        );
    } else {
        return (
            <div className='auth text-align-center ml-5'>

                <StyledFirebaseAuth
                    uiConfig={uiConfig}
                    firebaseAuth={firebase.auth()}
                />
            </div>
        )
    }
}
export default App;
