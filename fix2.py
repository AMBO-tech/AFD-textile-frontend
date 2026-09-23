import os, re
files_to_fix = [
    "src/components/historique/Historique.tsx",
    "src/components/layout/AppLayout.tsx",
    "src/components/sales/Sales.tsx",
    "src/components/dashboard/Dashboard.tsx",
    "src/components/demandes/Demandes.tsx",
    "src/components/clients/RecordPaymentModal.tsx",
    "src/components/stock/Stock.tsx",
    "src/components/dashboard/DashboardSalesChart.tsx",
    "src/components/dashboard/DashboardTopProducts.tsx",
    "src/components/clients/types.ts",
    "src/components/products/types.ts"
]
for filepath in files_to_fix:
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        content = re.sub(r"import\s+.*?from\s+[\"'].*?data/useMockStore[\"'];?", "", content)
        content = re.sub(r"\(([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\)\s*=>", r"(\1: any, \2: any) =>", content)
        content = re.sub(r"\(prev: any\)\s*=>\s*new\s*Set\(", r"(prev: any) => new Set<string>(", content)
        content = content.replace("(v: number | string | undefined)", "(v: any)")
        content = re.sub(r"export\s+type\s+\{.*?\}", "", content)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
