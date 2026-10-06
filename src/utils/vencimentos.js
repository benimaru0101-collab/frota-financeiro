// Ajuda a calcular quantos dias faltam até o vencimento de um
// documento (data no formato "DD/MM/AAAA", como as telas já usam).

export function diasAteVencimento(dataBR, agora = new Date()) {
  if (!dataBR) return null;
  const [dia, mes, ano] = dataBR.split('/').map(Number);
  if (!dia || !mes || !ano) return null;
  const vencimento = new Date(ano, mes - 1, dia);
  vencimento.setHours(0, 0, 0, 0);
  const hoje = new Date(agora);
  hoje.setHours(0, 0, 0, 0);
  const diffMs = vencimento.getTime() - hoje.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// Documentos vencidos ou vencendo nos próximos `dias` (default 30),
// já com `diasRestantes` calculado e ordenados do mais urgente pro
// menos urgente. Usado tanto no aviso do Dashboard quanto pra decidir
// quais notificações locais agendar.
export function documentosVencendo(documentos, dias = 30, agora = new Date()) {
  return documentos
    .map((d) => ({ ...d, diasRestantes: diasAteVencimento(d.vencimento, agora) }))
    .filter((d) => d.diasRestantes !== null && d.diasRestantes <= dias)
    .sort((a, b) => a.diasRestantes - b.diasRestantes);
}
