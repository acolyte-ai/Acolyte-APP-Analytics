
interface Props {
    name: string
}
export default function Intro({ name }: Props) {

    return (
        <div className="w-full col-span-12 md:col-span-7 font-bold">
            <p className="xl:text-4xl  text-2xl    font-causten-bold tracking-wider dark:text-white text-[#228367] ">Welcome Back, {name}</p>

        </div>
    )
}