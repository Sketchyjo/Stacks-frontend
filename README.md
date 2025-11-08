# STACK - Web3-Native Investment Platform

 **[Backend](https://github.com/Sketchyjo/STACK-BACKEND-SERVICE)** 

<div align="center">

**The safe, fun, no-BS way for Gen Z to grow money without banks or crypto headaches.**

[![React Native](https://img.shields.io/badge/React%20Native-0.72.x-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2049-000020.svg)](https://expo.dev/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem & Solution](#-problem--solution)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Backend Repository](#-backend-repository)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Documentation](#-documentation)

---

## 🎯 Overview

**STACK** is a hybrid Web3 finance application that provides Gen Z investors with a seamless bridge between stablecoins and traditional assets. By combining the speed and accessibility of Web3 with the security of regulated investing, STACK offers instant deposits via stablecoins (USDC) and direct investment into stocks, ETFs, and curated baskets—all without traditional banking delays.

### 🎪 What Makes STACK Different?

- **🚀 Instant Funding**: Deposit USDC from any major blockchain and start investing immediately
- **🛡️ AI-Powered Protection**: Personal AI CFO that protects users from common financial mistakes
- **🎨 Gen Z Native**: TikTok-meets-Cash App UX—fast, visual, engaging, and intuitive
- **🌐 Borderless**: No traditional bank account required—true "money without borders"
- **📊 Curated Baskets**: Expert-designed investment portfolios aligned with Gen Z values

---

## 💡 Problem & Solution

### The Problem

Modern Gen Z investors face two broken systems:

1. **Traditional Banking (Jordan's Pain)** 🏦
   - 3-5 day ACH transfer delays
   - Hidden fees and minimum balance requirements
   - Clunky, outdated user interfaces
   - Feels designed for previous generations

2. **Pure Web3 (Chris's Pain)** 🌐
   - Intimidating seed phrases and irreversible mistakes
   - Shockingly high gas fees ($28+ for simple transactions)
   - Complex technical barriers
   - Scary and unforgiving environment

### The Solution

**STACK bridges the gap** by offering:
- ✅ The **transparency and accessibility** that banks lack
- ✅ The **real-world asset integration** that crypto apps miss
- ✅ A **fun, trust-building UX** tailored to Gen Z

**Target User: "Taylor"** - A 22-year-old digitally native multi-tasker who wants financial empowerment on her own terms. She's waiting for something more than Cash App, simpler than Coinbase, and fairer than Robinhood.

---

## ✨ Key Features

### MVP Core Features

#### 🔐 User Onboarding & Managed Wallet
- Simple sign-up with secure, managed wallet creation
- No seed phrases—we handle custody complexity
- Biometric authentication and passcode security

#### 💰 Stablecoin Deposits
- Support for major EVM chains (Ethereum, Polygon, Base)
- Non-EVM chain support (Solana)
- Real-time deposit detection and confirmation

#### 🔄 Seamless Investment Flow
- Automatic USDC → USD conversion via Circle
- Instant "buying power" updates
- DriveWealth brokerage integration for regulated custody

#### 📦 Expert-Curated Baskets
- 5-10 professionally designed investment portfolios
- Aligned with Gen Z values (sustainability, impact)
- Risk-categorized: Conservative, Balanced, Growth

#### 🤖 AI CFO (MVP Version)
- Weekly automated performance summaries
- On-demand portfolio analysis
- Protective insights to avoid common mistakes
- Powered by 0G for AI inference and storage

#### 📊 Portfolio Management
- Real-time position tracking
- P&L calculations
- Simple, visual portfolio dashboard

### 🚀 Post-MVP Vision

**Phase 2** (3-6 months):
- Full conversational AI CFO with personalized nudges
- Social features: user profiles, following, leaderboards
- Copy investing functionality
- User-curated baskets

**Long-Term** (1-2 years):
- Debit card integration
- P2P payments
- Time-lock investments
- Business accounts
- Startup launchpad

---

## 🏗️ Architecture

### High-Level System Design

STACK follows a **modular monolith architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Gen Z User (Mobile)                      │
│                    React Native App                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          STACK Backend (Go Modular Monolith - AWS)          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              API Gateway (GraphQL)                     │ │
│  └─────┬──────┬──────┬──────┬──────┬──────────────────────┘ │
│        │      │      │      │      │                        │
│   ┌────▼──┐ ┌─▼───┐ ┌▼────┐ ┌▼───┐ ┌▼─────┐               │
│   │Onboard│ │Wallet│ │Fund │ │Inv │ │AI CFO│               │
│   │Service│ │Svc   │ │Svc  │ │Svc │ │ Svc  │               │
│   └───┬───┘ └──┬──┘ └─┬───┘ └─┬──┘ └──┬───┘               │
│       └─────────┴──────┴───────┴────────┴──────┐            │
│                                                 │            │
│                    ┌────────────────────────────▼───────┐    │
│                    │      PostgreSQL Database           │    │
│                    └────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
    ┌───▼────┐    ┌───▼────┐    ┌───▼────┐
    │ Circle │    │ Drive  │    │   0G   │
    │  API   │    │ Wealth │    │  AI    │
    │Wallets │    │Brokerage│   │Storage │
    └────────┘    └────────┘    └────────┘
```

### Data Flow

#### Funding Flow (Deposit)
```
USDC Deposit (On-Chain)
    ↓
Circle Detection & Webhook
    ↓
Off-Ramp (USDC → USD)
    ↓
DriveWealth Funding
    ↓
Buying Power Updated
```

#### Investment Flow
```
User Selects Basket
    ↓
Balance Check
    ↓
Order Submitted to DriveWealth
    ↓
Order Execution
    ↓
Portfolio Updated
```

### Domain Services

The backend is organized into five core domain services:

1. **Onboarding Service** - User sign-up, KYC/AML, profile management
2. **Wallet Service** - Managed wallet lifecycle, address generation
3. **Funding Service** - Deposit monitoring, USDC→USD conversion, withdrawals
4. **Investing Service** - Basket catalog, order execution, portfolio tracking
5. **AI-CFO Service** - Weekly summaries, on-demand analysis, insights

For detailed architecture information, see [`docs/architecture.md`](docs/architecture.md).

---

## 🛠️ Tech Stack

### Frontend (This Repository)

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Language** | TypeScript | 5.x | Type-safe development |
| **Framework** | React Native | 0.72.x | Cross-platform mobile |
| **Build Tool** | Expo | SDK 49 | Development & deployment |
| **State Management** | Zustand | Latest | Lightweight state management |
| **Styling** | NativeWind | Latest | Tailwind CSS for React Native |
| **Navigation** | Expo Router | Latest | File-based routing |
| **API Communication** | GraphQL | Latest | Efficient data fetching |
| **Authentication** | Expo Auth Session | Latest | OAuth/OIDC flows |

### Backend (Separate Repository)

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Language** | Go | 1.21.x | High-performance backend |
| **Web Framework** | Gin | v1.11.0 | HTTP routing & middleware |
| **Database** | PostgreSQL | 15.x | Primary data store |
| **DB Driver** | lib/pq | Latest | PostgreSQL driver |
| **Cache** | Redis | 7.x | Caching layer |
| **Queue** | AWS SQS | - | Async task processing |
| **API** | GraphQL (gqlgen) | Latest | API gateway |
| **Logging** | Zap | Latest | Structured logging |
| **Tracing** | OpenTelemetry | Latest | Distributed tracing |
| **Metrics** | Prometheus | Latest | Application metrics |
| **Circuit Breaker** | gobreaker | Latest | Resilience patterns |

### Infrastructure

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Cloud** | AWS | Primary infrastructure |
| **Compute** | ECS Fargate | Container orchestration |
| **Database** | RDS (PostgreSQL) | Managed database |
| **Cache** | ElastiCache (Redis) | Managed Redis |
| **Queue** | SQS | Message queuing |
| **Storage** | S3 | Object storage |
| **CDN** | CloudFront | Content delivery |
| **IaC** | Terraform | Infrastructure as Code |
| **CI/CD** | GitHub Actions | Automation |
| **Containers** | Docker | Containerization |

### External Partners

- **🔐 Auth**: Auth0 / AWS Cognito
- **💳 Wallets & Funding**: Circle Developer-Controlled Wallets
- **📈 Brokerage**: DriveWealth API
- **🤖 AI & Storage**: 0G Network
- **✅ KYC/AML**: TBD Provider

---

## 📁 Project Structure

```
testrun/
├── app/                        # Expo Router pages
│   ├── (auth)/                # Authentication screens
│   ├── (tabs)/                # Main app tabs
│   └── _layout.tsx            # Root layout
├── components/                 # Reusable components
│   ├── ui/                    # UI components
│   ├── wallet/                # Wallet-specific components
│   └── investment/            # Investment components
├── stores/                     # Zustand state stores
│   ├── authStore.ts           # Authentication state
│   ├── walletStore.ts         # Wallet state
│   └── portfolioStore.ts      # Portfolio state
├── api/                        # API clients & GraphQL
│   ├── client.ts              # GraphQL client setup
│   └── queries/               # GraphQL queries/mutations
├── types/                      # TypeScript type definitions
├── utils/                      # Utility functions
├── hooks/                      # Custom React hooks
├── constants/                  # App constants
├── assets/                     # Images, fonts, etc.
├── docs/                       # Documentation
│   ├── architecture.md        # Backend architecture
│   └── stack project brief.pdf # Project brief
├── scripts/                    # Build & deployment scripts
├── .env.example               # Environment variables template
├── app.json                   # Expo configuration
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or pnpm
- iOS Simulator (macOS) or Android Emulator
- Expo CLI (installed globally or via npx)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd testrun
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   EXPO_PUBLIC_API_URL=<backend-api-url>
   EXPO_PUBLIC_GRAPHQL_ENDPOINT=<graphql-endpoint>
   EXPO_PUBLIC_AUTH0_DOMAIN=<auth0-domain>
   EXPO_PUBLIC_AUTH0_CLIENT_ID=<auth0-client-id>
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

---

## 🔗 Backend Repository

The Go-based backend service is maintained in a separate repository:

**🔗 [STACK Backend Service](https://github.com/Sketchyjo/STACK-BACKEND-SERVICE)**

The backend handles:
- User authentication and authorization
- Wallet management via Circle API
- Funding flow orchestration (USDC → USD → DriveWealth)
- Investment order execution via DriveWealth
- AI CFO features via 0G
- Database operations and caching

### Backend Domain Services

```
├── Onboarding Service    # Sign-up, profile, KYC/AML, feature flags
├── Wallet Service        # Managed wallet lifecycle, address issuance
├── Funding Service       # Deposit detection, off-ramp, broker funding
├── Investing Service     # Basket catalog, orders, portfolio, P&L
└── AI-CFO Service (Lite) # Weekly summaries, on-demand analysis, 0G integration
```

---

## 💻 Development

### Available Scripts

```bash
# Start development server
npm start

# Start with cache clear
npm run start:clear

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web

# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format
```

### Development Workflow

1. **Feature Development**
   - Create feature branch from `main`
   - Follow naming convention: `feature/description`
   - Write tests for new features
   - Ensure TypeScript types are properly defined

2. **Code Quality**
   - Run `npm run lint` before committing
   - Fix any TypeScript errors
   - Follow React Native best practices
   - Use functional components with hooks

3. **State Management**
   - Use Zustand for global state
   - Keep state minimal and normalized
   - Implement proper persistence where needed
   - Document state shape and actions

4. **API Integration**
   - Use GraphQL queries/mutations
   - Implement proper error handling
   - Add loading states
   - Cache responses appropriately

---

## 🧪 Testing

### Test Strategy

- **Unit Tests**: Component logic, utility functions
- **Integration Tests**: API interactions, state management
- **E2E Tests**: Critical user flows

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 📦 Deployment

### Build for Production

**iOS:**
```bash
# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

**Android:**
```bash
# Build for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### Environment-Specific Builds

- **Development**: Points to staging backend
- **Staging**: Pre-production testing
- **Production**: Live environment

Configuration is managed through `eas.json`.

---

## 🤝 Contributing

### Development Guidelines

1. **Code Style**
   - Follow TypeScript best practices
   - Use functional components
   - Implement proper error boundaries
   - Write meaningful commit messages

2. **Git Workflow**
   - Branch from `main`
   - Squash commits before merging
   - Write descriptive PR descriptions
   - Request code review

3. **Testing Requirements**
   - Write tests for new features
   - Maintain >80% code coverage
   - Test on both iOS and Android
   - Include edge cases

### Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from team members

---

## 📚 Documentation

### Additional Resources

- **[Architecture Document](docs/architecture.md)** - Detailed system architecture
- **[Project Brief](docs/stack%20project%20brief.pdf)** - Product vision and requirements
- **[API Documentation](docs/api/)** - GraphQL schema and endpoints
- **[Backend Repository](https://github.com/Sketchyjo/STACK-BACKEND-SERVICE)** - Go backend service

### External Documentation

- [React Native Docs](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Circle API Docs](https://developers.circle.com/)
- [DriveWealth API Docs](https://developer.drivewealth.com/)
- [0G Documentation](https://0g.ai/)

---

## 📊 MVP Success Metrics

### User Acquisition
- **Goal**: 10,000 MAU within 6 months of launch
- **Metric**: Daily/Monthly Active Users (DAU/MAU)

### Conversion
- **Goal**: 5% conversion to premium tier in year 1
- **Metric**: Sign-up to Funded Account rate

### Platform Validation
- **Goal**: $1M total investment volume in year 1
- **Metric**: Total Assets Under Management (AUM)

### User Success
- **Empowerment**: Users feel in control (surveys)
- **Confidence**: NPS score & retention rates
- **Habit Formation**: % users with recurring investments

---

## 🎯 Roadmap

### ✅ MVP (Current)
- [x] User onboarding & managed wallets
- [x] Stablecoin deposits (Ethereum, Solana)
- [x] Expert-curated baskets (5-10 options)
- [x] Basic portfolio view
- [x] AI CFO weekly summaries
- [x] DriveWealth integration

### 🚧 Phase 2 (3-6 months)
- [ ] Full conversational AI CFO
- [ ] Social features (profiles, following)
- [ ] Leaderboards & copy investing
- [ ] User-curated baskets
- [ ] Advanced portfolio analytics

### 🔮 Long-Term (1-2 years)
- [ ] Debit card integration
- [ ] P2P payments
- [ ] Time-lock investments
- [ ] Business accounts
- [ ] Startup launchpad

---

## 🏆 What Makes STACK Special?

> **"More than Cash App, simpler than Coinbase, fairer than Robinhood"**

STACK uniquely combines:

1. **🌐 Web3 Speed** - Instant deposits via stablecoins
2. **🏛️ TradFi Security** - Regulated brokerage custody
3. **🤖 AI Protection** - Personal CFO preventing mistakes
4. **🎨 Gen Z UX** - TikTok-meets-Cash App interface
5. **🌍 Borderless** - No traditional bank required

**Built for Taylor. Built for Gen Z. Built for the future of finance.**

---

<div align="center">

**[Website](#)** • **[Documentation](docs/)** • **[Backend](https://github.com/Sketchyjo/STACK-BACKEND-SERVICE)** • **[Support](#)**

Made with ❤️ for Gen Z investors

</div>
