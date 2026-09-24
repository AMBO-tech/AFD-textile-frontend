import os, re
files_to_fix = [
    "src/components/stock/Stock.tsx",
    "src/components/demandes/Demandes.tsx",
    "src/components/entrepot/Entrepot.tsx",
    "src/components/historique/Historique.tsx",
    "src/components/historique/HistoriqueTimeline.tsx",
    "src/components/layout/AppLayout.tsx",
    "src/components/parametres/Parametres.tsx",
    "src/components/products/Products.tsx",
    "src/components/rapports/RapportsSalesBarChart.tsx",
    "src/components/sales/Sales.tsx",
    "src/components/users/UserCard.tsx",
    "src/components/users/Users.tsx",
    "src/pages/auth/ActiverComptePage.tsx"
]

for filepath in files_to_fix:
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Replace (c) =>, (p) =>, etc.
        content = re.sub(r"\(([a-zA-Z0-9_]+)\)\s*=>", r"(\1: any) =>", content)
        # Also replace something like b =>
        content = re.sub(r"(?<![a-zA-Z0-9_])([a-zA-Z0-9_]+)\s*=>", r"(\1: any) =>", content)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
