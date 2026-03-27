import React from 'react';
import { Landmark, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenPlaid: () => void;
  onOpenFinicity: () => void;
  onOpenManualAccount: () => void;
  onOpenManualCashflow: () => void;
  isPlaidLoading: boolean;
  isFinicityLoading: boolean;
  finicityEnabled: boolean;
}

interface OptionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'muted';
}

const AccountOption: React.FC<OptionProps> = ({
  title,
  description,
  icon,
  onClick,
  disabled = false,
  tone = 'muted',
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60',
      tone === 'primary'
        ? 'border-primary/20 bg-primary/10 text-foreground hover:bg-primary/15'
        : 'border-border/30 bg-muted/30 text-foreground hover:bg-muted/50',
    )}
  >
    <div
      className={cn(
        'mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border',
        tone === 'primary'
          ? 'border-primary/20 bg-primary/10 text-primary'
          : 'border-border/30 bg-background/70 text-muted-foreground',
      )}
    >
      {icon}
    </div>
    <div className="space-y-1">
      <div className="text-sm font-medium">{title}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </button>
);

export const AccountLinkDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  onOpenPlaid,
  onOpenFinicity,
  onOpenManualAccount,
  onOpenManualCashflow,
  isPlaidLoading,
  isFinicityLoading,
  finicityEnabled,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
          <DialogDescription>
            Choose how you want to connect or add an account for projections.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <AccountOption
            title={isPlaidLoading ? 'Opening Plaid...' : 'Link with Plaid'}
            description="Use Plaid for supported bank and brokerage connections."
            icon={<Landmark className="h-4 w-4" />}
            onClick={onOpenPlaid}
            disabled={isPlaidLoading}
            tone="primary"
          />

          {finicityEnabled && (
            <AccountOption
              title={isFinicityLoading ? 'Opening Finicity...' : 'Link with Finicity'}
              description="Use Mastercard Data Connect for institutions outside the Plaid path."
              icon={<Landmark className="h-4 w-4" />}
              onClick={onOpenFinicity}
              disabled={isFinicityLoading}
            />
          )}

          <AccountOption
            title="Add Manual Account"
            description="Enter an account balance directly when linking is not available."
            icon={<Plus className="h-4 w-4" />}
            onClick={onOpenManualAccount}
          />

          <AccountOption
            title="Manual Cashflow"
            description="Add recurring income or expenses that should affect projections."
            icon={<Plus className="h-4 w-4" />}
            onClick={onOpenManualCashflow}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
