import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBEAmUav_CgV1vrwCJYVS5hxFtzr-jljKw",
  authDomain: "boardtarefas-467ae.firebaseapp.com",
  projectId: "boardtarefas-467ae",
  storageBucket: "boardtarefas-467ae.appspot.com",
  messagingSenderId: "578915546677",
  appId: "1:578915546677:web:39272e5ca34c869f8ba37c",
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

export { db };
