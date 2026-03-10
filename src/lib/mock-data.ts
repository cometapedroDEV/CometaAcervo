
import { Course, ExternalPlatform, ExternalAccountCredential } from './types';

export const MOCK_PLATFORMS: ExternalPlatform[] = [
  { id: 'kwify', name: 'Kwify', baseUrl: 'https://kwify.com' },
  { id: 'ticto', name: 'Ticto', baseUrl: 'https://ticto.com.br' },
  { id: 'perfectpay', name: 'Perfect Pay', baseUrl: 'https://perfectpay.com.br' }
];

export const MOCK_CREDENTIALS: ExternalAccountCredential[] = [
  {
    id: 'c1',
    externalPlatformId: 'kwify',
    accessIdentifier: 'denise.xarim@gmail.com:326528',
    providedCourseTitles: [
      'Lucrando Com Videos',
      'Ganhando Dinheiro Assistindo Vídeos!',
      'CLIPCLAPS - Exclua o sua Youtube!',
      'Ganhando R$1.000,00 com COS.TV',
      'Avaliador de Software'
    ],
    adminNotes: 'Config By: @pjcontas'
  }
];

export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: 'Lucrando Com Videos',
    description: 'Aprenda a monetizar seu tempo assistindo vídeos em diversas plataformas e aplicativos secretos.',
    price: 10.00,
    externalPlatformId: 'kwify',
    thumbnail: 'https://picsum.photos/seed/video1/600/400',
    learningPoints: ['Monetização', 'Aplicativos', 'Renda Extra']
  },
  {
    id: '2',
    title: 'Marketing Digital de Alta Conversão',
    description: 'Estratégias avançadas para vender todos os dias utilizando tráfego pago e funis de vendas.',
    price: 10.00,
    externalPlatformId: 'ticto',
    thumbnail: 'https://picsum.photos/seed/mkt1/600/400',
    learningPoints: ['Google Ads', 'Facebook Ads', 'Copywriting']
  }
];
