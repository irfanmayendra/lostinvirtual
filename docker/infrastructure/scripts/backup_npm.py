#!/usr/bin/env python3
"""
Nginx Proxy Manager - Backup proxy hosts configuration
Usage: python3 backup_npm.py > npm_hosts_backup.json
"""
import urllib.request, json, sys

NPM_URL = "http://localhost:81"

def get_token():
    req = urllib.request.Request(
        f"{NPM_URL}/api/tokens",
        data=json.dumps({
            "identity": sys.argv[1] if len(sys.argv) > 1 else "Irfanmayendra@gmail.com",
            "secret": sys.argv[2] if len(sys.argv) > 2 else "anjay123"
        }).encode(),
        headers={"Content-Type": "application/json"}
    )
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())["token"]

def get_proxy_hosts(token):
    req = urllib.request.Request(
        f"{NPM_URL}/api/nginx/proxy-hosts",
        headers={"Authorization": f"Bearer {token}"}
    )
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())

if __name__ == "__main__":
    try:
        token = get_token()
        hosts = get_proxy_hosts(token)
        print(json.dumps(hosts, indent=2))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
