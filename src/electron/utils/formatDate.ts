export function formatDate(_date:Date|string){
  const date = new Date(_date);

  // Ajusta para fuso brasileiro
  const options = { timeZone: 'America/Sao_Paulo' };
  const local = new Date(date.toLocaleString('en-US', options));

  const dd = String(local.getDate()).padStart(2, '0');
  const mm = String(local.getMonth() + 1).padStart(2, '0');
  const yyyy = local.getFullYear();

  const hh = String(local.getHours()).padStart(2, '0');
  const min = String(local.getMinutes()).padStart(2, '0');
  const ss = String(local.getSeconds()).padStart(2, '0');

  const formatado = `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}hs`;

 return formatado
}