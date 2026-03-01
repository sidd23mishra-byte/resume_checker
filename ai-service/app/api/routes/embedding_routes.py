from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
import uuid
import os
import logging

from app.services.embedding_service import EmbeddingService
from app.services.pdf_service import PDFService
from app.services.skill_service import SkillService
from app.services.match_service import calculate_match

router = APIRouter()

embedding_service = EmbeddingService()
pdf_service = PDFService()
skill_service = SkillService()
logger = logging.getLogger(__name__)

# Pydantic model for JSON requests
class ResumeMatchRequest(BaseModel):
    resume_text: str
    job_description: str


@router.post("/resume-match")
async def resume_match(request: ResumeMatchRequest):
    try:
        resume_text = request.resume_text
        job_desc = request.job_description  # fixed typo

        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Resume text is empty")
        if not job_desc.strip():
            raise HTTPException(status_code=400, detail="Job description is empty")

        # Calculate match
        result = calculate_match(resume_text, job_desc)
        match_percentage = round(result.get("final_score", 0) * 100, 2)

        return {
            "success": True,
            "data": {
                "matchPercentage": round(result["final_score"] * 100, 2),
                "skillScore": round(result["skill_score"] * 100, 2),
                "embeddingScore": round(result["embedding_score"] * 100, 2),
                "matchedSkills": result["matched_skills"],
                "missingSkills": result["missing_skills"],
                "suggestions": result["suggestions"],
                "atsScore": result["ats_score"]
    }
        }

    except Exception as e:
        # 🔥 Log full traceback for debugging
        import traceback
        tb = traceback.format_exc()
        print("FastAPI Error Traceback:\n", tb)
        raise HTTPException(status_code=500, detail=f"FastAPI internal error: {str(e)}")