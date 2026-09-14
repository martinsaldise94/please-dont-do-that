const ICONS = { high: '❌', medium: '⚠️ ', low: 'ℹ️ ' };
const SEP = '─'.repeat(44);

export function formatHuman(result) {
  const lines = ['', 'PDTD — Scan Results', SEP, ''];

  lines.push(`AI Smell Score:        ${bar(result.scores.aiSmell)} ${result.scores.aiSmell}/100`);
  lines.push(
    `Business Specificity:  ${bar(result.scores.businessSpecificity)} ${result.scores.businessSpecificity}/100`,
  );
  lines.push(`Humanity Score:        ${bar(result.scores.humanity)} ${result.scores.humanity}/100`);
  lines.push('');

  if (result.industry) {
    const { matchedTerms, matchedCategories, missingCategories } = result.industrySignals;
    const total = matchedCategories.length + missingCategories.length;
    lines.push(
      `Industry: ${result.industry} — ${matchedCategories.length}/${total} signal groups matched`,
    );
    if (matchedTerms.length) {
      lines.push(`       ${matchedTerms.slice(0, 6).join(', ')}`);
    }
    lines.push('');
  }

  if (result.issues.length === 0) {
    lines.push('✅  No issues detected.');
  } else {
    lines.push('Issues:');
    for (const issue of result.issues) {
      lines.push(`  ${ICONS[issue.severity]}[${issue.ruleId}] ${issue.message}`);
      if (issue.evidence?.length) {
        lines.push(`       ${issue.evidence.slice(0, 4).join(', ')}`);
      }
    }
  }

  lines.push('');
  lines.push(
    `Engine ${result.engineVersion} · Rules ${result.rulesVersion} · Lang: ${result.detectedLang} · pdtd ${result.pdtdVersion}`,
  );
  lines.push('');

  return lines.join('\n');
}

function bar(score) {
  const filled = Math.round(score / 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled);
}
