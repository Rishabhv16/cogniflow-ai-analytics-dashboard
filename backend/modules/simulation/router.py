from fastapi import APIRouter
from pydantic import BaseModel
import time

router = APIRouter(prefix="/simulation", tags=["Simulation Lab"])

class SimulationRequest(BaseModel):
    approvalAggression: float
    interestSensitivity: float
    riskThreshold: float

class SimulationResult(BaseModel):
    computedApproval: float
    computedRevenue: float
    computedRisk: float

@router.post("/run", response_model=SimulationResult)
def run_simulation(req: SimulationRequest):
    # Simulate a backend heavy calculation
    time.sleep(1.5) # Fake delay
    
    # Mathematical models representing backend logic
    base_approval = 18.4
    base_revenue = 1.2
    base_risk = 4.1
    
    computed_approval = base_approval + (req.approvalAggression - 85) / 10
    computed_revenue = base_revenue + (req.interestSensitivity - 75) / 50
    computed_risk = base_risk + (req.riskThreshold - 40) / 25
    
    # Cap values sensibly
    computed_approval = max(0, min(100, computed_approval))
    computed_revenue = max(0, computed_revenue)
    computed_risk = max(0, computed_risk)
    
    return SimulationResult(
        computedApproval=round(computed_approval, 1),
        computedRevenue=round(computed_revenue, 1),
        computedRisk=round(computed_risk, 1)
    )
