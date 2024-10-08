const content = [
  {
    question: 'Does Greg actually bake the bread?',
    answer: "Yes! That's why quantities are limited.",
  },
  {
    question: 'When can I place an order?',
    answer: (
      <p>
        Greg will announce when orders open on{' '}
        <a
          href="https://warpcast.com/greg"
          target="_blank"
          className="underline"
        >
          Warpcast
        </a>{' '}
        and{' '}
        <a
          href="https://twitter.com/gregskril"
          target="_blank"
          className="underline"
        >
          Twitter
        </a>
        .
      </p>
    ),
  },
  {
    question: 'Why do I need an account to order?',
    answer:
      'Orders are managed on Base, a blockchain where users need an account in order to transact. This might sound scary but don’t worry, it takes a few seconds to create an account and we’ll walk you through it.',
  },
  {
    question: 'How do I pay for my order?',
    answer: 'You can pay with ETH on Base or a credit card.',
  },
  {
    question: 'How do I get my bread?',
    answer:
      'You will recieve a message from Greg by Friday evening with detailed pickup instructions. Pickup will be in a group setting in Manhattan over the weekend.',
  },
  {
    question: 'Who designed this brand and website?',
    answer: (
      <p>
        Erin! You can find her on{' '}
        <a
          href="https://warpcast.com/erinboo.eth"
          target="_blank"
          className="underline"
        >
          Warpcast
        </a>{' '}
        and{' '}
        <a href="https://x.com/erineboo" target="_blank" className="underline">
          Twitter
        </a>
        .
      </p>
    ),
  },
]

export function Faqs({ className }: { className?: string }) {
  return (
    <div className={className}>
      {content.map(({ question, answer }) => (
        <details
          className="border-brand-primary group border-b py-3 first:border-t"
          key={question}
        >
          <summary className="summary font-pangram flex cursor-pointer items-center justify-between gap-4 text-xl group-open:font-semibold sm:text-2xl">
            <span>{question}</span>
            <Arrow className="min-w-8 group-open:rotate-180" />
          </summary>

          <div className="max-w-3xl pt-2">
            {typeof answer === 'string' ? <p>{answer}</p> : answer}
          </div>
        </details>
      ))}
    </div>
  )
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="17"
      viewBox="0 0 32 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.361542 0.35665C0.475857 0.243597 0.611658 0.153901 0.761167 0.0927012C0.910676 0.0315012 1.07096 0 1.23282 0C1.39469 0 1.55497 0.0315012 1.70448 0.0927012C1.85399 0.153901 1.98979 0.243597 2.10411 0.35665L16.0003 14.0673L29.8965 0.35665C30.011 0.24378 30.1468 0.154246 30.2963 0.0931608C30.4458 0.0320758 30.606 0.000635598 30.7678 0.000635598C30.9296 0.000635598 31.0899 0.0320758 31.2394 0.0931608C31.3889 0.154246 31.5247 0.24378 31.6391 0.35665C31.7535 0.469521 31.8443 0.603517 31.9062 0.75099C31.9681 0.898462 32 1.05652 32 1.21615C32 1.37577 31.9681 1.53383 31.9062 1.6813C31.8443 1.82877 31.7535 1.96277 31.6391 2.07564L16.8716 16.6433C16.7573 16.7564 16.6215 16.8461 16.472 16.9073C16.3225 16.9685 16.1622 17 16.0003 17C15.8385 17 15.6782 16.9685 15.5287 16.9073C15.3792 16.8461 15.2434 16.7564 15.129 16.6433L0.361542 2.07564C0.246939 1.96287 0.156013 1.82891 0.0939737 1.68142C0.0319344 1.53394 0 1.37583 0 1.21615C0 1.05647 0.0319344 0.898354 0.0939737 0.750868C0.156013 0.603382 0.246939 0.469418 0.361542 0.35665Z"
        fill="#0033E6"
      />
    </svg>
  )
}
