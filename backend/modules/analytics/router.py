from fastapi import APIRouter
from typing import List, Dict, Any
import random
from datetime import datetime, timedelta

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/metrics")
def get_metrics():
    # Simulate slightly changing real-time metrics
    return {
        "totalEvaluations": f"{random.randint(120, 130)}K",
        "approvalRate": f"{random.uniform(98.5, 99.5):.1f}%",
        "latency": f"{random.randint(40, 50)}ms",
        "activeRules": random.randint(240, 250)
    }

@router.get("/stream")
def get_stream() -> List[Dict[str, Any]]:
    entities = ["Claim", "Tx", "User", "Policy"]
    actions = ["APPROVED", "REJECTED", "ESCALATED"]
    reasons = {
        "APPROVED": ["Rule matched", "Threshold met", "Verified ID"],
        "REJECTED": ["Risk too high", "Missing doc", "Velocity limit"],
        "ESCALATED": ["Manual review required", "Anomaly detected", "High value"]
    }
    
    stream = []
    now = datetime.now()
    for i in range(10):
        action = random.choice(actions)
        reason = random.choice(reasons[action])
        time_offset = now - timedelta(seconds=i*3 + random.randint(1, 5))
        
        stream.append({
            "timestamp": time_offset.strftime("%H:%M:%S.") + str(time_offset.microsecond)[:2],
            "entityId": f"{random.choice(entities)}-{random.randint(1000, 9999)}",
            "action": action,
            "reasoning": reason
        })
    return stream

@router.get("/volume")
def get_volume() -> List[Dict[str, Any]]:
    # Generate 7 days of volume
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    volume = []
    for day in days:
        volume.append({
            "name": day,
            "decisions": random.randint(2000, 6000),
            "flagged": random.randint(100, 500)
        })
    return volume
