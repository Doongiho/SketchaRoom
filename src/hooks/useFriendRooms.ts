import { useEffect, useState } from "react"
import { collection, getDocs, getDoc, doc } from "firebase/firestore"
import { auth, db } from "../libs/firebase"

export interface FriendRoom {
  roomId: string
  joinedAt: Date
  name: string
  ownerName: string
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
    }

    fetchFriendRooms()
  }, [])

  return { rooms, loading, error }
}
