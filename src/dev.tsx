import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { ImageCrop } from './ImageCrop'
import { useImageCrop } from './hook'
import './index.css'

const App = () => {
  const { getCropedImage, ...props } = useImageCrop()
  return (
    <div className="p-10 h-[50svh]">
      <ImageCrop {...props} transparentBg={false} ratio={1} />
      <div className="flex gap-4">
        <button
          onClick={async () => {
            const blob = await getCropedImage(0.8)
            if (blob) {
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'cropped-image.jpg'
              a.click()
              URL.revokeObjectURL(url)
            }
          }}>
          Crop Image
        </button>
        <button onClick={() => props.setImage(null)}>Clear Image</button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
