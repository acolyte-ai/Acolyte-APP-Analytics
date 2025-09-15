



export default function HeaderButtonUI({ children }: { children: React.ReactElement }) {
    return (
        <button className="flex items-end justify-end" >
            {children}
        </button>
    )
}