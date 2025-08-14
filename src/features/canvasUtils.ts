import type {
  ImageProps,
  ObjectEvents,
  SerializedImageProps,
  TOptions,
} from "fabric"
import {
  Canvas as FabricCanvas,
  Image as FabricImage,
  util,
  type FabricObject,
} from "fabric"

/** 화면 해상도 */
export const BASE_W = 1024
export const BASE_H = 768

/** 모바일/세로 감지 + 알림 */
export function isMobile(): boolean {
  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0
  return touch && Math.max(window.innerWidth, window.innerHeight) <= 1024
}
export function isPortrait(): boolean {
  if (window.matchMedia) {
    const mq = window.matchMedia("(orientation: portrait)")
    if (typeof mq.matches === "boolean") return mq.matches
  }
  return window.innerHeight >= window.innerWidth
}
export function promptLandscapeOnce(): void {
  if (sessionStorage.getItem("landscapePrompted") === "1") return
  sessionStorage.setItem("landscapePrompted", "1")
  alert("화면을 가로로 돌려주세요!")
}

/** FabricImage.toObject에 src 포함 & 모든 오브젝트에 id 포함 */
export function extendToObjectWithId<T extends FabricObject>(klass: {
  prototype: T
}) {
  const originalToObject = klass.prototype.toObject
  klass.prototype.toObject = function (
    this: T,
    propertiesToInclude?: (keyof T)[],
  ): Record<string, unknown> {
    const base = originalToObject.call(this, propertiesToInclude)
    const hasGetSrc =
      this instanceof FabricImage &&
      typeof (this as unknown as { getSrc?: () => string }).getSrc ===
        "function"
    return {
      ...base,
      id: (this as unknown as { id?: string }).id,
      ...(hasGetSrc
        ? { src: (this as unknown as { getSrc: () => string }).getSrc() }
        : {}),
    }
  }
}

/** FabricImage.fromObject 안전 오버라이드 (이미지 복원) */
export function ensureImageFromObjectOnce(): void {
  const FI = FabricImage as unknown as {
    fromObjectRegistered?: boolean
    fromObject: <T extends TOptions<SerializedImageProps>>(
      obj: T,
    ) => Promise<
      FabricImage<
        Omit<T, "src" | "filters" | "resizeFilter" | "type" | "crossOrigin"> &
          Partial<ImageProps>,
        SerializedImageProps,
        ObjectEvents
      >
    >
  }
  if (FI.fromObjectRegistered) return
  FI.fromObject = async <T extends TOptions<SerializedImageProps>>(obj: T) => {
    const src = (obj as { src?: string }).src
    if (typeof src !== "string") throw new Error("'src'가 없습니다.")
    const img = document.createElement("img")
    img.crossOrigin = "anonymous"
    img.src = src
    await new Promise<void>((res, rej) => {
      img.onload = () => res()
      img.onerror = () => rej(new Error("이미지 로드 실패"))
    })
    return new FabricImage(img, obj as Partial<ImageProps>)
  }
  FI.fromObjectRegistered = true
}

/** 객체 배열 enliven */
export function enlivenObjectsAsync<T extends object>(
  objects: T[],
): Promise<FabricObject[]> {
  return util.enlivenObjects(objects)
}

/** 뷰 크기에 맞춰 zoom/센터 정렬 + 캔버스 픽셀 크기 맞춤 */
export function fitToWindow(
  canvas: FabricCanvas,
  wrapperEl: HTMLElement,
): void {
  const viewW = wrapperEl.clientWidth
  const viewH = wrapperEl.clientHeight

  canvas.setWidth(viewW)
  canvas.setHeight(viewH)

  const zoom = Math.min(viewW / BASE_W, viewH / BASE_H) || 1
  const tx = (viewW - BASE_W * zoom) / 2
  const ty = (viewH - BASE_H * zoom) / 2
  canvas.setViewportTransform([zoom, 0, 0, zoom, tx, ty])

  canvas.requestRenderAll()
}
