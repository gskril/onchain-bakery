'use client'

import Link from 'next/link'

import { buttonStyles } from '@/components/Button'
import { Cart } from '@/components/Cart'
import { DividerOne, DividerTwo } from '@/components/Dividers'
import { EmblaCarousel } from '@/components/EmblaCarousel'
import { Faqs } from '@/components/Faqs'
import { Logo } from '@/components/Logo'
import { NumberOne, NumberThree, NumberTwo } from '@/components/Numbers'
import { Products } from '@/components/Products'
import {
  CircleScribble,
  UnderlineScribble,
  UnderlineScribble2,
} from '@/components/Scribbles'
import { BabkaSticker, BaguetteSticker } from '@/components/Stickers'
import { Tagline } from '@/components/Tagline'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <>
      <Cart />

      <header className="mx-auto grid max-w-[100rem] p-6 sm:p-12 lg:grid-cols-[7fr,4fr] lg:gap-10">
        <img
          src="/misc/hero-line.svg"
          alt=""
          className="short:!hidden extra-tall:translate-y-[unset] extra-tall:top-[45rem] absolute left-0 top-[68%] z-0 hidden w-full translate-y-[-68%] xl:block"
        />

        <div className="flex w-full flex-col justify-between lg:order-2">
          <div />

          <Logo className="max-w-52 pb-4 sm:max-w-60 sm:pb-8 lg:max-w-80" />
          <div className="py-8 pr-0 lg:py-0 lg:pb-1 lg:pr-6 lg:pt-8">
            <span className="font-pangram mb-1 block text-2xl font-extrabold">
              Made with love, built on Ethereum
            </span>

            <p className="max-w-96 text-lg">
              This is Greg. He loves bread and he wants you to love bread too.
              He has baked stuff for you to eat.
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <a
                className={buttonStyles({ className: 'px-8 py-2' })}
                href="#shop"
              >
                Buy Greg's Bread
              </a>

              <Link
                className={buttonStyles({
                  className: 'px-8 py-2 sm:px-4',
                })}
                href="/mint"
              >
                Mint NFT
              </Link>
            </div>
          </div>
        </div>

        <div className="flex max-h-[89svh] justify-center lg:order-1 lg:overflow-hidden">
          <div
            className={cn([
              'aspect-[3/4] h-full rotate-2 scale-95',
              'tall:!scale-[82%] lg:-rotate-3 lg:scale-[80%] xl:-rotate-6 xl:scale-[92%]',
            ])}
          >
            <BabkaSticker
              className={cn([
                'absolute -bottom-10 -left-4 z-10 w-28 -rotate-[60deg]',
                'lg:-bottom-16 lg:-right-8 lg:left-[unset] lg:w-44',
                'xl:-bottom-12 xl:-right-[2.25rem] xl:left-[unset] xl:w-44 xl:-rotate-[50deg]',
                'short:scale-90',
              ])}
            />

            <BaguetteSticker
              className={cn([
                'absolute -right-6 -top-10 z-10 w-28',
                'lg:-right-[unset] lg:-left-8 lg:-top-20 lg:w-44 lg:rotate-[80deg]',
                'xl:-right-[unset] xl:-left-10 xl:-top-28 xl:w-56 xl:rotate-[80deg]',
                'short:scale-90',
              ])}
            />

            <div className="border-brand-primary bg-brand-primary z-0 flex h-full items-center overflow-hidden rounded-lg border-2">
              <EmblaCarousel />
            </div>
          </div>
        </div>
      </header>

      <main>
        <DividerOne />

        <div className="bg-brand-background-secondary">
          <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-12">
            <h2 className="section-title">How it works</h2>

            <UnderlineScribble className="-mt-3 mb-10 pl-2" />

            {(() => {
              const steps = [
                'Order bread',
                'Greg bakes the bread',
                'Pick up bread on the weekend in Manhattan',
              ]

              return (
                <div className="grid max-w-80 gap-12 md:max-w-full md:grid-cols-3">
                  {steps.map((step, index) => (
                    <div className="grid grid-cols-[1fr,4fr]" key={step}>
                      {index === 0 ? (
                        <NumberOne />
                      ) : index === 1 ? (
                        <NumberTwo />
                      ) : (
                        <NumberThree />
                      )}

                      <div className="flex flex-col items-center gap-3">
                        <img src={`/process/${index + 1}.svg`} alt="" />
                        <span className="font-pangram text-center text-lg font-extrabold leading-5">
                          {step}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        </div>

        <div id="shop" />

        <DividerTwo />

        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-12 pt-0 text-center">
          <h2 className="section-title xs:mb-0 mb-10">These are the breads</h2>

          <CircleScribble className="xs:block pointer-events-none -mt-[6.25rem] mb-10 hidden w-[21rem] pl-2 sm:-mt-[6.75rem] sm:w-[34rem]" />

          <Products />
        </div>

        <div className="mx-auto mt-6 flex flex-col items-center">
          <h2 className="section-title mb-2 max-w-lg px-6 text-center sm:mb-3">
            Questions that we thought you might ask
          </h2>

          <UnderlineScribble2 className="w-full max-w-xl px-6" />

          <div className="bg-brand-background-secondary my-8 w-full">
            <Faqs className="mx-auto max-w-7xl px-6 py-6" />
          </div>
        </div>
      </main>

      <Tagline className="mx-auto max-w-96 px-6 pb-12 pt-4" />

      <footer className="bg-brand-primary text-brand-background-secondary flex justify-between gap-4 px-2 py-2 text-sm sm:px-6">
        <span>&copy; 2024 Good Bread by Greg</span>
        <div className="flex gap-4 sm:gap-6">
          <a href="https://x.com/gregskril" target="_blank">
            Twitter &#8599;
          </a>
          <a href="https://warpcast.com/greg" target="_blank">
            Farcaster &#8599;
          </a>
        </div>
      </footer>
    </>
  )
}
