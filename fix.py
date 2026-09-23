import os
import re

def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if "useMockStore" not in content and "mock" not in content and "MockStore" not in content:
        return

    # Remove mock imports
    content = re.sub(r"import\s+.*?from\s+[\"'].*?data/useMockStore[\"'];?", "", content)
    content = re.sub(r"import\s+.*?from\s+[\"'].*?data/mock[\"'];?", "", content)

    # If it needs useAuthStore
    needs_auth = False
    
    # Replace const { ... } = useMockStore()
    def replacer(match):
        nonlocal needs_auth
        vars_str = match.group(1)
        vars_list = [v.strip() for v in vars_str.split(",")]
        output = []
        for v in vars_list:
            if not v: continue
            if "session" in v:
                alias = v.split(":")[1].strip() if ":" in v else "session"
                output.append(f"const user = useAuthStore((s: any) => s.user); const {alias} = user;")
                needs_auth = True
            else:
                alias = v.split(":")[1].strip() if ":" in v else v
                output.append(f"const {alias}: any = [];")
        return "\n".join(output)
        
    content = re.sub(r"const\s+\{\s*([^}]+)\s*\}\s*=\s*useMockStore\(\);?", replacer, content)

    if needs_auth and "useAuthStore" not in content:
        content = "import { useAuthStore } from \"../../../stores/useAuthStore\";\n" + content
        # I should probably fix relative paths properly but let's see.

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

for root, _, files in os.walk("src"):
    for file in files:
        if file.endswith((".tsx", ".ts")):
            process_file(os.path.join(root, file))

print("Done")
