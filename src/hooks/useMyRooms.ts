import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore"
import { useCallback, useEffect, useState } from "react"
import { db } from "../libs/firebase"
import type { Room } from "../stores/useRoomStore"
import { useRoomStore } from "../stores/useRoomStore"

export const useMyRooms = (uid?: string | null) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { setRooms } = useRoomStore()

  const fetchRooms = useCallback(async () => {
    if (!uid) return
    setLoading(true)
    setError(null)

    try {
      const q = query(collection(db, "rooms"), where("createdBy", "==", uid))
      const snapshot = await getDocs(q)
      const rooms: Room[] = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data() as Room
          const userRef = doc(db, "users", data.createdBy)
          const userDoc = await getDoc(userRef)
          const nickname = userDoc.exists()
            ? userDoc.data().displayName
            : "알 수 없음"
          return {
            ...data,
            id: docSnap.id,
            createdByName: nickname,
          }
        }),
      )
      setRooms(rooms)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [uid, setRooms])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  return { loading, error, refetch: fetchRooms }
}
