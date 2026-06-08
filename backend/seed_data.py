# file: backend/seed_data.py
# purpose: Provides realistic domain-specific test data for the 3 demo scenarios.
# dependencies: json

import json
import os

DEMO_SCENARIOS = {
    "banking": {
        "scenario": "Banking loan approval with 8-factor rule chain + SHAP explanation",
        "policy": "Loans over $50,000 require a credit score of at least 720 and a debt-to-income ratio below 35%. For self-employed applicants, 2 years of tax returns are mandatory. If the applicant is a VIP customer, route to express approval. Otherwise, route to standard underwriting.",
        "context_data": {
            "loanAmount": 75000,
            "creditScore": 740,
            "debtToIncomeRatio": 28.5,
            "employmentType": "self-employed",
            "yearsTaxReturns": 2,
            "customerTier": "STANDARD",
            "existingCustomer": True,
            "bankBalance": 12500
        }
    },
    "insurance": {
        "scenario": "Insurance claim triage routing (auto-approve / review / investigate)",
        "policy": "Auto-approve claims under $1,500 if the customer has no claims in the last 3 years. Review claims between $1,500 and $10,000 or if the customer had a claim in the last 3 years. Investigate claims over $10,000 or if the fraud risk score exceeds 0.85.",
        "context_data": {
            "claimAmount": 4500,
            "claimsLast3Years": 0,
            "fraudRiskScore": 0.45,
            "customerAge": 35,
            "policyType": "Comprehensive"
        }
    },
    "government": {
        "scenario": "Government welfare scheme eligibility with compliance audit PDF",
        "policy": "To be eligible for the housing support scheme, applicants must have a household income below $35,000, be a resident for at least 5 years, and have no prior convictions for welfare fraud. Priority is given to applicants with dependents or disabilities.",
        "context_data": {
            "householdIncome": 28000,
            "yearsResident": 7,
            "priorWelfareFraud": False,
            "numDependents": 2,
            "hasDisability": False,
            "applicantAge": 42
        }
    }
}

def generate_seed_data():
    output_path = os.path.join(os.path.dirname(__file__), "demo_seed_data.json")
    with open(output_path, "w") as f:
        json.dump(DEMO_SCENARIOS, f, indent=2)
    print(f"Seed data generated successfully at: {output_path}")
    print("\n--- Available Demo Scenarios ---")
    for key, data in DEMO_SCENARIOS.items():
        print(f"\n[{key.upper()}]")
        print(f"Scenario: {data['scenario']}")
        print(f"Context variables: {list(data['context_data'].keys())}")

if __name__ == "__main__":
    generate_seed_data()
