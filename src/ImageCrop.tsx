import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react'
import type { Rectangle } from './type'

type ImageCropProps = {
  image: HTMLImageElement | null
  setImage: React.Dispatch<React.SetStateAction<HTMLImageElement | null>>
  imageSize: Rectangle | null
  setImageSize: React.Dispatch<React.SetStateAction<Rectangle | null>>
  cropSize: Rectangle | null
  setCropSize: React.Dispatch<React.SetStateAction<Rectangle | null>>
  edgeSize?: number
  canvasPadding?: number
  handleSize?: number
  ratio?: number | 'free'
}

export const ImageCrop: React.FC<ImageCropProps> = ({
  image,
  setImage,
  imageSize,
  setImageSize,
  cropSize,
  setCropSize,
  edgeSize = 20,
  canvasPadding = 10,
  handleSize = 10,
  ratio = 'free',
}) => {
  const [initialCropSize, setInitialCropSize] = useState<Rectangle>({ x: 0, y: 0, width: 0, height: 0 })
  const [startPoint, setStartPoint] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [cropMode, setCropMode] = useState<string>('')
  const [imageName, setImageName] = useState<string | null>(null)
  const [dropState, setDropState] = useState<'none' | 'over'>('none')

  const imageRef = useRef<HTMLCanvasElement>(null)
  const cropRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const foundCursorOnCropBox = (mouseX: number, mouseY: number, cropSize: Rectangle) => {
    let toTop = Infinity
    let toBottom = Infinity
    let toLeft = Infinity
    let toRight = Infinity

    if (mouseX >= cropSize.x - edgeSize && mouseX <= cropSize.x + cropSize.width + edgeSize) {
      toTop = Math.abs(mouseY - cropSize.y)
      toBottom = Math.abs(mouseY - (cropSize.y + cropSize.height))
    }
    if (mouseY >= cropSize.y - edgeSize && mouseY <= cropSize.y + cropSize.height + edgeSize) {
      toLeft = Math.abs(mouseX - cropSize.x)
      toRight = Math.abs(mouseX - (cropSize.x + cropSize.width))
    }

    let result = ''
    if (toTop < edgeSize) result += 't'
    if (toBottom < edgeSize) result += 'b'
    if (toLeft < edgeSize) result += 'l'
    if (toRight < edgeSize) result += 'r'
    return result
  }
  const fitImageToCanvas = (image: HTMLImageElement, canvas: HTMLCanvasElement) => {
    let scale = 1.0

    // Set canvas size to match container
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    let width = canvas.clientWidth - edgeSize - canvasPadding * 2
    let height = canvas.clientHeight - edgeSize - canvasPadding * 2

    // Calculate scale to fit image within canvas
    if (image.width > width || image.height > height) {
      scale = Math.min(width / image.width, height / image.height)
    }
    return scale
  }
  const ratioFit = (cropSize: Rectangle) => {
    const newCrop = { ...cropSize }
    if (ratio === 'free') {
      // free ratio, no constraints
      return newCrop
    }
    if (!imageSize) return newCrop

    newCrop.height = newCrop.width / ratio
    // constrain within image bounds
    if (newCrop.x + newCrop.width > imageSize.x + imageSize.width) {
      newCrop.width = imageSize.x + imageSize.width - newCrop.x
      newCrop.height = newCrop.width / ratio
    }
    if (newCrop.y + newCrop.height > imageSize.y + imageSize.height) {
      newCrop.height = imageSize.y + imageSize.height - newCrop.y
      newCrop.width = newCrop.height * ratio
    }

    return newCrop
  }
  const updateWithImg = (image: HTMLImageElement) => {
    const canvas = imageRef.current
    const cropCanvas = cropRef.current
    if (!canvas || !cropCanvas) return

    const scale = fitImageToCanvas(image, canvas)
    // fit both canvases to container
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    cropCanvas.width = cropCanvas.clientWidth
    cropCanvas.height = cropCanvas.clientHeight

    const imageSize = {
      x: (canvas.width - image.width * scale) / 2,
      y: (canvas.height - image.height * scale) / 2,
      width: image.width * scale,
      height: image.height * scale,
    }
    setImage(image)
    setImageSize(imageSize)
    setCropSize(ratioFit(imageSize))
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    const file = 'dataTransfer' in e ? e.dataTransfer.files[0] : (e.target as HTMLInputElement).files?.[0]
    const image = new Image()

    if (!file) return
    image.src = URL.createObjectURL(file)
    image.onload = () => {
      updateWithImg(image)
      setImageName(file.name)
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (image) {
        updateWithImg(image)
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [image, ratio])

  const draw = () => {
    const canvas = cropRef.current
    if (!canvas || !cropSize) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const color = 'rgba(108,108,108,1.0)'
    // Draw cropping rectangle with handles on corners and sides

    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.strokeRect(cropSize.x, cropSize.y, cropSize.width, cropSize.height)
    // draw grid lines inside cropping rectangle
    ctx.beginPath()
    ctx.moveTo(cropSize.x + cropSize.width / 3, cropSize.y)
    ctx.lineTo(cropSize.x + cropSize.width / 3, cropSize.y + cropSize.height)
    ctx.moveTo(cropSize.x + (2 * cropSize.width) / 3, cropSize.y)
    ctx.lineTo(cropSize.x + (2 * cropSize.width) / 3, cropSize.y + cropSize.height)
    ctx.moveTo(cropSize.x, cropSize.y + cropSize.height / 3)
    ctx.lineTo(cropSize.x + cropSize.width, cropSize.y + cropSize.height / 3)
    ctx.moveTo(cropSize.x, cropSize.y + (2 * cropSize.height) / 3)
    ctx.lineTo(cropSize.x + cropSize.width, cropSize.y + (2 * cropSize.height) / 3)
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.stroke()
    // draw handles

    const halfHandle = handleSize / 3

    ctx.fillStyle = color

    // top-left
    ctx.fillRect(cropSize.x - 1, cropSize.y - 1, handleSize, halfHandle)
    ctx.fillRect(cropSize.x - 1, cropSize.y - 1, halfHandle, handleSize)
    // top-right
    ctx.fillRect(cropSize.x + cropSize.width - handleSize + 1, cropSize.y - 1, handleSize, halfHandle)
    ctx.fillRect(cropSize.x + cropSize.width - halfHandle + 1, cropSize.y - 1, halfHandle, handleSize)
    // bottom-right
    ctx.fillRect(cropSize.x + cropSize.width - handleSize + 1, cropSize.y + cropSize.height - halfHandle + 1, handleSize, halfHandle)
    ctx.fillRect(cropSize.x + cropSize.width - halfHandle + 1, cropSize.y + cropSize.height - handleSize + 1, halfHandle, handleSize)
    // bottom-left
    ctx.fillRect(cropSize.x - 1, cropSize.y + cropSize.height - halfHandle + 1, handleSize, halfHandle)
    ctx.fillRect(cropSize.x - 1, cropSize.y + cropSize.height - handleSize + 1, halfHandle, handleSize)
    // top
    ctx.fillRect(cropSize.x + cropSize.width / 2 - halfHandle, cropSize.y - 1, handleSize, halfHandle)
    // right
    ctx.fillRect(cropSize.x + cropSize.width - halfHandle + 1, cropSize.y + cropSize.height / 2 - halfHandle, halfHandle, handleSize)
    // bottom
    ctx.fillRect(cropSize.x + cropSize.width / 2 - halfHandle, cropSize.y + cropSize.height - halfHandle + 1, handleSize, halfHandle)
    // left
    ctx.fillRect(cropSize.x - 1, cropSize.y + cropSize.height / 2 - halfHandle, halfHandle, handleSize)
    // })
  }
  useEffect(() => {
    const canvas = imageRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !imageSize || !ctx) return
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (!image) return
    ctx.drawImage(image, 0, 0, image.width, image.height, imageSize.x, imageSize.y, imageSize.width, imageSize.height)
  }, [image, imageSize])

  useLayoutEffect(() => {
    draw()
  }, [cropSize])

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault()
      // check if mouse is inside crop rectangle
      const canvas = imageRef.current
      if (!canvas || !imageSize || !cropSize) return
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const cursorOnCropBox = foundCursorOnCropBox(mouseX, mouseY, cropSize)
      setStartPoint({ x: mouseX, y: mouseY })
      setInitialCropSize({ ...cropSize })
      if (cursorOnCropBox !== '') {
        setCropMode('resizing-' + cursorOnCropBox)
      } else if (mouseX > cropSize.x && mouseX < cropSize.x + cropSize.width && mouseY > cropSize.y && mouseY < cropSize.y + cropSize.height) {
        setCropMode('dragging')
      } else {
        setCropMode('redefining')
        setCropSize({
          x: mouseX,
          y: mouseY,
          width: 0,
          height: 0,
        })
      }
    },
    [cropSize]
  )
  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault()

      const canvas = cropRef.current
      if (!canvas || !imageSize || !cropSize) return
      const rect = canvas.getBoundingClientRect()
      let mouseX = e.clientX - rect.left
      let mouseY = e.clientY - rect.top

      if (mouseX < imageSize.x) mouseX = imageSize.x
      if (mouseX > imageSize.x + imageSize.width) mouseX = imageSize.x + imageSize.width
      if (mouseY < imageSize.y) mouseY = imageSize.y
      if (mouseY > imageSize.y + imageSize.height) mouseY = imageSize.y + imageSize.height

      const cursorOnCropBox = foundCursorOnCropBox(mouseX, mouseY, cropSize)

      canvas.style.cursor = 'default'

      if (cursorOnCropBox === 't' || cursorOnCropBox === 'b') {
        canvas.style.cursor = 'ns-resize'
      } else if (cursorOnCropBox === 'l' || cursorOnCropBox === 'r') {
        canvas.style.cursor = 'ew-resize'
      } else if (cursorOnCropBox === 'tl' || cursorOnCropBox === 'br') {
        canvas.style.cursor = 'nwse-resize'
      } else if (cursorOnCropBox === 'tr' || cursorOnCropBox === 'bl') {
        canvas.style.cursor = 'nesw-resize'
      } else if (mouseX >= cropSize.x && mouseX <= cropSize.x + cropSize.width && mouseY >= cropSize.y && mouseY <= cropSize.y + cropSize.height) {
        canvas.style.cursor = 'move'
      } else {
        canvas.style.cursor = 'crosshair'
      }

      if (cropMode === '') return
      const limit = handleSize + 2
      const direction = cropMode.split('-')[1] || ''

      setCropSize((prev) => {
        if (!prev) return prev
        let newCrop = { ...prev }
        if (cropMode === 'dragging') {
          let newX = initialCropSize.x + (mouseX - startPoint.x)
          let newY = initialCropSize.y + (mouseY - startPoint.y)

          // constrain within image bounds
          if (newX < imageSize.x) newX = imageSize.x
          if (newY < imageSize.y) newY = imageSize.y
          if (newX + prev.width > imageSize.x + imageSize.width) newX = imageSize.x + imageSize.width - prev.width
          if (newY + prev.height > imageSize.y + imageSize.height) newY = imageSize.y + imageSize.height - prev.height

          newCrop = {
            ...prev,
            x: newX,
            y: newY,
          }
        } else if (cropMode.startsWith('resizing-')) {
          if (ratio === 'free') {
            if (direction.includes('t')) {
              newCrop.height += newCrop.y - mouseY
              newCrop.y = mouseY
            }
            if (direction.includes('b')) {
              newCrop.height = mouseY - newCrop.y
            }
            if (direction.includes('l')) {
              newCrop.width -= mouseX - newCrop.x
              newCrop.x = mouseX
            }
            if (direction.includes('r')) {
              newCrop.width = mouseX - newCrop.x
            }
            if (newCrop.width < limit) {
              newCrop.width = limit
            }

            if (newCrop.height < limit) {
              newCrop.height = limit
            }
          } else {
            if (direction === 'tl') {
              newCrop.width += newCrop.x - mouseX
              newCrop.x = mouseX
              newCrop.height = newCrop.width / ratio
              newCrop.y = initialCropSize.y + (initialCropSize.height - newCrop.height)
            } else if (direction === 't') {
              newCrop.height += newCrop.y - mouseY
              newCrop.y = mouseY
              newCrop.width = newCrop.height * ratio
            } else if (direction === 'tr') {
              newCrop.width = mouseX - newCrop.x

              newCrop.height = newCrop.width / ratio
              newCrop.y = initialCropSize.y + (initialCropSize.height - newCrop.height)
            } else if (direction === 'r' || direction === 'br') {
              newCrop.width = mouseX - newCrop.x
              newCrop.height = newCrop.width / ratio
            } else if (direction === 'b') {
              newCrop.height = mouseY - newCrop.y
              newCrop.width = newCrop.height * ratio
            } else if (direction === 'bl') {
              newCrop.width -= mouseX - newCrop.x
              newCrop.x = mouseX
              newCrop.height = newCrop.width / ratio
            } else if (direction === 'l') {
              newCrop.width -= mouseX - newCrop.x

              newCrop.x = mouseX
              newCrop.height = newCrop.width / ratio
            }
            if (newCrop.width < limit || newCrop.height < limit) {
              return prev
            }
          }
        } else if (cropMode === 'redefining') {
          newCrop.x = Math.min(startPoint.x, mouseX)
          newCrop.y = Math.min(startPoint.y, mouseY)
          newCrop.width = Math.abs(mouseX - startPoint.x)
          newCrop.height = Math.abs(mouseY - startPoint.y)
          if (ratio !== 'free') {
            newCrop.height = newCrop.width / ratio
            if (startPoint.y > mouseY) {
              newCrop.y = startPoint.y - newCrop.height
            }
          }
        }

        // tl corner limit
        if (newCrop.x < imageSize.x) {
          newCrop.x = imageSize.x
        }
        if (newCrop.y < imageSize.y) {
          newCrop.y = imageSize.y
        }
        // tr corner limit
        if (newCrop.x + newCrop.width > imageSize.x + imageSize.width) {
          newCrop.width = imageSize.x + imageSize.width - prev.x
          if (ratio !== 'free') {
            newCrop.height = newCrop.width / ratio
          }
        }

        // br corner limit

        if (newCrop.y + newCrop.height > imageSize.y + imageSize.height) {
          newCrop.height = imageSize.y + imageSize.height - newCrop.y
          if (ratio !== 'free') {
            newCrop.width = newCrop.height * ratio
          }
        }

        // bl corner limit

        return newCrop
      })
    },
    [cropMode, imageSize, cropSize, startPoint, initialCropSize]
  )

  return (
    <div className="size-full relative transparent-bg" onMouseMove={onMouseMove}>
      <canvas className="size-full" ref={imageRef} />
      <canvas
        className={'absolute size-full top-0 left-0 mix-blend-difference ' + (image ? '' : 'opacity-0 pointer-events-none ')}
        ref={cropRef}
        onMouseDown={onMouseDown}
        onMouseUp={() => setCropMode('')}
        onMouseLeave={(e) => {
          // console.log('pointer leave', e)
          setCropMode('')
        }}
        onDoubleClick={(e) => {
          e.preventDefault()
          if (!image) return
          if (ratio === 'free') {
            setCropSize(imageSize)
          } else {
            if (imageSize) {
              let newWidth = imageSize.width
              let newHeight = newWidth / ratio
              if (newHeight > imageSize.height) {
                newHeight = imageSize.height
                newWidth = newWidth * ratio
              }
              setCropSize({
                x: imageSize.x + (imageSize.width - newWidth) / 2,
                y: imageSize.y + (imageSize.height - newHeight) / 2,
                width: newWidth,
                height: newHeight,
              })
            }
          }
        }}
      />
      <input type="file" className="hidden" accept="image/*" onChange={handleFile} ref={inputRef} />
      {!image && (
        <div
          className="absolute top-0 left-0  size-full flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            inputRef.current?.click()
          }}
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDropState('over')
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDropState('none')
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleFile(e)
          }}>
          <div
            className={`p-4 border-2 border-dashed ${
              dropState === 'over' ? 'border-blue-400 text-blue-500' : 'border-gray-400 text-gray-500'
            } bg-gray-50/75 rounded-lg`}>
            Click or Drop Image Here to Crop
          </div>
        </div>
      )}
    </div>
  )
}
