import type { UserCredential } from "firebase/auth"
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth"
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"
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

export const handlePasswordUpdate = async (
  oldPassword: string,
  newPassword: string,
) => {
  const user = auth.currentUser
  if (!user || !user.email) throw new Error("사용자 정보가 없습니다.")

  const credential = EmailAuthProvider.credential(user.email, oldPassword)
  await reauthenticateWithCredential(user, credential)
  await updatePassword(user, newPassword)
}

export const logout = async () => {
  await signOut(auth)
}

export const deleteAccount = async (): Promise<void> => {
  const user = auth.currentUser
  if (!user) throw new Error("로그인된 사용자가 없습니다.")

  await deleteDoc(doc(db, "users", user.uid))

  await deleteUser(user)
}
