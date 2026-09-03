export const CATEGORIA_LABEL = {
  CPU: 'Processador',
  GPU: 'Placa de video',
  RAM: 'Memoria RAM',
  PLACA_MAE: 'Placa-mae',
  FONTE: 'Fonte de alimentacao',
  GABINETE: 'Gabinete',
  ARMAZENAMENTO: 'Armazenamento',
  PERIFERICO: 'Periferico',
}

export function itemShape(produtoDTO) {
  return {
    id: produtoDTO.id,
    nome: produtoDTO.nome,
    categoria: produtoDTO.categoria,
    preco: produtoDTO.preco,
    linkAfiliado: produtoDTO.linkAfiliado,
    plataforma: produtoDTO.plataforma,
    tipoMemoria: produtoDTO.tipoMemoria,
    destaque: CATEGORIA_LABEL[produtoDTO.categoria] || 'Periferico',
  }
}

export function isMonitor(item) {
  return item.categoria === 'PERIFERICO' && item.nome.startsWith('Monitor')
}
