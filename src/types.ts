import { ReactNode } from 'react';
import { colors } from './theme/colors';

export type Purpose = 'VIP' | 'Admissions' | 'Delivery' | 'Others';
export type VStatus = 'pending' | 'accepted' | 'approved' | 'waiting' | 'rejected' | 'completed' | 'inside' | 'exited';
export type GuardTab = 'home' | 'history' | 'settings';
export type ChairTab = 'queue' | 'history' | 'settings';
export type InchargeTab = 'manage_guards' | 'settings';

export interface Visitor {
  id: string | number;
  tempId: string;
  photoUrl: string;
  name: string;
  purpose: Purpose;
  reason?: string;       // free-text visit purpose (optional, captured via type or speech)
  mobile: string;
  origin: string;
  status: VStatus;
  arrivalTime: Date;
  departureTime?: Date;
  decidedBy?: string;
}

export const C = colors;

export const PURPOSE: Record<Purpose, { icon: string; label: string; color: string; bg: string }> = {
  VIP: { icon: '👑', label: 'VIP', color: '#B8860B', bg: 'rgba(184,134,11,0.12)' },
  Admissions: { icon: '🎓', label: 'Admissions', color: '#2E5AAC', bg: 'rgba(46,90,172,0.12)' },
  Delivery: { icon: '📦', label: 'Delivery', color: '#1E8080', bg: 'rgba(30,128,128,0.12)' },
  Others: { icon: '❓', label: 'Others', color: '#6B6F76', bg: 'rgba(107,111,118,0.12)' },
};

export const STATUS: Record<VStatus, { icon: string; label: string; color: string; bg: string }> = {
  pending: { icon: '⏳', label: 'Pending', color: colors.warning, bg: colors.warningLight },
  accepted: { icon: '✓', label: 'Accepted', color: colors.success, bg: colors.successLight },
  approved: { icon: '✓', label: 'Approved', color: colors.success, bg: colors.successLight },
  waiting: { icon: '⏸', label: 'On Hold', color: colors.warning, bg: colors.warningLight },
  rejected: { icon: '✕', label: 'Denied', color: colors.error, bg: colors.errorLight },
  inside: { icon: '🏢', label: 'Inside', color: colors.success, bg: colors.successLight },
  exited: { icon: '↩', label: 'Exited', color: colors.textMuted, bg: '#F1F5F9' },
  completed: { icon: '↩', label: 'Completed', color: colors.textMuted, bg: '#F1F5F9' },
};

export const WEIGHT: Record<Purpose, number> = { VIP: 1, Admissions: 2, Delivery: 3, Others: 4 };

export function minsAgo(d: Date) {
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
}

export function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function fmtDuration(a: Date, b: Date) {
  const m = Math.floor((b.getTime() - a.getTime()) / 60000);
  if (m < 1) return '< 1m';
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

export function effectivePriority(v: Visitor) {
  return WEIGHT[v.purpose] - minsAgo(v.arrivalTime) / 10;
}

export function genTempId() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function mdate(minsBack: number) {
  return new Date(Date.now() - minsBack * 60000);
}

export const SEED: Visitor[] = [
  { id: 1, tempId: '4821', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', name: 'Rajesh Mehta', purpose: 'VIP', mobile: '9876543210', origin: 'Ministry of Finance', status: 'accepted', arrivalTime: mdate(45), decidedBy: 'Chairman' },
  { id: 2, tempId: '3305', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', name: 'Priya Sharma', purpose: 'Admissions', mobile: '9123456789', origin: 'St. Xavier College', status: 'pending', arrivalTime: mdate(12) },
  { id: 3, tempId: '7190', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', name: 'Ajay Singh', purpose: 'Delivery', mobile: '9988776655', origin: 'BlueDart Courier', status: 'waiting', arrivalTime: mdate(28), decidedBy: 'Chairman' },
  { id: 4, tempId: '6042', photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', name: 'Sunita Rao', purpose: 'Others', mobile: '8877665544', origin: 'Bengaluru', status: 'rejected', arrivalTime: mdate(90), departureTime: mdate(85), decidedBy: 'Chairman' },
  { id: 5, tempId: '2251', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', name: 'Kiran Bhat', purpose: 'VIP', mobile: '7766554433', origin: "Governor's Office", status: 'pending', arrivalTime: mdate(5) },
  { id: 6, tempId: '8834', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop', name: 'Neha Joshi', purpose: 'Admissions', mobile: '6655443322', origin: 'Mumbai University', status: 'completed', arrivalTime: mdate(180), departureTime: mdate(120), decidedBy: 'Chairman' },
  { id: 7, tempId: '1122', photoUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop', name: 'Ramesh Gupta', purpose: 'Delivery', mobile: '5544332211', origin: 'DTDC Express', status: 'pending', arrivalTime: mdate(22) },
];
