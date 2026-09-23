import os

for root, _, files in os.walk("src"):
    for file in files:
        if file.endswith((".tsx", ".ts")):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            if "useAuthStore" in content and "import { useAuthStore }" not in content:
                content = "import { useAuthStore } from '@/stores/useAuthStore';\n" + content
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
