'use client';

import React from 'react';
import { Sanctuary } from './SanctuaryView';

export default function SanctuaryPage({
  params,
  searchParams,
}: {
  params: { username: string };
  searchParams?: { currentUserId?: string };
}) {
  return (
    <Sanctuary
      params={params}
      searchParams={searchParams}
      defaultTab="completed"
    />
  );
}
