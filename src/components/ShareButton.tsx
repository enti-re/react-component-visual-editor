import { useState } from 'react'
import { CheckIcon, LinkIcon } from './icons'

interface ShareButtonProps {
  onClick: () => void
}

export const ShareButton = ({ onClick }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false)

  const handleClick = () => {
    onClick()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button className={`editor-share-btn${copied ? ' editor-share-btn--copied' : ''}`} onClick={handleClick}>
      {copied ? <CheckIcon /> : <LinkIcon />}
      <span>{copied ? 'Copied!' : 'Share'}</span>
    </button>
  )
}
