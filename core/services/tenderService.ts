import type { Tender, TenderStatus, TenderStatusBadge, TenderCounts } from '../types';
import { daysUntil, formatDate } from '../utils/formatters';

/**
 * Returns display metadata for a tender status value.
 */
export function getTenderStatusBadge(status: TenderStatus): TenderStatusBadge {
  switch (status) {
    case 'open':
      return { color: '#10B981', bgColor: 'bg-green-500/10', label: 'Open for Bidding' };
    case 'upcoming':
      return { color: '#3B82F6', bgColor: 'bg-blue-500/10', label: 'Upcoming' };
    case 'closed':
      return { color: '#6B7280', bgColor: 'bg-gray-500/10', label: 'Closed' };
    default:
      return { color: '#6B7280', bgColor: 'bg-gray-500/10', label: 'Unknown' };
  }
}

/**
 * Filter tenders by status. Passing 'all' returns all tenders.
 */
export function filterTenders(tenders: Tender[], status: string): Tender[] {
  if (status === 'all') return tenders;
  return tenders.filter(t => t.status === status);
}

/**
 * Count tenders by each status.
 */
export function getTenderCounts(tenders: Tender[]): TenderCounts {
  return {
    open:     tenders.filter(t => t.status === 'open').length,
    upcoming: tenders.filter(t => t.status === 'upcoming').length,
    closed:   tenders.filter(t => t.status === 'closed').length,
  };
}

/**
 * Generate a plain-text AI-style summary for a given tender.
 */
export function generateTenderSummary(tender: Tender): string {
  const closingFormatted = formatDate(tender.closingDate);
  const remainingDays = daysUntil(tender.closingDate);
  const estimateCr = (tender.estimatedValue / 10_000_000).toFixed(2);
  const estimateCrShort = (tender.estimatedValue / 10_000_000).toFixed(1);

  const bidLine = tender.highestBid
    ? `Current highest bid at ₹${(tender.highestBid / 10_000_000).toFixed(2)}Cr (${((tender.highestBid / tender.estimatedValue) * 100).toFixed(1)}% of estimate).`
    : 'No bids submitted yet.';

  const deadlineLine = tender.status === 'open'
    ? `Currently ${remainingDays} days remaining to submit.`
    : '';

  return `AI Summary for ${tender.tenderNumber}:

🎯 Project Scope: ${tender.category} project valued at ₹${estimateCrShort}Cr for ${tender.title}.

📍 Location & Timeline: Based in ${tender.location}, with bidding closing on ${closingFormatted}. ${deadlineLine}

💰 Financial Analysis: Estimated value ₹${estimateCr}Cr. ${bidLine}`;
}
