'use client';

import { useState } from 'react';
import { ManualTask } from '@/types';
import CurrencyAmount from '@/components/CurrencyAmount';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

const CATEGORY_PRESETS = ['Meeting', 'PR Review', 'Planning', 'Documentation', 'Other'];

interface ManualTasksProps {
  tasks: ManualTask[];
  contributors: string[];
  ratePerPoint: number;
  currency: string;
  onAdd: (task: ManualTask) => void;
  onRemove: (id: string) => void;
  onUpdatePoints: (id: string, points: number) => void;
  onToggleExclude: (id: string) => void;
}

export default function ManualTasks({
  tasks,
  contributors,
  ratePerPoint,
  currency,
  onAdd,
  onRemove,
  onUpdatePoints,
  onToggleExclude,
}: ManualTasksProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [contributor, setContributor] = useState(contributors[0] ?? '');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORY_PRESETS[0]);
  const [points, setPoints] = useState('');

  const handleAdd = () => {
    const pts = parseFloat(points);
    if (!contributor || !description || isNaN(pts) || pts <= 0) return;

    onAdd({
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      contributor,
      description,
      category,
      points: pts,
      excluded: false,
    });

    setDescription('');
    setPoints('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const totalTaskPoints = tasks.filter((t) => !t.excluded).reduce((sum, t) => sum + t.points, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Manual Tasks</h2>
          {tasks.length > 0 && (
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
              {totalTaskPoints} pts
            </span>
          )}
        </div>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
          >
            <Plus size={15} />
            Add Task
          </button>
        )}
      </div>

      {/* Add task form */}
      {isAdding && (
        <div className="border border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-4 mb-4 bg-blue-50/30 dark:bg-blue-950/20">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <select
              value={contributor}
              onChange={(e) => setContributor(e.target.value)}
              className="sm:col-span-3 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {contributors.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="sm:col-span-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {CATEGORY_PRESETS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Description"
              className="sm:col-span-4 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pts"
              min="0"
              step="0.5"
              className="sm:col-span-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center font-mono"
            />
            <div className="sm:col-span-2 flex gap-2">
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 px-3 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task list */}
      {tasks.length > 0 && (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 py-2.5 group ${task.excluded ? 'opacity-40' : ''}`}
            >
              <button
                onClick={() => onToggleExclude(task.id)}
                className="shrink-0 transition-colors"
              >
                {task.excluded ? (
                  <Circle size={16} className="text-gray-300 dark:text-gray-600 hover:text-gray-500" />
                ) : (
                  <CheckCircle2 size={16} className="text-emerald-500 hover:text-emerald-600" />
                )}
              </button>

              <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 shrink-0">
                {task.category}
              </span>

              <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1" title={task.description}>
                {task.description}
              </span>

              <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                {task.contributor}
              </span>

              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={task.points}
                onChange={(e) => {
                  const pts = parseFloat(e.target.value);
                  if (!isNaN(pts) && pts >= 0) onUpdatePoints(task.id, pts);
                }}
                className="w-14 px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center font-mono shrink-0"
              />

              <span className="text-sm font-mono tabular-nums text-gray-700 dark:text-gray-300 w-20 text-right shrink-0">
                <CurrencyAmount amount={task.points * ratePerPoint} currency={currency} />
              </span>

              <button
                onClick={() => onRemove(task.id)}
                className="shrink-0 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {tasks.length === 0 && !isAdding && (
        <p className="text-sm text-gray-400 dark:text-gray-600">
          No manual tasks yet. Add tasks like meeting time, PR reviews, etc.
        </p>
      )}
    </div>
  );
}
