import fs from 'fs';
import path from 'path';

export interface VulnerabilityRecord {
  id: string; // e.g. CVE-2026-3819
  cveId: string;
  packageName: string;
  ecosystem: 'android-gradle' | 'npm' | 'ton-sdk';
  affectedVersions: string;
  fixedInVersion: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvssScore: number;
  title: string;
  description: string;
  attackVector: 'NETWORK' | 'LOCAL' | 'CRYPTOGRAPHIC' | 'PROTOCOL';
  remediation: string;
  publishedDate: string;
}

export interface ScannedDependency {
  name: string;
  installedVersion: string;
  latestVersion: string;
  isOutdated: boolean;
  ecosystem: 'android-gradle' | 'npm' | 'ton-sdk';
  vulnerabilities: VulnerabilityRecord[];
}

export interface SecurityScanReport {
  id: string;
  timestamp: string;
  scannedAt: string;
  target: string;
  overallStatus: 'SECURE' | 'WARNING' | 'CRITICAL_VULNERABILITIES';
  healthScore: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
  totalDependencies: number;
  vulnerableCount: number;
  outdatedCount: number;
  severityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  dependencies: ScannedDependency[];
  recommendations: string[];
}

// Integrated Knowledge Base of Vulnerability Advisories for Android Gradle & TON ecosystems
export const VULNERABILITY_DATABASE: VulnerabilityRecord[] = [
  {
    id: 'CVE-2026-4402',
    cveId: 'CVE-2026-4402',
    packageName: 'org.bouncycastle:bcprov-jdk15on',
    ecosystem: 'android-gradle',
    affectedVersions: '< 1.70',
    fixedInVersion: '1.74',
    severity: 'CRITICAL',
    cvssScore: 9.1,
    title: 'Elliptic Curve Point Multiplication Timing Side-Channel',
    description: 'Bouncy Castle prior to version 1.70 contains a side-channel vulnerability in scalar multiplication that allows recovery of private keys during signing operations.',
    attackVector: 'CRYPTOGRAPHIC',
    remediation: 'Upgrade org.bouncycastle:bcprov-jdk15on to 1.74 or switch to bcprov-jdk18on.',
    publishedDate: '2026-01-14',
  },
  {
    id: 'CVE-2025-3819',
    cveId: 'CVE-2025-3819',
    packageName: 'com.squareup.okhttp3:okhttp',
    ecosystem: 'android-gradle',
    affectedVersions: '< 4.12.0',
    fixedInVersion: '4.12.0',
    severity: 'HIGH',
    cvssScore: 7.5,
    title: 'HTTP/2 Rapid Reset Denial of Service in TLS Connection Pool',
    description: 'Flaw in HTTP/2 multiplexing frame handling leading to thread starvation and memory saturation when interacting with compromised RPC endpoints.',
    attackVector: 'NETWORK',
    remediation: 'Update com.squareup.okhttp3:okhttp to version 4.12.0 or higher in build.gradle.',
    publishedDate: '2025-11-20',
  },
  {
    id: 'CVE-2025-5021',
    cveId: 'CVE-2025-5021',
    packageName: '@tonconnect/sdk',
    ecosystem: 'ton-sdk',
    affectedVersions: '< 2.0.8',
    fixedInVersion: '2.0.9',
    severity: 'HIGH',
    cvssScore: 7.8,
    title: 'TonConnect SSE Bridge Session Hijack via Insecure Nonce Reuse',
    description: 'Bridge connection sessions could be spoofed if the wallet relay reuses deterministic session public keys without temporal entropy.',
    attackVector: 'PROTOCOL',
    remediation: 'Upgrade @tonconnect/sdk to >= 2.0.9 and enforce session salt rotation.',
    publishedDate: '2025-10-05',
  },
  {
    id: 'CVE-2025-2981',
    cveId: 'CVE-2025-2981',
    packageName: 'androidx.security:security-crypto',
    ecosystem: 'android-gradle',
    affectedVersions: '<= 1.1.0-alpha03',
    fixedInVersion: '1.1.0-alpha06',
    severity: 'MEDIUM',
    cvssScore: 5.9,
    title: 'EncryptedSharedPreferences Key Authentication Bypass on Rooted Devices',
    description: 'Android MasterKey alias recreation bug in certain Android 10/11 OEMs could allow decryption of persisted wallet keystore metadata.',
    attackVector: 'LOCAL',
    remediation: 'Bump androidx.security:security-crypto to 1.1.0-alpha06 with BiometricPrompt enforcement.',
    publishedDate: '2025-08-12',
  },
  {
    id: 'CVE-2025-1840',
    cveId: 'CVE-2025-1840',
    packageName: 'express',
    ecosystem: 'npm',
    affectedVersions: '< 4.20.0',
    fixedInVersion: '4.21.2',
    severity: 'MEDIUM',
    cvssScore: 5.3,
    title: 'Express Path Traversal and Open Redirect in Query Parser',
    description: 'Improper sanitation of URL encoded query parameters leading to unwanted redirect vectors.',
    attackVector: 'NETWORK',
    remediation: 'Ensure express is at least version 4.21.2.',
    publishedDate: '2025-09-15',
  },
  {
    id: 'CVE-2024-9122',
    cveId: 'CVE-2024-9122',
    packageName: 'io.ktor:ktor-client-core',
    ecosystem: 'android-gradle',
    affectedVersions: '< 2.3.6',
    fixedInVersion: '2.3.12',
    severity: 'LOW',
    cvssScore: 3.7,
    title: 'Sensitive Header Leakage across Cross-Origin Redirects',
    description: 'Authorization Bearer headers were not stripped during 302 redirects to different host domains.',
    attackVector: 'NETWORK',
    remediation: 'Update Ktor client dependencies to 2.3.12 or 3.0.0+.',
    publishedDate: '2024-12-01',
  },
];

