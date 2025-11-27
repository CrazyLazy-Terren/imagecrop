## Feature

It's package is absctacted from my website [ImageCrop](https://www.crazylazy.xyz/apps/imagecrop?from=github) to help developers quickly build an image cropping interface in React.

It provides an interface that is as intuitive as that of other desktop-level image editing tools.

![demo](/demo.gif)

## Installation

```bash
npm install @crazylazy/react-image-crop
```

## Usage

```tsx
import { ImageCrop } from '@crazylazy/react-image-crop'
const App = () => {
  // logic core for image cropping
  const { getCropedImage, ...props } = useImageCrop()
  return (
    <div className="p-10 h-[50svh]">
      {/* cropping UI, it will fill the container */}
      <ImageCrop {...props} />
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
```

`ImageCrop` component props:

```ts
type ImageCropProps = {
  image: HTMLImageElement | null
  setImage: React.Dispatch<React.SetStateAction<HTMLImageElement | null>>
  imageSize: Rectangle | null
  setImageSize: React.Dispatch<React.SetStateAction<Rectangle | null>>
  cropSize: Rectangle | null
  setCropSize: React.Dispatch<React.SetStateAction<Rectangle | null>>
  edgeSize?: number // the sensitive area size for detecting handle hover
  canvasPadding?: number // padding between image and canvas border
  handleSize?: number // size of the handle bars
  ratio?: number | 'free' // a fixed ratio for cropping box to respect
}
```

If the styles are not applied correctly include the CSS file:

```jsx
import '@crazylazy/react-image-crop/dist/index.css'
```
