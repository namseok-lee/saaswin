'use client';

import React, { useState, useRef, useEffect } from 'react';

interface InfoModalProps {
  title: string;
  url: string;
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ title, url, isOpen, onClose }) => {

    const modalRef = useRef<HTMLDivElement>(null);

    // 모달 외부 클릭 감지
    const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose(); // 모달 외부 클릭 시 모달 닫기
      }
    };


  if (!isOpen) return null;

  return (
    <div
    onClick={handleClickOutside} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1500,
      }}
    >
      <div
       ref={modalRef}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          // width: "400px",
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '90%',
          height: '80%',
          zIndex: 1800,
        }}
      >
        <iframe
          src={url}
          style={{ width: '100%', height: '100%', zIndex: 2000 }}
        ></iframe>
      </div>
    </div>
  );
};

export default InfoModal;
