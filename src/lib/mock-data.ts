
import { Course } from './types';

export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: 'Desenvolvimento Web Fullstack',
    description: 'Aprenda do zero a construir aplicações modernas com Next.js, Tailwind e TypeScript. Um curso focado em prática e mercado de trabalho.',
    price: 497.00,
    accessLink: 'https://plataforma.com/acesso/web-fullstack',
    thumbnail: 'https://picsum.photos/seed/prog1/600/400',
    learningPoints: ['React & Next.js', 'Tailwind CSS', 'Node.js', 'PostgreSQL']
  },
  {
    id: '2',
    title: 'Marketing Digital de Alta Conversão',
    description: 'Estratégias avançadas para vender todos os dias utilizando tráfego pago e funis de vendas otimizados.',
    price: 297.00,
    accessLink: 'https://plataforma.com/acesso/mkt-digital',
    thumbnail: 'https://picsum.photos/seed/mkt1/600/400',
    learningPoints: ['Google Ads', 'Facebook Ads', 'Copywriting', 'SEO']
  },
  {
    id: '3',
    title: 'Design UI/UX Profissional',
    description: 'Domine as ferramentas e princípios do design de interfaces centradas no usuário. Do wireframe ao protótipo de alta fidelidade.',
    price: 397.00,
    accessLink: 'https://plataforma.com/acesso/design-uiux',
    thumbnail: 'https://picsum.photos/seed/design1/600/400',
    learningPoints: ['Figma', 'Prototipagem', 'Design Systems', 'UX Research']
  }
];
