import type { User } from "firebase/auth"
import { onAuthStateChanged } from "firebase/auth"
import { useEffect, useState } from "react"
import { auth } from "../libs/firebase"

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })

    return () => unsubscribe()
  }, [])

  return user
}

export default useAuth
