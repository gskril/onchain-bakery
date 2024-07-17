const lgClasses = 'pointer-events-none hidden w-full md:block'
const smClasses = 'pointer-events-none block w-full md:hidden'

export function DividerOne() {
  return (
    <>
      <img src="/misc/divider-1.svg" className={lgClasses} />
      <img src="/misc/divider-1-small.svg" className={smClasses} />
    </>
  )
}

export function DividerTwo() {
  return (
    <>
      <img src="/misc/divider-2.svg" className={lgClasses} />
      <img src="/misc/divider-2-small.svg" className={smClasses} />
    </>
  )
}
