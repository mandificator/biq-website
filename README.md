# BIQ Protocol Dashboard

Dashboard complet pentru BIQ Protocol cu pagini Desktop, Mobile și Analytics.

## 🚀 Instalare Rapidă

```bash
npm install
npm run dev
```

## 📱 Pagini Disponibile

- **Desktop** - Landing page desktop cu animații
- **Mobile** - Landing page mobile optimizată  
- **Dashboard** - Analytics dashboard cu grafice și tabele

## 🎨 Funcționalități Dashboard

- ✅ Stats cards în timp real
- ✅ Grafice interactive (Chart.js)
- ✅ Tabel useri cu filtrare
- ✅ Dark/Light mode
- ✅ Theme customization
- ✅ Export functionality
- ✅ Responsive design

## 🔧 Configurare

Modifică pagina afișată în `src/index.tsx`:

```typescript
// Dashboard (implicit)
return <Dashboard />;

// Responsive Desktop/Mobile
return deviceType === 'mobile' ? <Mobile /> : <Desktop />;
```

## 📊 Date Mock

Datele sunt generate în `src/data/mockUsers.ts` cu:
- 300 useri simulați
- Patterns realiste de arrival/departure
- Status-uri dinamice (present/departed/not_arrived)
- Metrici calculate automat

## 🎯 Tehnologii

- React 18 + TypeScript
- Vite pentru build
- Tailwind CSS pentru styling
- Chart.js pentru grafice
- Date-fns pentru date
- Radix UI pentru componente

## 📁 Structura

```
src/
├── screens/          # Pagini principale
├── components/       # Componente reutilizabile
├── data/            # Date mock și configurări
├── hooks/           # Custom hooks
├── utils/           # Funcții utilitare
└── lib/             # Librării și configurări
```