import asyncio
import json
import sys
import httpx

BASE = "http://localhost:8000/api/v1"


async def run_tests():
    async with httpx.AsyncClient(timeout=15) as client:
        results = {}

        # 1. Health
        r = await client.get(f"{BASE}/health")
        results["health"] = {"status": r.status_code, "body": r.json()}

        # 2. Login parent
        r = await client.post(f"{BASE}/auth/login", json={"email": "parent@myuser.com", "password": "parent123"})
        results["login"] = {"status": r.status_code}
        token = r.json().get("access_token", "")
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Demo credentials
        r = await client.get(f"{BASE}/auth/demo-credentials")
        results["demo_credentials"] = {"status": r.status_code, "count": len(r.json().get("credentials", []))}

        # 4. Parent children (attendance summary)
        r = await client.get(f"{BASE}/attendance/parent/children", headers=headers)
        children = r.json()
        results["parent_children"] = {
            "status": r.status_code,
            "count": len(children),
            "children": [
                {
                    "name": c["name"],
                    "presentDays": c["presentDays"],
                    "absentDays": c["absentDays"],
                    "monthlyAttendance": c["monthlyAttendance"],
                }
                for c in children
            ],
        }

        # 5. Calendar for first child (current month)
        if children:
            cid = children[0]["id"]
            r = await client.get(
                f"{BASE}/attendance/parent/children/{cid}/calendar?month=2026-04",
                headers=headers,
            )
            cal = r.json()
            results["calendar"] = {
                "status": r.status_code,
                "child_id": cid,
                "monthSummary": cal.get("monthSummary"),
                "total_days": len(cal.get("days", [])),
                "leave_history_count": len(cal.get("leaveHistory", [])),
            }

        # 6. Homework endpoint
        r = await client.get(f"{BASE}/homeworks/?child_id={children[0]['id']}", headers=headers)
        results["homework"] = {
            "status": r.status_code,
            "count": len(r.json()) if r.status_code == 200 else "N/A",
        }

        # 7. Leave apply test (POST)
        if children:
            cid = children[0]["id"]
            r = await client.post(
                f"{BASE}/attendance/parent/children/{cid}/leave",
                json={"startDate": "2026-04-28", "endDate": "2026-04-29", "reason": "Family function"},
                headers=headers,
            )
            results["leave_apply"] = {"status": r.status_code}
            if r.status_code == 201:
                results["leave_apply"]["id"] = r.json().get("id")

        sys.stdout.buffer.write(json.dumps(results, indent=2, ensure_ascii=True).encode("ascii") + b"\n")


asyncio.run(run_tests())
