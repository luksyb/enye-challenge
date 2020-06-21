import firebase from 'firebase'
import "firebase/firestore"
// import "firebase/database"
const firebaseConfig = {
    apiKey: "AIzaSyD4Scm4u9qIniStQWaQWaO9ABAcvivejIU",
    authDomain: "hospital-search-code-challenge.firebaseapp.com",
    databaseURL: "https://hospital-search-code-challenge.firebaseio.com",
    projectId: "hospital-search-code-challenge",
    storageBucket: "hospital-search-code-challenge.appspot.com",
    messagingSenderId: "334045408302",
    appId: "1:334045408302:web:7394e0a439cc953c00c3bf"
};

firebase.initializeApp(firebaseConfig);

// const databaseRef = firebase.database().ref();
// export const searchesRef = databaseRef.child("history")
export default firebase;
