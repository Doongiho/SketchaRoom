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
  console.log("저장할 캔버스 JSON", rawJson)
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

    console.log("복원 대상 JSON", parsedJson)

    canvas.loadFromJSON(parsedJson, () => {
      canvas.requestRenderAll()
      console.log("캔버스 복원 및 렌더 완료")
    })
  } catch (e) {
    console.error("복원 실패:", e)
  }
}
