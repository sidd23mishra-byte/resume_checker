import re


class SkillService:

    def __init__(self):

        self.skills_db = [
            "python", "java", "c++", "javascript",
            "react", "node", "fastapi", "django",
            "docker", "kubernetes", "aws",
            "machine learning", "deep learning",
            "tensorflow", "pytorch", "mongodb",
            "sql", "postgresql",
            "html", "css"
        ]

        # NEW: synonym mapping
        self.synonyms = {
            "js": "javascript",
            "reactjs": "react",
            "nodejs": "node",
            "ml": "machine learning",
            "dl": "deep learning",
            "postgres": "postgresql"
        }

        self.role_mapping = {
            "web developer": ["html", "css", "javascript", "react", "node"],
            "frontend developer": ["html", "css", "javascript", "react"],
            "backend developer": ["python", "java", "node", "sql"],
            "data scientist": ["python", "machine learning", "tensorflow", "pytorch"],
            "devops engineer": ["docker", "kubernetes", "aws"]
        }

    def extract_skills(self, text: str):
        text = text.lower()
        found_skills = set()

        # 1️⃣ Replace synonyms
        for short, full in self.synonyms.items():
            text = text.replace(short, full)

        # 2️⃣ Direct match
        for skill in self.skills_db:
            if re.search(r'\b' + re.escape(skill) + r'\b', text):
                found_skills.add(skill)

        # 3️⃣ Role expansion
        for role, skills in self.role_mapping.items():
            if role in text:
                found_skills.update(skills)

        return list(found_skills)