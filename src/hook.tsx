import { useState, useEffect } from 'react'
import type { Rectangle } from './type'

export const useImageCrop = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [imageSize, setImageSize] = useState<Rectangle | null>(null)
  const [cropSize, setCropSize] = useState<Rectangle | null>(null)
  const getCropedImage = async (quality: number = 1): Promise<Blob | null> => {
    if (!image || !imageSize || !cropSize) return null
    const scale = image.naturalWidth / imageSize.width
    const sx = (cropSize.x - imageSize.x) * scale
    const sy = (cropSize.y - imageSize.y) * scale
    const sw = cropSize.width * scale
    const sh = cropSize.height * scale

    const canvas = document.createElement('canvas')
    canvas.width = sw
    canvas.height = sh
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh)

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob)
        },
        quality !== 1 ? 'image/jpeg' : 'image/png',
        quality
      )
    })
  }
  return {
    image,
    setImage,
    imageSize,
    setImageSize,
    cropSize,
    setCropSize,
    getCropedImage,
  }
}
