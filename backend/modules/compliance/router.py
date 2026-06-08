# file: backend/modules/compliance/router.py
# purpose: FastAPI router for Compliance Intelligence Agent.
# dependencies: fastapi

from fastapi import APIRouter
from .agent import ComplianceRequest, ComplianceResult, check_compliance

router = APIRouter(prefix="/compliance", tags=["Compliance Intelligence"])

@router.post("/audit", response_model=ComplianceResult)
def audit_policy(request: ComplianceRequest):
    return check_compliance(request)

from typing import List, Dict, Any
from datetime import datetime, timedelta
import random
import time

@router.get("/logs")
def get_audit_logs() -> List[Dict[str, Any]]:
    logs = []
    now = datetime.now()
    subjects = ["Rule Execution", "Data Access", "Model Update", "Policy Change"]
    actors = ["system", "admin_user", "ai_copilot", "compliance_officer"]
    
    for i in range(12):
        time_offset = now - timedelta(minutes=i*15 + random.randint(1, 10))
        logs.append({
            "id": f"log_{1000 + i}",
            "timestamp": time_offset.strftime("%Y-%m-%d %H:%M:%S"),
            "subject": random.choice(subjects),
            "actionAndActor": f"{random.choice(['Viewed', 'Modified', 'Approved', 'Rejected'])} by {random.choice(actors)}",
            "actorType": random.choice(["ai", "user"]),
            "simulationResult": random.choice(["PASS", "FAIL", "WARN"]),
            "simulationPassed": random.choice([True, True, True, False]),
            "verificationStatus": random.choice(["SIGNED_HASHED", "VERIFIED", "PENDING_AUDIT"])
        })
    return logs

from pydantic import BaseModel

class VerifyRequest(BaseModel):
    log_id: str

@router.post("/verify")
def verify_hash(req: VerifyRequest):
    time.sleep(1.2) # Simulate crypto work
    return {
        "status": "success",
        "log_id": req.log_id,
        "hash": f"0x{''.join(random.choices('0123456789abcdef', k=64))}",
        "verified_at": datetime.now().isoformat()
    }
