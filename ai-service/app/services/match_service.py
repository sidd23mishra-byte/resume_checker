from app.services.skill_service import SkillService
from app.services.embedding_service import EmbeddingService

skill_service = SkillService()
embedding_service = EmbeddingService()  # instantiate once


def calculate_match(user_text: str, job_text: str):
    # Extract skills
    user_skills = skill_service.extract_skills(user_text)
    job_skills = skill_service.extract_skills(job_text)

    # Skill overlap
    matched_skills = list(set(user_skills) & set(job_skills))
    missing_skills = list(set(job_skills) - set(user_skills))

    skill_score = len(matched_skills) / len(job_skills) if job_skills else 0

    # Embedding similarity
    embedding_score = embedding_service.calculate_similarity(user_text, job_text)

    # Final weighted score
    final_score = (0.6 * skill_score) + (0.4 * embedding_score)

    # Example suggestions: suggest missing skills
    suggestions = [f"Consider adding {skill}" for skill in missing_skills]

    # Example ATS score: simple heuristic (can be improved)
    ats_score = round(final_score * 100, 2)

    return {
        "final_score": final_score,
        "skill_score": skill_score,
        "embedding_score": embedding_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggestions": suggestions,
        "ats_score": ats_score
    }