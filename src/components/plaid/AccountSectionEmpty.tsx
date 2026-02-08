import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Landmark, TrendingUp, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountSectionEmptyProps {
  sectionType: 'cash' | 'investments' | 'credit';
  onAddAccount: () => void;
  isLoading?: boolean;
}

const sectionConfig = {
  cash: {
    icon: Landmark,
    title: 'No Cash Accounts Linked',
    description: 'Connect your checking and savings accounts to track balances',
    gradient: 'from-primary/20 to-primary/5',
    borderColor: 'border-primary/30',
    hoverBorder: 'hover:border-primary/60',
  },
  investments: {
    icon: TrendingUp,
    title: 'No Investment Accounts',
    description: 'Link your brokerage, IRA, or retirement accounts',
    gradient: 'from-accent/20 to-accent/5',
    borderColor: 'border-accent/30',
    hoverBorder: 'hover:border-accent/60',
  },
  credit: {
    icon: CreditCard,
    title: 'No Credit or Loans',
    description: 'Track your credit cards and loan balances in one place',
    gradient: 'from-warning/20 to-warning/5',
    borderColor: 'border-warning/30',
    hoverBorder: 'hover:border-warning/60',
  },
};

export const AccountSectionEmpty: React.FC<AccountSectionEmptyProps> = ({
  sectionType,
  onAddAccount,
  isLoading = false,
}) => {
  const config = sectionConfig[sectionType];
  const Icon = config.icon;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      onAddAccount();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAddAccount(); } }}
      className={cn(
        "w-full p-4 rounded-xl border-2 border-dashed transition-all text-left group cursor-pointer select-none",
        config.borderColor,
        config.hoverBorder,
        "hover:bg-muted/20",
        isLoading && "opacity-50 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center",
          config.gradient
        )}>
          <Icon className="w-5 h-5 text-foreground/70" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {config.title}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {config.description}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-muted/30 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-all">
          <Plus className={cn("w-4 h-4", isLoading && "animate-pulse")} />
        </div>
      </div>
    </motion.div>
  );
};
