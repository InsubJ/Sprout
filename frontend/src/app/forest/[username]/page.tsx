'use client';

import React from 'react';
import { Sanctuary } from '../../sanctuary/[username]/SanctuaryView';
import { NudgeService } from '../../../services/nudgeService';

export interface FriendForestPageProps {
  params: {
    username: string;
  };
  searchParams?: {
    currentUserId?: string;
  };
  customNudgeService?: NudgeService;
}

function FriendForestPage(props: FriendForestPageProps) {
  return <Sanctuary {...props} defaultTab="active" />;
}

export default FriendForestPage as any;
