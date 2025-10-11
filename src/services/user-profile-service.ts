
'use client';

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export interface UserProfile {
  id: string;
  name?: string;
  language?: string;
  profession?: string;
  interests?: string[];
  lastInteraction?: any;
  memoryNotes?: string;
  createdAt: any;
}

/**
 * Creates or updates a user profile in Firestore.
 *
 * @param db The Firestore instance.
 * @param userId The ID of the user.
 * @param profileData The profile data to set.
 */
export function upsertUserProfile(
  db: Firestore,
  userId: string,
  profileData: Partial<UserProfile>
) {
  const userProfileRef = doc(db, 'users', userId);

  const dataToSet = {
    ...profileData,
    id: userId,
    lastInteraction: serverTimestamp(),
  };

  // Use set with merge to create or update.
  setDocumentNonBlocking(userProfileRef, dataToSet, { merge: true });
}

/**
 * Retrieves a user's profile from Firestore. If it doesn't exist, it creates a new one.
 *
 * @param db The Firestore instance.
 * @param userId The ID of the user.
 * @returns The user's profile.
 */
export async function getOrCreateUserProfile(
  db: Firestore,
  userId: string
): Promise<UserProfile> {
  const userProfileRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userProfileRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  } else {
    const newProfile: UserProfile = {
      id: userId,
      createdAt: serverTimestamp(),
      lastInteraction: serverTimestamp(),
    };
    // Non-blocking write
    setDocumentNonBlocking(userProfileRef, newProfile, { merge: false });
    return newProfile;
  }
}

/**
 * Updates specific fields in a user's profile.
 *
 * @param db The Firestore instance.
 * @param userId The ID of the user.
 * @param updates The fields to update.
 */
export function updateUserProfile(
  db: Firestore,
  userId: string,
  updates: Partial<UserProfile>
) {
  const userProfileRef = doc(db, 'users', userId);
  const dataToUpdate = {
    ...updates,
    lastInteraction: serverTimestamp(),
  };
  updateDocumentNonBlocking(userProfileRef, dataToUpdate);
}
