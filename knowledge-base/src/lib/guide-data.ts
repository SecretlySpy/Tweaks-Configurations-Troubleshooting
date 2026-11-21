import guideDataJson from '../data/guides.generated.json';
import referenceAuditJson from '../../reference-audit.json';

export type OperatingSystem = 'windows' | 'linux' | 'android';
export type GuideCategory = 'tweaks' | 'application-setup' | 'troubleshooting';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type PublicStatus = 'published' | 'review-only' | 'blocked';

export interface GuidePlacement {
  os: OperatingSystem;
  category: GuideCategory;
}

export interface SourceReference {
  title: string;
  url: string;
  relationship: string;
  verificationStatus: string;
}

export type ReferenceAuditStatus =
  | 'verified-primary'
  | 'partially-verified'
  | 'source-only-unverified'
  | 'non-operational-review'
  | 'non-operational-blocked';

export interface SupplementaryReference {
  title: string;
  url: string;
  owner: string;
  relation: string;
}

export interface GuideReferenceAudit {
  guideId: string;
  status: ReferenceAuditStatus;
  scope: string;
  references: SupplementaryReference[];
}

export interface SourceDocument {
  path: string;
  filename: string;
  format: string;
  bytes: number;
  sha256: string;
  tracked: boolean;
  gitRevision: string | null;
  canonicalRole: string;
  extractionStatus: string;
  extractionWarnings: string[];
  pageCount: number | null;
  sourceText: string;
  originalReferences: SourceReference[];
}

export interface GuideMedia {
  id: string;
  filename: string;
  src: string;
  alt: string;
  caption: string;
  width?: number;
  height?: number;
}

export interface GuideTable {
  id: string;
  title: string;
  headers: string[];
  rows: string[][];
}

export interface GuidedStep {
  id: string;
  title: string;
  sourcePath: string;
  content: string;
  mediaIds?: string[];
  tableIds?: string[];
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  summary: string;
  placements: GuidePlacement[];
  compatibility: string;
  risk: RiskLevel;
  publicStatus: PublicStatus;
  sourcePaths: string[];
  annotations: string[];
  keywords: string[];
  readingVersion: string;
  sourceDocuments: SourceDocument[];
  media?: GuideMedia[];
  tables?: GuideTable[];
  guidedSteps: GuidedStep[];
  originalReferences: SourceReference[];
  searchText: string;
}

export interface CoverageSummary {
  discoveredSourceCount: number;
  primarySourceCount: number;
  mappedPrimarySourceCount: number;
  secondaryReviewSourceCount: number;
  guideCount: number;
  publishedGuideCount: number;
  reviewOnlyGuideCount: number;
  blockedGuideCount: number;
  primaryCoveragePercent: number;
}

interface GuideData {
  schemaVersion: number;
  generatedAt: string | null;
  repositoryRevision: string;
  coverage: CoverageSummary;
  guides: Guide[];
}

interface ReferenceAuditData {
  auditedAt: string;
  policy: {
    importantLimit: string;
  };
  guides: GuideReferenceAudit[];
}

export const guideData = guideDataJson as GuideData;
export const guides = guideData.guides;
export const referenceAuditData = referenceAuditJson as ReferenceAuditData;
const referenceAuditsByGuide = new Map(referenceAuditData.guides.map((audit) => [audit.guideId, audit]));

export const operatingSystems: OperatingSystem[] = ['windows', 'linux', 'android'];
export const guideCategories: GuideCategory[] = ['tweaks', 'application-setup', 'troubleshooting'];

export const osLabels: Record<OperatingSystem, string> = {
  windows: 'Windows',
  linux: 'Linux',
  android: 'Android',
};

export const categoryLabels: Record<GuideCategory, string> = {
  tweaks: 'Tweaks Guides',
  'application-setup': 'Application Setup Guides',
  troubleshooting: 'Troubleshooting Guides',
};

export function guideHref(guide: Guide): string {
  return `/guides/${guide.slug}/`;
}

export function guidesForOs(os: OperatingSystem): Guide[] {
  return guides.filter((guide) => guide.placements.some((placement) => placement.os === os));
}

export function guidesForPlacement(os: OperatingSystem, category: GuideCategory): Guide[] {
  return guides.filter((guide) => guide.placements.some(
    (placement) => placement.os === os && placement.category === category,
  ));
}

export function referenceAuditForGuide(guideId: string): GuideReferenceAudit {
  const audit = referenceAuditsByGuide.get(guideId);
  if (!audit) throw new Error(`Missing reference audit for guide: ${guideId}`);
  return audit;
}

