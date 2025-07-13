// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    User,
    createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async (): Promise<User | null> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        // The signed-in user info.
        const user = result.user;
        // Check if user data already exists
        const userDocRef = doc(db, "users", user.uid);
        // Optionally save or update user data in Firestore
        await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            fullName: user.displayName,
            userType: 'sindico', // default or ask user
            createdAt: new Date(),
        }, { merge: true }); // merge true to avoid overwriting existing data
        
        console.log("User signed in: ", user);
        return user;
    } catch (error) {
        console.error("Error during Google sign-in:", error);
        return null;
    }
}

const createUserWithEmailAndPassword = async (email: string, password: string, fullName: string, userType: string) => {
    const userCredential = await firebaseCreateUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save additional user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: fullName,
        userType: userType,
        createdAt: new Date(),
    });

    return userCredential;
}


export { auth, db, signInWithGoogle, createUserWithEmailAndPassword, signInWithEmailAndPassword };