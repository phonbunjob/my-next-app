"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function Home() {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    // สร้าง QR ที่ลิงก์ไปหน้า form
    QRCode.toDataURL(`${window.location.origin}/alumni/form`)
      .then(setQrUrl)
      .catch(console.error);
  }, []);

  return (
    <main style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>ยินดีต้อนรับ</h1>
      
      <Link href="/alumni/form">ไปยังแบบฟอร์มกรอกข้อมูลศิษย์เก่า</Link>

      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem' }}>หรือสแกน QR Code</h2>
        {qrUrl && <img src={qrUrl} alt="QR Code to Alumni Form" width={200} height={200} />}
      </div>
    </main>
  );
}