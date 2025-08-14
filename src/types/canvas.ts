import type { Object as FabricObject } from "fabric"

/** Fabric Object에 선택적 id 부여 */
export type WithId<T extends FabricObject = FabricObject> = T & { id?: string }

/** id 타입가드 */
export function hasId(obj: FabricObject): obj is WithId {
  return typeof (obj as { id?: unknown }).id === "string"
}

/** WebSocket 메시지 타입들 */
export interface WsJoinMsg {
  type: "join-room"
  roomId: string
  name: string
}
export interface WsUserListMsg {
  type: "user-list"
  payload: string[]
}
export interface WsAddObjectMsg {
  type: "add-object"
  roomId: string
  payload: Record<string, unknown>
}
export interface WsDeleteObjectMsg {
  type: "delete-object"
  roomId: string
  payload: { id: string }
}
export interface WsUpdatePayload {
  id: string
  left?: number
  top?: number
  angle?: number
  scaleX?: number
  scaleY?: number
  fill?: string
}
export interface WsUpdateObjectMsg {
  type: "update-object"
  roomId: string
  payload: WsUpdatePayload
}
export type WsInbound =
  | WsUserListMsg
  | WsAddObjectMsg
  | WsDeleteObjectMsg
  | WsUpdateObjectMsg
