import * as fabric from "fabric"
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "../libs/firebase"

const customProps = ["selectable", "editable"]

const originalToObject = fabric.Object.prototype.toObject
fabric.Object.prototype.toObject = function (propertiesToInclude) {
  return originalToObject.call(this, [
    ...(propertiesToInclude || []),
    ...customProps,
  ])
}

export const saveCanvasState = async (
  roomId: string,
  canvas: fabric.Canvas,
) => {
  const rawJson = canvas.toJSON()
  const jsonString = JSON.stringify(rawJson)

  const docRef = doc(db, "rooms", roomId, "snapshots", "latest")
  await setDoc(docRef, {
    json: jsonString,
    updatedAt: serverTimestamp(),
  })
}

export const loadCanvasState = async (
  roomId: string,
  canvas: fabric.Canvas,
) => {
  const docRef = doc(db, "rooms", roomId, "snapshots", "latest")
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) return

  const data = snapshot.data()

  if (!data.json) return

  try {
    const parsedJson = JSON.parse(data.json)

    canvas.loadFromJSON(parsedJson, () => {
      canvas.requestRenderAll()
    })
  } catch (e) {
    console.error("복원 실패:", e)
  }
}
