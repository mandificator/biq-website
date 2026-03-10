# Dashboard Installation Guide

## Cerințe de sistem
- Node.js 18+ 
- npm sau yarn

## Instalare

1. **Extrage arhiva** în folderul dorit
2. **Instalează dependințele**:
   ```bash
   npm install
   ```

3. **Pornește aplicația**:
   ```bash
   npm run dev
   ```

4. **Accesează** aplicația la `http://localhost:5173`

## Structura proiectului

```
src/
├── screens/
│   ├── Desktop/     # Pagina desktop originală
│   ├── Mobile/      # Pagina mobile originală  
│   └── Dashboard/   # Noua pagină dashboard
├── data/
│   └── mockUsers.ts # Date mock pentru useri
├── hooks/           # Hook-uri React
├── utils/           # Utilități
└── components/      # Componente UI
```

## Modificări în index.tsx

Pentru a schimba pagina afișată, modifică în `src/index.tsx`:

```typescript
// Pentru Dashboard (implicit)
return <Dashboard />;

// Pentru Desktop
return deviceType === 'mobile' ? <Mobile /> : <Desktop />;
```

## Dependințe noi adăugate

- `chart.js` - Pentru grafice
- `react-chartjs-2` - Wrapper React pentru Chart.js
- `date-fns` - Pentru manipularea datelor

## Funcționalități Dashboard

- **Stats cards** cu metrici în timp real
- **Grafice interactive** pentru arrivals/departures
- **Tabel cu useri** cu filtrare pe categorii
- **Theme toggle** pentru personalizare
- **Dark/Light mode**
- **Export wallets** (placeholder)

## Personalizare

- Modifică datele în `src/data/mockUsers.ts`
- Schimbă culorile în `src/utils/themeColors.ts`
- Ajustează stilurile în componentele respective