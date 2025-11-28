# React Image Crop

[![npm version](https://img.shields.io/npm/v/@crazylazy/react-image-crop)](https://www.npmjs.com/package/@crazylazy/react-image-crop)
[![downloads](https://img.shields.io/npm/dm/@crazylazy/react-image-crop)](https://www.npmjs.com/package/@crazylazy/react-image-crop)
[![license](https://img.shields.io/npm/l/@crazylazy/react-image-crop)](https://www.npmjs.com/package/@crazylazy/react-image-crop)

## Feature

The package is from my website, [ImageCrop](https://www.crazylazy.xyz/apps/imagecrop?from=github), and is designed to help developers quickly build an image cropping interface in React.

Its interface is as intuitive as those desktop-level image editing tools.

![demo](/demo.gif)

## Installation

```bash
npm install @crazylazy/react-image-crop
```

## Usage

```tsx
import { ImageCrop, useImageCrop } from '@crazylazy/react-image-crop'
const App = () => {
  // The core is used for image cropping.
  const { getCropedImage, ...props } = useImageCrop()
  return (
    <>
      <div className="p-10 h-[50svh]">
        {/* The cropping UI will fill the container. */}
        <ImageCrop {...props} />
      </div>
      <div className="flex gap-4">
        <button
          onClick={async () => {
            // getCropedImage accepts a quality parameter and returns a Blob of the cropped image.
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
    </>
  )
}
```

## Customization

Hidden the background pattern and customize:

```tsx
<ImageCrop {...props} transparentBg>
  <Button>Your Custom Upload Button</Button>
</ImageCrop>
```

Fixed ratio:

```tsx
<ImageCrop {...props} ratio={1} />
```
![ratio](/RatioDemo.gif)

`ImageCrop` component props:

```tsx
type ImageCropProps = {
  image: HTMLImageElement | null
  setImage: React.Dispatch<React.SetStateAction<HTMLImageElement | null>>
  imageSize: Rectangle | null
  setImageSize: React.Dispatch<React.SetStateAction<Rectangle | null>>
  cropSize: Rectangle | null
  setCropSize: React.Dispatch<React.SetStateAction<Rectangle | null>>
  className?: string // custom class names
  edgeSize?: number // the sensitive area size for detecting handle hover
  canvasPadding?: number // padding between image and canvas border
  handleSize?: number // size of the handle bars
  ratio?: number | 'free' // a fixed ratio for cropping box to respect
  transparentBg?: boolean // hide the checkerboard background
  children?: React.ReactNode
}
```

It's developed and tested under the React 19 environment with Tailwind CSS. If the styles are not applied correctly include the CSS file:

```jsx
import '@crazylazy/react-image-crop/dist/index.css'
```
