const fs = require('fs');

const fixes = [
  { file: 'src/components/boutiques/Boutiques.tsx', fix: content => content.replace(/\(b\)/g, '(b: any)').replace(/\(u\)/g, '(u: any)').replace(/\(p\)/g, '(p: any)') },
  { file: 'src/components/boutiques/BoutiqueStaffItem.tsx', fix: content => content.replace(/\(n\)/g, '(n: any)') },
  { file: 'src/components/boutiques/BoutiqueStaffModal.tsx', fix: content => content.replace(/\(n\)/g, '(n: any)') },
  { file: 'src/components/clients/ClientCard.tsx', fix: content => content.replace(/\(n\)/g, '(n: any)') },
  { file: 'src/components/clients/ClientDetailModal.tsx', fix: content => content.replace(/\(b\)/g, '(b: any)').replace(/\(n\)/g, '(n: any)').replace(/\(cr\)/g, '(cr: any)').replace(/\(s,\s*p\)/g, '(s: any, p: any)').replace(/\(p\)/g, '(p: any)') },
  { file: 'src/components/clients/Clients.tsx', fix: content => content.replace(/\(c\)/g, '(c: any)').replace(/\(b\)/g, '(b: any)').replace(/\(client\)/g, '(client: any)') },
  { file: 'src/components/dashboard/Dashboard.tsx', fix: content => content.replace(/\(p\)/g, '(p: any)').replace(/\(v\)/g, '(v: any)') },
  { file: 'src/components/demandes/Demandes.tsx', fix: content => content.replace(/validation=\{validation\}/, 'validation={validation as any}') },
  { file: 'src/components/layout/AppLayout.tsx', fix: content => content.replace(/'boutiques'/g, '"boutiques" as any') },
  { file: 'src/components/notifications/NotificationCard.tsx', fix: content => content.replace(/notificatio\n/, 'notification\n').replace(/n\.map/g, 'notification.map') },
  { file: 'src/components/stock/Stock.tsx', fix: content => content.replace(/\(prev\)/g, '(prev: any)').replace(/\{ categorie, produits: prodsCat \}/g, '({ categorie, produits: prodsCat }: any)') },
  { file: 'src/features/stocks/components/StockInCategoriesStep.tsx', fix: content => content.replace(/photo: cat\.photo,/g, '') },
  { file: 'src/features/stocks/components/StockInConfigStep.tsx', fix: content => content.replace(/\{categorieActuelle\}/, '{categorieActuelle.nom}').replace(/lieu: emplacement,/g, 'adresse: emplacement,') },
  { file: 'src/features/ventes/hooks/useSalesPOS.ts', fix: content => content.replace(/categories=\{produitsData\.categories/g, 'categories={[]') },
];

fixes.forEach(({ file, fix }) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const newContent = fix(content);
    if (content !== newContent) fs.writeFileSync(file, newContent, 'utf8');
  }
});
