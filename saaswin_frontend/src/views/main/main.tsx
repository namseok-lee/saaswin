'use client';
import Image from 'next/image';
import Link from 'next/link';
export default function main() {
  return (
    <div>
      <Link href="/xOA001/OA001--1">
      <Image
        src="/img/main.png"
        alt="main"
        fill
        style={{ objectFit: 'cover' }}
      />
      </Link>
    </div>
  );
}
