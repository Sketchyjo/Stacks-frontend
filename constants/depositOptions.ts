import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';

import BaseLogo from '@/assets/svg/base.svg';
import BnbLogo from '@/assets/svg/bnb.svg';
import MaticLogo from '@/assets/svg/matic.svg';
import SolanaLogo from '@/assets/svg/solana.svg';
import Usdc from '@/assets/svg/usdc.svg';
import Usdt from '@/assets/svg/usdt.svg';

type SvgComponent = ComponentType<SvgProps>;

export type DepositNetworkHighlight = {
  id: string;
  message: string;
  tone?: 'default' | 'warning';
};

export type DepositNetwork = {
  id: string;
  name: string;
  subtitle: string;
  ticker: string;
  chainColor: string;
  textColor?: string;
  address: string;
  icon: SvgComponent;
  highlights?: DepositNetworkHighlight[];
};

export type StablecoinOption = {
  id: string;
  symbol: string;
  name: string;
  icon: SvgComponent;
  description: string;
  backgroundColor: string;
  textColor: string;
  networks: DepositNetwork[];
};

type NetworkDefinition = Omit<DepositNetwork, 'highlights'>;

const NETWORK_DEFINITIONS: Record<
  'solana' | 'base' | 'bnb' | 'polygon',
  NetworkDefinition
> = {
  solana: {
    id: 'solana',
    name: 'Solana',
    subtitle: 'Solana Network',
    ticker: 'SOL',
    chainColor: '#0E0E5C',
    textColor: '#F8FAFC',
    address: 'SOLANA_DEPOSIT_ADDRESS_PLACEHOLDER',
    icon: SolanaLogo,
  },
  base: {
    id: 'base',
    name: 'Base',
    subtitle: 'Base Mainnet',
    ticker: 'BASE',
    chainColor: '#2563EB',
    textColor: '#F1F5F9',
    address: '0x3A9F45F785fC881a8DBe4eb90D7f8135296C6F75',
    icon: BaseLogo,
  },
  bnb: {
    id: 'bnb',
    name: 'BNB',
    subtitle: 'BNB Chain (BEP20)',
    ticker: 'BNB',
    chainColor: '#FBBF24',
    address: '0x73D8927ED988B4B5F0c5Ab6dE9Ea72348F3F17A2',
    icon: BnbLogo,
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    subtitle: 'Polygon PoS',
    ticker: 'POL',
    chainColor: '#8B5CF6',
    textColor: '#F8FAFC',
    address: '0x4D19f761d9D0c4C7d3c0C1fd3B64954424d36CF1',
    icon: MaticLogo,
  },
};

const buildNetwork = (
  id: keyof typeof NETWORK_DEFINITIONS,
  overrides: Partial<DepositNetwork> = {}
): DepositNetwork => ({
  ...NETWORK_DEFINITIONS[id],
  ...overrides,
});

export const STABLECOIN_OPTIONS: StablecoinOption[] = [
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    description: 'Deposit USD Coin',
    backgroundColor: '#1C4ED8',
    textColor: '#F1F5F9',
    icon: Usdc,
    networks: [
      buildNetwork('solana'),
      buildNetwork('base'),
      buildNetwork('bnb', {
        highlights: [
          {
            id: 'earn',
            message:
              'For each USDC you deposit, you receive 1 digital dollar to invest with.',
          },
          {
            id: 'native',
            message: 'This address only accepts native USDC on the BNB network.',
          },
          {
            id: 'usdce',
            tone: 'warning',
            message: 'Deposits in USDCe are not supported and may not be recoverable.',
          },
        ],
      }),
      buildNetwork('polygon'),
    ],
  },
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether USD',
    description: 'Deposit Tether USD',
    backgroundColor: '#047857',
    textColor: '#ECFDF5',
    icon: Usdt,
    networks: [
      buildNetwork('solana'),
      buildNetwork('base'),
      buildNetwork('bnb', {
        address: '0x91B0C0421c163Dc6fD13bd966578AE3431C3C4dd',
      }),
      buildNetwork('polygon'),
    ],
  },
];

export const getStablecoinById = (id?: string) =>
  STABLECOIN_OPTIONS.find((option) => option.id === id);

export const getNetworkForStablecoin = (coinId: string | undefined, networkId: string | undefined) => {
  if (!coinId || !networkId) {
    return undefined;
  }

  const coin = getStablecoinById(coinId);
  return coin?.networks.find((network) => network.id === networkId);
};
