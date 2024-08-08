// Mostly yoinked from https://codesandbox.io/s/dgnqct?file=/src/js/EmblaCarousel.tsx
import useEmblaCarousel from 'embla-carousel-react'
import React from 'react'

import '@/assets/embla.css'

import { DotButton, useDotButton } from './EmblaCarouselDotButton'

const carouselImages = [
  { src: '/gallery/banana-bread-and-chocolate-loaf.jpg', alt: '' },
  { src: '/gallery/sourdough-loaves.jpg', alt: '' },
  { src: '/gallery/spread.jpg', alt: '' },
  { src: '/gallery/dog.jpg', alt: '' },
]

export const EmblaCarousel: React.FC = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({})

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi)

  return (
    <section className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {carouselImages.map((image, index) => (
            <div className="embla__slide" key={index}>
              <img src={image.src} alt={image.alt} />
            </div>
          ))}
        </div>
      </div>

      <div className="embla__controls">
        <div className="embla__dots">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={'embla__dot'.concat(
                index === selectedIndex ? '--selected' : ''
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
