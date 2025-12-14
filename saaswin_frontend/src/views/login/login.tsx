'use client';
import Image from 'next/image';
import Link from 'next/link';
export default function login() {
  return (
    <div>
      <Link href="/main">
      <Image
        src="/img/login.png"
        alt="login"
        fill
        style={{ objectFit: 'cover' }}
      />
      </Link>
    </div>
  );
}
