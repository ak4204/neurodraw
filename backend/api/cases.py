"""
api/cases.py — Session history endpoints.
GET/DELETE operations on the in-memory case store.
"""

from fastapi import APIRouter, HTTPException, Request

router = APIRouter()


@router.get("/cases")
async def list_cases(request: Request):
    """Return all cases, sorted newest first."""
    cases = list(request.app.state.cases.values())
    cases.sort(key=lambda c: c.get("timestamp", ""), reverse=True)
    return {"cases": cases, "count": len(cases)}


@router.get("/cases/{case_id}")
async def get_case(case_id: str, request: Request):
    """Return a single case by ID."""
    case = request.app.state.cases.get(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found")
    return case


@router.delete("/cases/{case_id}")
async def delete_case(case_id: str, request: Request):
    """Delete a case from session history."""
    if case_id not in request.app.state.cases:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found")
    del request.app.state.cases[case_id]
    return {"deleted": case_id}
