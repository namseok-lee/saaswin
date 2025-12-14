'use client';
import Image from 'next/image';
interface Props {
    data: Record<string, any>;
    setData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    setValidation: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}
export default function EvlResult({ data, setData, setValidation }: Props) {
    return <Image src={'/img/evl/evlResult.png'} alt='evlResult' width={1000} height={1000} />;
}
