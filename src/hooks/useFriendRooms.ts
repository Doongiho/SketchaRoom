import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { auth, db } from "../libs/firebase"

export interface FriendRoom {
  roomId: string
  joinedAt: Date
}

export const useFriendRooms = () => {
  const [rooms, setRooms] = useState<FriendRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchFriendRooms = async () => {
      setLoading(true)
      try {
        const uid = auth.currentUser?.uid
        if (!uid) throw new Error("User not authenticated")

        const snapshot = await getDocs(collection(db, `users/${uid}/joinedRooms`))
        const joinedRooms: FriendRoom[] = snapshot.docs.map(doc => ({
          roomId: doc.id,
          joinedAt: doc.data().joinedAt?.toDate?.() || new Date(),
        }))
        setRooms(joinedRooms)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchFriendRooms()
  }, [])

  return { rooms, loading, error }
}
