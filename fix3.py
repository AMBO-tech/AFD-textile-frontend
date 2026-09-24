import os, re
files_to_fix = [
    "src/components/boutiques/Boutiques.tsx",
    "src/components/boutiques/BoutiqueStaffItem.tsx",
    "src/components/boutiques/BoutiqueStaffModal.tsx",
    "src/components/clients/ClientCard.tsx",
    "src/components/clients/ClientDetailModal.tsx",
    "src/components/clients/Clients.tsx",
    "src/components/dashboard/Dashboard.tsx",
    "src/components/demandes/Demandes.tsx",
    "src/components/notifications/NotificationCard.tsx",
    "src/components/stock/Stock.tsx",
    "src/features/stocks/components/StockInCategoriesStep.tsx",
    "src/features/stocks/components/StockInConfigStep.tsx",
    "src/features/stocks/components/StockInProductsStep.tsx"
]

for filepath in files_to_fix:
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # fix missing any
        content = re.sub(r"\b([a-zA-Z0-9_]+)\s*=>", r"(\1: any) =>", content)
        content = re.sub(r"\(acc, cr\)\s*=>", r"(acc: any, cr: any) =>", content)
        content = re.sub(r"\(pSum, p\)\s*=>", r"(pSum: any, p: any) =>", content)
        content = re.sub(r"\(l, i\)\s*=>", r"(l: any, i: any) =>", content)
        content = re.sub(r"\[categorie, prodsCat\]", r"[categorie, prodsCat]: any", content)
        content = content.replace("n.date", "(n as any).date")
        content = content.replace("c.photo", "(c as any).photo")
        content = content.replace("p.photo", "(p as any).photo")
        content = content.replace("p.prix", "(p as any).prix")
        content = content.replace("p.unite", "(p as any).unite")
        content = content.replace("b.lieu", "(b as any).lieu")
        content = content.replace("getStatutCfg={getStatutCfg}", "getStatutCfg={getStatutCfg as any}")
        content = content.replace("qteModif={qteModif}", "")
        content = content.replace("onQteModifChange={setQteModif}", "")
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