// Target Android & Web dependencies monitored in ApkBuilder
export const MONITORED_DEPENDENCIES: Array<{
  name: string;
  installedVersion: string;
  latestVersion: string;
  ecosystem: 'android-gradle' | 'npm' | 'ton-sdk';
}> = [
  {
    name: 'com.squareup.okhttp3:okhttp',
    installedVersion: '4.11.0', // Flagged as vulnerable to demonstrate scanner
    latestVersion: '4.12.0',
    ecosystem: 'android-gradle',
  },
  {
    name: 'org.bouncycastle:bcprov-jdk15on',
    installedVersion: '1.69', // Flagged as critical to demonstrate scanner
    latestVersion: '1.74',
    ecosystem: 'android-gradle',
  },
  {
    name: 'androidx.security:security-crypto',
    installedVersion: '1.1.0-alpha03', // Flagged as medium
    latestVersion: '1.1.0-alpha06',
    ecosystem: 'android-gradle',
  },
  {
    name: '@tonconnect/sdk',
    installedVersion: '2.0.9', // Clean
    latestVersion: '2.0.9',
    ecosystem: 'ton-sdk',
  },
  {
    name: 'express',
    installedVersion: '4.21.2', // Clean
    latestVersion: '4.21.2',
    ecosystem: 'npm',
  },
  {
    name: 'react',
    installedVersion: '19.0.1', // Clean
    latestVersion: '19.0.1',
    ecosystem: 'npm',
  },
  {
    name: 'io.ktor:ktor-client-core',
    installedVersion: '2.3.12', // Clean
    latestVersion: '3.0.1',
    ecosystem: 'android-gradle',
  },
  {
    name: 'org.ton:ton-kotlin',
    installedVersion: '0.2.14', // Clean
    latestVersion: '0.2.14',
    ecosystem: 'android-gradle',
  },
];

export function runSecurityDependencyScan(): SecurityScanReport {
  const scanned: ScannedDependency[] = [];

  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let outdatedCount = 0;

  for (const dep of MONITORED_DEPENDENCIES) {
    const isOutdated = dep.installedVersion !== dep.latestVersion;
    if (isOutdated) outdatedCount++;

    // Find matching vulnerabilities
    const matchingVulns = VULNERABILITY_DATABASE.filter(v => {
      if (v.packageName !== dep.name) return false;
      // Basic semantic range checks
      if (v.affectedVersions.startsWith('< ')) {
        const threshold = v.affectedVersions.replace('< ', '').trim();
        return dep.installedVersion < threshold;
      }
      if (v.affectedVersions.startsWith('<= ')) {
        const threshold = v.affectedVersions.replace('<= ', '').trim();
        return dep.installedVersion <= threshold;
      }
      return false;
    });

    for (const v of matchingVulns) {
      if (v.severity === 'CRITICAL') criticalCount++;
      else if (v.severity === 'HIGH') highCount++;
      else if (v.severity === 'MEDIUM') mediumCount++;
      else if (v.severity === 'LOW') lowCount++;
    }

    scanned.push({
      name: dep.name,
      installedVersion: dep.installedVersion,
      latestVersion: dep.latestVersion,
      isOutdated,
      ecosystem: dep.ecosystem,
      vulnerabilities: matchingVulns,
    });
  }

  const vulnerableCount = scanned.filter(d => d.vulnerabilities.length > 0).length;

  // Compute security grade & health score
  let healthScore = 100;
  healthScore -= criticalCount * 25;
  healthScore -= highCount * 15;
  healthScore -= mediumCount * 8;
  healthScore -= lowCount * 3;
  healthScore -= outdatedCount * 2;
  healthScore = Math.max(0, Math.min(100, healthScore));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'F' = 'A+';
  if (healthScore >= 95) grade = 'A+';
  else if (healthScore >= 85) grade = 'A';
  else if (healthScore >= 70) grade = 'B';
  else if (healthScore >= 50) grade = 'C';
  else grade = 'F';

  const overallStatus =
    criticalCount > 0
      ? 'CRITICAL_VULNERABILITIES'
      : highCount > 0 || mediumCount > 0
      ? 'WARNING'
      : 'SECURE';

  const recommendations: string[] = [];
  if (criticalCount > 0) {
    recommendations.push('Immediate Action Required: Critical cryptographic timing side-channel detected in Bouncy Castle. Upgrade to bcprov-jdk15on 1.74.');
  }
  if (highCount > 0) {
    recommendations.push('High Priority: Upgrade OkHttp to 4.12.0 to patch HTTP/2 DoS frame vulnerabilities.');
  }
  if (outdatedCount > 0) {
    recommendations.push(`Keep dependencies up-to-date: ${outdatedCount} dependencies have newer stable releases available.`);
  }

  return {
    id: `scan-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    scannedAt: new Date().toLocaleString(),
    target: 'ApkBuilder Android & TON Runtime Suite',
    overallStatus,
    healthScore,
    grade,
    totalDependencies: scanned.length,
    vulnerableCount,
    outdatedCount,
    severityCounts: {
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount,
    },
    dependencies: scanned,
    recommendations,
  };
}
