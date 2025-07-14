
export type Demand = {
  id: string;
  title: string;
  category: string;
  location: string;
  author: string;
  postedAt: string;
  proposals: number;
  description: string;
  safetyConcerns: string[];
};

export const demands: Demand[] = [
  {
    id: '1',
    title: 'Reparo de vazamento na área da piscina',
    category: 'Hidráulica',
    location: 'Copacabana',
    author: 'Condomínio Sol Mar',
    postedAt: '2 dias atrás',
    proposals: 3,
    description: 'Há um vazamento significativo na tubulação que leva à piscina. Precisa de reparo urgente para evitar desperdício de água e danos estruturais.',
    safetyConcerns: ['Risco de choque elétrico se a água atingir a fiação da bomba da piscina.','Piso escorregadio na área do vazamento.'],
  },
  {
    id: '2',
    title: 'Manutenção do sistema de câmeras de segurança',
    category: 'Segurança',
    location: 'Ipanema',
    author: 'Condomínio Vista Linda',
    postedAt: '5 dias atrás',
    proposals: 5,
    description: 'Algumas câmeras do CFTV não estão gravando. Precisamos de um técnico para verificar todo o sistema, incluindo DVR e fiação.',
    safetyConcerns: [],
  },
  {
    id: '3',
    title: 'Pintura da fachada frontal',
    category: 'Pintura',
    location: 'Maricá',
    author: 'Residencial Green Park',
    postedAt: '1 semana atrás',
    proposals: 8,
    description: 'A fachada do bloco A está com a pintura desgastada e apresentando infiltrações. Necessário tratamento da parede e pintura completa.',
    safetyConcerns: ['Trabalho em altura requer uso de andaimes e equipamento de segurança (EPI).'],
  },
  {
    id: '4',
    title: 'Instalação de novas luminárias de LED no jardim',
    category: 'Elétrica',
    location: 'Leblon',
    author: 'Edifício Brisa do Mar',
    postedAt: '10 dias atrás',
    proposals: 2,
    description: 'Substituição das luminárias antigas por modelos de LED mais econômicos e eficientes na área do jardim e playground.',
    safetyConcerns: ['Desligar o disjuntor geral da área externa antes de iniciar o trabalho.'],
  },
];

export type CampaignSupporter = {
    id: string;
    name: string;
    amount: number;
    logo: string;
}

export type Campaign = {
  id: string;
  title: string;
  description: string;
  goal: number;
  current: number;
  image: string;
  sponsor: string;
  supporters: CampaignSupporter[];
};

export const campaigns: Campaign[] = [
  {
    id: 'c1',
    title: 'Horta Comunitária no Terraço',
    description: 'Vamos transformar o terraço do Bloco 2 em uma horta comunitária! O valor arrecadado será usado para comprar terra, sementes e ferramentas.',
    goal: 1500,
    current: 950,
    image: 'https://placehold.co/600x400.png',
    sponsor: 'Jardim Feliz Paisagismo',
    supporters: [
        { id: 's1', name: 'Jardim Feliz Paisagismo', amount: 500, logo: 'https://placehold.co/40x40.png' },
        { id: 's2', name: 'Verde Vida Comunitária', amount: 450, logo: 'https://placehold.co/40x40.png' },
    ]
  },
  {
    id: 'c2',
    title: 'Coleta Seletiva Inteligente',
    description: 'Ajude-nos a adquirir lixeiras novas e coloridas para a coleta seletiva e a promover a educação ambiental para todos os moradores.',
    goal: 3000,
    current: 2800,
    image: 'https://placehold.co/600x400.png',
    sponsor: 'Recicla Tudo SA',
    supporters: [
        { id: 's3', name: 'Recicla Tudo SA', amount: 2000, logo: 'https://placehold.co/40x40.png' },
        { id: 's4', name: 'Condomínio Amigo do Ambiente', amount: 800, logo: 'https://placehold.co/40x40.png' },
    ]
  },
  {
    id: 'c3',
    title: 'Brinquedos Novos para o Playground',
    description: 'Nossos pequenos merecem um parquinho seguro e divertido. Com a sua ajuda, vamos renovar os brinquedos e instalar um piso emborrachado.',
    goal: 5000,
    current: 1200,
    image: 'https://placehold.co/600x400.png',
    sponsor: 'Apoio Construtora',
    supporters: [
        { id: 's5', name: 'Apoio Construtora', amount: 1200, logo: 'https://placehold.co/40x40.png' },
    ]
  },
];

export type Provider = {
    id: string;
    name: string;
    category: string;
    rating: number;
    location: string;
    logo: string;
    phone?: string;
    website?: string;
    linkedin?: string;
    facebook?: string;
};

export const providers: Provider[] = [
    { id: 'p1', name: 'Hidráulica Rápida', category: 'Hidráulica', rating: 4.8, location: 'Copacabana', logo: 'https://placehold.co/64x64.png', phone: '(21) 99999-1111', website: 'https://hidraulicarapida.com', linkedin: 'https://linkedin.com/company/hidraulicarapida' },
    { id: 'p2', name: 'Eletricista 24h', category: 'Elétrica', rating: 4.9, location: 'Ipanema', logo: 'https://placehold.co/64x64.png', phone: '(21) 99999-2222', facebook: 'https://facebook.com/eletricista24h' },
    { id: 'p3', name: 'Pinturas & Cia', category: 'Pintura', rating: 4.7, location: 'Maricá', logo: 'https://placehold.co/64x64.png', website: 'https://pinturascia.com' },
    { id: 'p4', name: 'Segurança Total', category: 'Segurança', rating: 5.0, location: 'Leblon', logo: 'https://placehold.co/64x64.png', phone: '(21) 99999-4444' },
    { id: 'p5', name: 'Jardim Feliz Paisagismo', category: 'Jardinagem', rating: 4.9, location: 'Barra da Tijuca', logo: 'https://placehold.co/64x64.png' },
    { id: 'p6', name: 'Limpeza Brilhante', category: 'Limpeza', rating: 4.6, location: 'Copacabana', logo: 'https://placehold.co/64x64.png', facebook: 'https://facebook.com/limpezabrilhante' },
];
