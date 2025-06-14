import { collection, getDocs } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../libs/firebase"
import type { Room } from "../stores/useRoomStore"

export const useFriendRooms = (uid?: string | null) => {
  const [friendRooms, setFriendRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetch = async () => {
      if (!uid) return
      setLoading(true)
      setError(null)

      try {
        const snapshot = await getDocs(collection(db, "users", uid, "friendRooms"))
        const rooms: Room[] = snapshot.docs.map((docSnap) => {
        const { name, description, createdBy } = docSnap.data()
            return {
                id: docSnap.id,
                name,
                description,
                createdBy,
            }
        })
        setFriendRooms(rooms)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [uid])

  return { friendRooms, loading, error }
}
