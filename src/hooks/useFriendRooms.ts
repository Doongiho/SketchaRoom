import { useEffect, useState } from "react"
import { collection, getDocs, doc, getDoc,deleteDoc } from "firebase/firestore"
import { auth, db, } from "../libs/firebase"
import { onAuthStateChanged } from "firebase/auth"

export interface FriendRoom {
  roomId: string
  joinedAt: Date
  name?: string
  ownerName?: string
}

export const useFriendRooms = () => {
  const [rooms, setRooms] = useState<FriendRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError(new Error("User not authenticated"))
        setLoading(false)
        return
      }

      try {
        const snapshot = await getDocs(collection(db, `users/${user.uid}/joinedRooms`))

        const roomPromises = snapshot.docs.map(async (docSnap) => {
          const roomId = docSnap.id
          const joinedAt = docSnap.data().joinedAt?.toDate?.() || new Date()

          const roomRef = doc(db, "rooms", roomId)
          const roomDoc = await getDoc(roomRef)
          const roomData = roomDoc.exists() ? roomDoc.data() : null

          return {
            roomId,
            joinedAt,
            name: roomData?.name ?? roomId,
            ownerName: roomData?.ownerName ?? "알 수 없음",
          }
        })

        const roomList = await Promise.all(roomPromises)
        setRooms(roomList)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  return { rooms, loading, error }
}

export const leaveFriendRoom = async (roomId: string) => {
  const uid = auth.currentUser?.uid
  if (!uid) {
    throw new Error("로그인이 필요합니다.")
  }

  await deleteDoc(doc(db, `users/${uid}/joinedRooms/${roomId}`))
}