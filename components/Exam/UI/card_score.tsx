

export default function ScoreCard({ children, className }: { children: React.ReactElement, className?: string }) {
    return (
        <div className={`w-full rounded-xl h-auto  dark:bg-[#181A1D] bg-[#F3F4F9] ${className}`}>
            {children}
        </div>
    )
}