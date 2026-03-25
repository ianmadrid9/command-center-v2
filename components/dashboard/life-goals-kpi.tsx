'use client';

import { useState } from 'react';

export function LifeGoalsKpi() {
  return (
    <div className="card p-5 w-full">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">🎯</span>
        <div>
          <h3 className="font-semibold text-lg">Life Goals</h3>
          <p className="text-sm text-muted">Coming soon</p>
        </div>
      </div>
      <p className="text-muted text-sm">
        Life Goals tracking is being set up.
      </p>
    </div>
  );
}
