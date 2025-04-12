import { Card } from '@/components/ui/card';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Layers, ArrowDownIcon, ArrowUpIcon, ZapIcon, SmartphoneIcon, ShoppingCart } from 'lucide-react';

interface Transaction {
  id: number;
  amount: number;
  timestamp: string;
  senderName: string;
  receiverName: string;
  isIncoming: boolean;
  type: string;
  note?: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  showDetails?: boolean;
}

export function TransactionCard({ transaction, showDetails = false }: TransactionCardProps) {
  const { isIncoming, amount, timestamp, senderName, receiverName, type, id } = transaction;
  
  // Determine transaction icon and colors based on type
  let icon = <ArrowUpIcon />;
  let bgColor = 'bg-red-100';
  let textColor = 'text-red-600';
  let description = '';
  
  if (isIncoming) {
    icon = <ArrowDownIcon />;
    bgColor = 'bg-green-100';
    textColor = 'text-green-600';
    description = `Received from ${senderName}`;
  } else if (type === 'transfer') {
    icon = <ArrowUpIcon />;
    bgColor = 'bg-red-100';
    textColor = 'text-red-600';
    description = `Sent to ${receiverName}`;
  } else if (type === 'bill') {
    icon = <ZapIcon />;
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-600';
    description = 'Electricity Bill';
  } else if (type === 'recharge') {
    icon = <SmartphoneIcon />;
    bgColor = 'bg-blue-100';
    textColor = 'text-blue-600';
    description = 'Mobile Recharge';
  } else if (type === 'shopping') {
    icon = <ShoppingCart />;
    bgColor = 'bg-purple-100';
    textColor = 'text-purple-600';
    description = 'Online Shopping';
  }

  return (
    <div className="p-6 flex items-center border-b border-neutral-200 last:border-b-0">
      <div className="h-12 w-12 rounded-full flex items-center justify-center mr-4">
        <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center ${textColor}`}>
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-800">{description}</p>
        <p className="text-xs text-neutral-500">
          {formatDateTime(timestamp)}
          {showDetails && ` • TX${id}`}
        </p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-medium ${isIncoming ? 'text-green-600' : 'text-red-600'}`}>
          {isIncoming ? '+' : '-'}₹{formatCurrency(amount)}
        </p>
        <p className="text-xs text-neutral-500">Completed</p>
      </div>
    </div>
  );
}
