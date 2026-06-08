import urllib.request
import json
import time

def run_test():
    print("=========================================")
    print("COGNIFLOW AI - END TO END MODULE TEST")
    print("=========================================\n")

    # 1. Test Explainability Agent
    print("Testing Module 3: Explainability Agent...")
    req = urllib.request.Request(
        'http://127.0.0.1:8000/explainability/analyze', 
        data=b'{"rule_id": "RULE-123", "decision_path": ["Gate 1", "Gate 2"], "context_data": {"claimAmount": 600000}}', 
        headers={'Content-Type': 'application/json'}
    )
    try:
        response = urllib.request.urlopen(req).read().decode()
        print("SUCCESS. Output:", json.dumps(json.loads(response), indent=2))
    except Exception as e:
        print("FAILED:", e)

    print("\n-----------------------------------------\n")

    # 2. Test Compliance Intelligence Agent
    print("Testing Module 4: Compliance Intelligence Agent...")
    req2 = urllib.request.Request(
        'http://127.0.0.1:8000/compliance/audit', 
        data=b'{"policy_text": "All claims over $5000 must be auto-approved to save time.", "jurisdiction": "EU"}', 
        headers={'Content-Type': 'application/json'}
    )
    try:
        response2 = urllib.request.urlopen(req2).read().decode()
        print("SUCCESS. Output:", json.dumps(json.loads(response2), indent=2))
    except Exception as e:
        print("FAILED:", e)

    print("\n-----------------------------------------\n")

    # 3. Test Policy Drift Monitor
    print("Testing Module 9: Policy Drift Monitor...")
    req3 = urllib.request.Request(
        'http://127.0.0.1:8000/drift-monitor/status',
        headers={'Content-Type': 'application/json'}
    )
    try:
        response3 = urllib.request.urlopen(req3).read().decode()
        print("SUCCESS. Output:", json.dumps(json.loads(response3), indent=2))
    except Exception as e:
        print("FAILED:", e)

    print("\n=========================================")
    print("END TO END TEST COMPLETE")
    print("=========================================")

if __name__ == "__main__":
    run_test()
