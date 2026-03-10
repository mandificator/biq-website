# 🚀 BIQ Dashboard - Setup pentru Laptop

## 📋 Instrucțiuni de Instalare

Deoarece nu pot crea direct o arhivă zip, urmează acești pași pentru a transfera proiectul pe laptop:

### 1. 📁 Creează structura de foldere pe laptop:

```bash
mkdir biq-dashboard
cd biq-dashboard
mkdir -p src/{components,screens/{Desktop,Mobile,Dashboard},hooks,utils,data,lib}
mkdir -p public/fonts
```

### 2. 📦 Instalează dependințele:

```bash
# Copiază fișierul package.json din proiect, apoi rulează:
npm install
```

**IMPORTANT**: Fișierul `package.json` conține toate dependințele necesare. După ce îl copiezi pe laptop, comanda `npm install` va descărca automat toate pachetele de pe npmjs.com.

### 3. 🔧 Configurează Vite și TypeScript:

Copiază conținutul fișierelor de configurare din acest proiect:
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `tailwind.config.js`

### 4. 📄 Copiază toate fișierele sursă:

Copiază manual toate fișierele din folderele:
- `src/` - toate componentele și screen-urile
- `public/` - assets și fonts
- `index.html` - fișierul principal

### 5. 🎨 Adaugă background-ul:

Salvează imaginea de background din acest proiect ca `public/image.png`

### 6. ▶️ Pornește aplicația:

```bash
npm run dev
```

## 🎯 Funcționalități Incluse:

- ✅ Dashboard complet cu analytics
- ✅ Stats cards în timp real
- ✅ Grafice interactive
- ✅ Tabel useri cu filtrare
- ✅ Dark/Light mode
- ✅ Export wallets
- ✅ 300 useri mock cu date realiste

## 🔄 Navigare între pagini:

- **Desktop**: Landing page originală
- **Mobile**: Versiune mobile
- **Dashboard**: Noua pagină analytics

Schimbă între pagini modificând `deviceType` în `src/index.tsx`:
- `'desktop'` pentru Desktop
- `'mobile'` pentru Mobile  
- `'dashboard'` pentru Dashboard

## 📞 Support:

Dacă întâmpini probleme, verifică că toate dependințele sunt instalate corect și că structura de foldere este respectată.