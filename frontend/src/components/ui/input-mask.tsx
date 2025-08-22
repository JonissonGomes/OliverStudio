import React from 'react';
import { Input } from './input';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

interface InputMaskProps extends Omit<InputProps, 'onChange'> {
  mask: 'phone' | 'currency';
  value: string;
  onChange: (value: string) => void;
}

const applyPhoneMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  // Limita a 11 dígitos (2 DDD + 9 número)
  const limitedNumbers = numbers.slice(0, 11);
  
  if (limitedNumbers.length <= 10) {
    return limitedNumbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return limitedNumbers.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4');
};

const applyCurrencyMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  
  const amount = parseInt(numbers) / 100;
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const InputMask: React.FC<InputMaskProps> = ({ mask, value, onChange, ...props }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (mask === 'phone') {
      const masked = applyPhoneMask(inputValue);
      onChange(masked);
    } else if (mask === 'currency') {
      const masked = applyCurrencyMask(inputValue);
      onChange(masked);
    }
  };

  return (
    <Input
      {...props}
      value={value}
      onChange={handleChange}
    />
  );
};