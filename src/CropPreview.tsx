import type { Rectangle } from './type'
import { useEffect, useRef } from 'react'
import { cn } from './utils'

export const CropPreview = ({
  className,
  image,
  imageSize,
  cropSize,
}: {
  className?: string
  image: HTMLImageElement | null
  imageSize: Rectangle | null
  cropSize: Rectangle | null
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!canvasRef.current || !image || !imageSize || !cropSize) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const scale = image.naturalWidth / imageSize.width
    const sx = (cropSize.x - imageSize.x) * scale
    const sy = (cropSize.y - imageSize.y) * scale
    const sw = cropSize.width * scale
    const sh = cropSize.height * scale

    canvas.width = cropSize.width
    canvas.height = cropSize.height

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, cropSize.width, cropSize.height)
  }, [image, imageSize, cropSize])
  return (
    <div className={cn('size-full flex justify-center items-center', className)}>
      <canvas className="max-w-full max-h-full" ref={canvasRef} />
    </div>
  )
}
