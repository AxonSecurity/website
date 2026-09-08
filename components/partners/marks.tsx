type MarkProps = {
  size?: number
}

export function HackNationMark({ size = 32 }: MarkProps) {
  return (
    <img
      src="/partners/hacknation.png"
      alt=""
      loading="lazy"
      style={{ height: size, width: 'auto' }}
    />
  )
}

export function AwsMark({ size = 32 }: MarkProps) {
  return (
    <img
      src="/partners/aws-startups.png"
      alt=""
      loading="lazy"
      style={{ height: size, width: 'auto' }}
    />
  )
}

export function AnthropicMark({ size = 32 }: MarkProps) {
  return (
    <img
      src="/partners/anthropic.svg"
      alt=""
      loading="lazy"
      style={{ height: size, width: 'auto' }}
    />
  )
}