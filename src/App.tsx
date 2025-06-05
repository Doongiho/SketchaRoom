import { onAuthStateChanged } from "firebase/auth"
import { useEffect } from "react"
import { auth } from "./libs/firebase"
import AppRouter from "./routes/AppRouter"
import { useUserStore } from "./stores/useUserStore"
import { GlobalStyle } from "./styles/GlobalStyle"

function App() {
  const setUser = useUserStore((state) => state.setUser)
  const clearUser = useUserStore((state) => state.clearUser)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email ?? "",
          displayName: user.displayName ?? "",
          photoURL: user.photoURL ?? "",
        })
      } else {
        clearUser()
      }
    })

    return () => unsubscribe()
  }, [setUser, clearUser])

  return (
    <>
      <GlobalStyle />
      <AppRouter />
    </>
  )
}

export default App
