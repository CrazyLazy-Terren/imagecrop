import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(
  ...inputs: (
    | string
    | undefined
    | {
        [key: string]: boolean | undefined
      }
  )[]
) {
  return twMerge(clsx(...inputs))
}
