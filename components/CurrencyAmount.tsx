import { formatAmount } from '@/lib/calculations';

interface CurrencyAmountProps {
  amount: number;
  currency: string;
  className?: string;
}

export default function CurrencyAmount({ amount, currency, className = '' }: CurrencyAmountProps) {
  return (
    <span className={className}>
      {formatAmount(amount)}
      <span className="text-[0.75em] ml-0.5 opacity-70">{currency}</span>
    </span>
  );
}
