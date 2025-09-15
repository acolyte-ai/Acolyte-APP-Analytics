import { CreateCustomTest } from "../generating-test/customTest";



interface Props {
    icon: string;
    title: string;
    content: string
}

export default function CardOption({ icon, title, content }: Props) {
    return (
        <CreateCustomTest icon={icon} title={title} content={content} />
    )
}