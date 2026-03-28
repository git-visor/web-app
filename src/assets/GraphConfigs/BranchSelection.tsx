import { ChevronDown } from 'lucide-react';
import type { JSX } from 'react'
import type { BranchInfo } from '../ObjectTypes'

interface BranchSelectionProps {
  title: string;
  branches: BranchInfo[];
  currentBranch: string;
  onSelectBranch: (branchName: string) => void;
}

export function BranchSelection({
  title,
  branches,
  currentBranch,
  onSelectBranch,
}: BranchSelectionProps): JSX.Element {
  return (
    <div className="mb-4">
      <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">
        {title}
      </h3>
      <div className="relative">
        <select
          value={currentBranch}
          onChange={(e) => onSelectBranch(e.target.value)}
          className="w-full bg-[#252526] border border-gray-700 text-gray-300 text-xs rounded px-2 py-1.5 appearance-none focus:outline-none focus:border-blue-500/50 pr-8"
        >
          {branches.map((branch) => (
            <option key={branch.name} value={branch.name}>
              {branch.name}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-3 h-3 text-gray-500" />
        </div>
      </div>
    </div>
  );
}