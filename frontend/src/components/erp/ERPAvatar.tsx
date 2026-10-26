interface ERPAvatarProps {
  avatarUrl?: string | null
  initials: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { outer: 'w-7 h-7', text: 'text-[10px]' },
  md: { outer: 'w-8 h-8', text: 'text-xs' },
  lg: { outer: 'w-10 h-10', text: 'text-sm' },
}

export default function ERPAvatar({ avatarUrl, initials, size = 'md' }: ERPAvatarProps) {
  const { outer, text } = sizes[size]
  return (
    <div className={`${outer} rounded-full border border-[#FF6B35]/30 overflow-hidden flex-shrink-0`}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={initials} className="w-full h-full object-cover" />
      ) : (
        <div className={`w-full h-full bg-[#FF6B35]/20 flex items-center justify-center ${text} font-semibold text-[#FF6B35]`}>
          {initials}
        </div>
      )}
    </div>
  )
}
