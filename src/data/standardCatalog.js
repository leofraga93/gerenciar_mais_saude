/**
 * Catálogo Mestre Padrão de Procedimentos Médicos e Exames.
 * Referência: Arquitetura de catálogo e dados.txt (Lauro de Freitas e Região Metropolitana).
 * Permite autopreenchimento agilizado no cadastro da clínica.
 */

export const STANDARD_PROCEDURES_CATALOG = [
  // 1. Análises Clínicas (Laboratório)
  {
    id: 'std-lab-1',
    name: 'Hemograma Completo',
    category: 'laboratorio',
    tussCode: '40304361',
    suggestedPrep: 'Jejum recomendável de 3 a 4 horas. Evitar consumo de bebidas alcoólicas 24h antes.',
    suggestedDuration: 15,
  },
  {
    id: 'std-lab-2',
    name: 'Glicemia em Jejum',
    category: 'laboratorio',
    tussCode: '40302040',
    suggestedPrep: 'Jejum obrigatório de 8 a 12 horas. Água mineral em pequenas quantidades é permitida.',
    suggestedDuration: 10,
  },
  {
    id: 'std-lab-3',
    name: 'Colesterol Total e Frações (Perfil Lipídico)',
    category: 'laboratorio',
    tussCode: '40302015',
    suggestedPrep: 'Jejum obrigatório de 12 horas. Manter dieta habitual nos 3 dias anteriores.',
    suggestedDuration: 15,
  },
  {
    id: 'std-lab-4',
    name: 'Sumário de Urina (EAS)',
    category: 'laboratorio',
    tussCode: '40311023',
    suggestedPrep: 'Coletar a primeira urina da manhã (jato intermediário) após higiene íntima prévia.',
    suggestedDuration: 10,
  },
  {
    id: 'std-lab-5',
    name: 'Exame de Fezes (Parasitológico)',
    category: 'laboratorio',
    tussCode: '40303039',
    suggestedPrep: 'Coletar amostra em frasco apropriado e entregar ao laboratório em até 2 horas.',
    suggestedDuration: 10,
  },

  // 2. Diagnóstico por Imagem
  {
    id: 'std-img-1',
    name: 'Ultrassonografia Abdominal Total',
    category: 'imagem',
    tussCode: '40901124',
    suggestedPrep: 'Jejum absoluto de 8 horas. Beber 4 copos de água 1 hora antes do exame e não urinar.',
    suggestedDuration: 30,
  },
  {
    id: 'std-img-2',
    name: 'Ultrassonografia Transvaginal',
    category: 'imagem',
    tussCode: '40901132',
    suggestedPrep: 'Esvaziar a bexiga antes da realização do exame.',
    suggestedDuration: 20,
  },
  {
    id: 'std-img-3',
    name: 'Raio-X de Tórax (PA e Perfil)',
    category: 'imagem',
    tussCode: '40804056',
    suggestedPrep: 'Sem necessidade de jejum. Retirar adornos metálicos na região do tórax.',
    suggestedDuration: 15,
  },
  {
    id: 'std-img-4',
    name: 'Ressonância Magnética de Crânio',
    category: 'imagem',
    tussCode: '41101014',
    suggestedPrep: 'Jejum de 4 horas se houver uso de contraste. Retirar objetos metálicos e joias.',
    suggestedDuration: 45,
  },
  {
    id: 'std-img-5',
    name: 'Tomografia Computadorizada de Abdômen Total',
    category: 'imagem',
    tussCode: '41001010',
    suggestedPrep: 'Jejum de 6 horas. Apresentar exames anteriores e resultado de creatinina recente.',
    suggestedDuration: 30,
  },

  // 3. Exames Cardiológicos
  {
    id: 'std-card-1',
    name: 'Eletrocardiograma (ECG)',
    category: 'cardiologia',
    tussCode: '40101010',
    suggestedPrep: 'Não aplicar cremes ou loções no tórax no dia do exame. Trazer exames prévios.',
    suggestedDuration: 20,
  },
  {
    id: 'std-card-2',
    name: 'Ecocardiograma Transtorácico',
    category: 'cardiologia',
    tussCode: '40901043',
    suggestedPrep: 'Sem necessidade de jejum. Roupas confortáveis de duas peças.',
    suggestedDuration: 30,
  },
  {
    id: 'std-card-3',
    name: 'Holter 24 Horas',
    category: 'cardiologia',
    tussCode: '40101029',
    suggestedPrep: 'Tomar banho antes do exame, pois não poderá molhar o aparelho durante as 24h.',
    suggestedDuration: 25,
  },

  // 4. Consultas Especializadas
  {
    id: 'std-con-1',
    name: 'Consulta em Ginecologia e Obstetrícia',
    category: 'consultas',
    tussCode: '10101012',
    suggestedPrep: 'Trazer cartão de vacina, exames de imagem e laboratoriais anteriores.',
    suggestedDuration: 40,
  },
  {
    id: 'std-con-2',
    name: 'Consulta em Ortopedia e Traumatologia',
    category: 'consultas',
    tussCode: '10101012',
    suggestedPrep: 'Trazer exames de Raio-X, Tomografia ou Ressonância recentes se houver.',
    suggestedDuration: 30,
  },
  {
    id: 'std-con-3',
    name: 'Consulta em Cardiologia',
    category: 'consultas',
    tussCode: '10101012',
    suggestedPrep: 'Trazer lista de medicamentos em uso e últimos exames de eletrocardiograma/sangue.',
    suggestedDuration: 30,
  },

  // 5. Outros Procedimentos
  {
    id: 'std-out-1',
    name: 'Exame Preventivo (Papanicolau)',
    category: 'outros',
    tussCode: '40601137',
    suggestedPrep: 'Não estar no período menstrual. Abstinência sexual de 48h antes da coleta.',
    suggestedDuration: 25,
  },
]
