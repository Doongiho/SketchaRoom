import type { UserCredential } from "firebase/auth"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth"
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { auth, db, googleProvider } from "../../libs/firebase"

export const loginWithEmail = async (
  email: string,
  password: string,
): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email, password)
}

export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string,
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  )
  await updateProfile(userCredential.user, { displayName })

  await setDoc(doc(db, "users", userCredential.user.uid), {
    uid: userCredential.user.uid,
    email,
    displayName,
    createdAt: serverTimestamp(),
  })

  return userCredential
}

export const loginWithGoogle = async (): Promise<UserCredential> => {
  const result = await signInWithPopup(auth, googleProvider)
  const user = result.user

  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL || "",
      createdAt: serverTimestamp(),
    },
    { merge: true },
  )

  return result
}

export const getCurrentUserProfile = async () => {
  const currentUser = auth.currentUser
  if (!currentUser) throw new Error("로그인된 사용자가 없습니다.")

  const userRef = doc(db, "users", currentUser.uid)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) throw new Error("사용자 정보가 존재하지 않습니다.")

  return snapshot.data()
}

export const logout = async () => {
  await signOut(auth)
}
