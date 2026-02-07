'use client';
import { Auth, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { Firestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const signInWithGoogle = async (auth: Auth, db: Firestore) => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Create or update user profile in Firestore
    const userProfileRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userProfileRef);

    if (!docSnap.exists()) {
      // If profile doesn't exist, create it
      await setDoc(userProfileRef, {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        createdAt: serverTimestamp(),
        lastInteraction: serverTimestamp(),
      });
    }
    // If it exists, we could update `lastInteraction`, but for now, we do nothing.
  } catch (error) {
    console.error("Google Sign-In Error: ", error);
    // You might want to use react-toast to show a user-friendly error
  }
};
