import React from 'react';
import Button from '../Button';
import { IcoClose } from '@/assets/Icon';

interface HeaderTitleCloseProps {
  title?: string;
  onClose?: () => void;
  className?: string;
}

const HeaderTitleClose: React.FC<HeaderTitleCloseProps> = ({
  title,
  onClose,
  className
}) => {
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className='btn-close-wrap'>
        {title &&  <p className='btn-close-title'>{title}</p>}
        <Button className='btn-close' >
           <div onClick={handleClose}><IcoClose fill='#666' /></div>
        </Button>
    </div>
  );
};

export default HeaderTitleClose;
