import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Represents a node in a structured group goal proposal.
 * The agent sends this as part of a message's metadata.
 */
export interface ProposalNode {
  title: string;
  role: 'GroupGoal' | 'Item Stack' | 'item' | 'finance' | 'action';
  children?: ProposalNode[];
}

export interface StructureProposal {
  title: string;
  structure: ProposalNode;
  notes?: string[];
}

const ROLE_STYLES: Record<string, { badge: string; indent: string }> = {
  GroupGoal: { badge: 'bg-primary/20 text-primary', indent: '' },
  'Item Stack': { badge: 'bg-accent/20 text-accent-foreground', indent: 'ml-4' },
  item: { badge: 'bg-muted text-muted-foreground', indent: 'ml-8' },
  finance: { badge: 'bg-chart-4/20 text-chart-4', indent: 'ml-4' },
  action: { badge: 'bg-chart-2/20 text-chart-2', indent: 'ml-4' },
};

const ProposalNodeRow: React.FC<{ node: ProposalNode; depth: number }> = ({ node, depth }) => {
  const style = ROLE_STYLES[node.role] || ROLE_STYLES.item;
  const indent = depth * 16; // 1rem per level

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: depth * 0.05 }}
        className="flex items-center gap-2 py-1"
        style={{ paddingLeft: indent }}
      >
        <span className="text-muted-foreground text-xs select-none">•</span>
        <span className="text-sm text-foreground font-medium truncate">{node.title}</span>
        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0', style.badge)}>
          {node.role}
        </span>
      </motion.div>
      {node.children?.map((child, i) => (
        <ProposalNodeRow key={`${child.title}-${i}`} node={child} depth={depth + 1} />
      ))}
    </>
  );
};

interface ProposalOutlineProps {
  proposal: StructureProposal;
}

export const ProposalOutline: React.FC<ProposalOutlineProps> = ({ proposal }) => {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
      <ProposalNodeRow node={proposal.structure} depth={0} />

      {proposal.notes && proposal.notes.length > 0 && (
        <div className="border-t border-border/30 pt-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Notes:</p>
          {proposal.notes.map((note, i) => (
            <p key={i} className="text-xs text-muted-foreground leading-relaxed">
              — {note}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
