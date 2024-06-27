import 'keen-slider/keen-slider.min.css'
import { useKeenSlider } from 'keen-slider/react'
import Image from 'next/image'
import { useState } from 'react'

import '../assets/slides.css'

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
          <div className="keen-slider__slide">
            <img
              src="/gallery/babka.jpg"
              alt="Babka"
              className="border-brand-primary rounded-lg border-2 object-cover"
            />
          </div>

          <div className="keen-slider__slide">
            <img
              src="/gallery/babka.jpg"
              alt="Babka"
              className="border-brand-primary rounded-lg border-2 object-cover"
            />
          </div>

          <div className="keen-slider__slide">
            <img
              src="/gallery/babka.jpg"
              alt="Babka"
              className="border-brand-primary rounded-lg border-2 object-cover"
            />
          </div>
        </div>
      </div>
      {loaded && instanceRef.current && (
        <div className="dots">
          {[
            // @ts-ignore
            ...Array(instanceRef.current.track.details.slides.length).keys(),
          ].map((idx) => {
            return (
              <button
                key={idx}
                onClick={() => {
                  instanceRef.current?.moveToIdx(idx)
                }}
                className={'dot' + (currentSlide === idx ? ' active' : '')}
              ></button>
            )
          })}
        </div>
      )}
    </>
  )
}
