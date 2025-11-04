export function BrigadezLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-block ${className}`}>
      <svg viewBox="0 0 320 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="48"
          fontWeight="800"
          fontFamily="Poppins, sans-serif"
          letterSpacing="0.05em"
          stroke="#D4B896"
          strokeWidth="2"
          fill="none"
        >
          BRIGADEZ
        </text>
      </svg>
    </div>
  )
}
