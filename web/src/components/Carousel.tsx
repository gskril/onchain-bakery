import 'keen-slider/keen-slider.min.css'
import { useKeenSlider } from 'keen-slider/react'
import Image from 'next/image'
import { useState } from 'react'

import '../assets/slides.css'

const images = [
  { src: '/gallery/babka.jpg', alt: '' },
  { src: '/gallery/banana-bread-and-chocolate-loaf.jpg', alt: '' },
  { src: '/gallery/banana-bread.jpg', alt: '' },
  { src: '/gallery/chocolate-loaf.jpg', alt: '' },
]

export function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
    created() {
      setLoaded(true)
    },
  })

  return (
    <>
      <div className="navigation-wrapper">
        <div ref={sliderRef} className="keen-slider">
          {images.map((image) => (
            <div key={image.src} className="keen-slider__slide">
              <Image
                src={image.src}
                alt={image.alt}
                width={1200}
                height={1600}
              />
            </div>
          ))}
        </div>
      </div>

      {loaded && instanceRef.current && (
        <div className="dots absolute bottom-4 left-[50%] translate-x-[-50%]">
          {images.map((image, idx) => (
            <button
              key={image.src}
              onClick={() => {
                instanceRef.current?.moveToIdx(idx)
              }}
              className={'dot' + (currentSlide === idx ? ' active' : '')}
            ></button>
          ))}
        </div>
      )}
    </>
  )
}
