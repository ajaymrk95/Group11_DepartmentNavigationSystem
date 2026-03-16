type Props = {
  onClick: () => void
}

export default function LocateButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      title="Show my location"
      className="
        absolute bottom-8 right-8 z-[2000]
        bg-[#e9e4d9] text-[#1a305b]
        p-3.5 rounded-full shadow-lg
        border border-[#547792]/20
        hover:bg-[#fab75a] active:scale-90
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-[#1a305b]
      "
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v2m0 12v2m8-10h-2M6 12H4m8 4a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    </button>
  )
}