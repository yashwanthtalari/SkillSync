import re
import json
import httpx
from typing import Dict, Any, List
from app.core.config import settings
from app.schemas.schemas import TaskAnalyzeResponse, AnalyzedSkillItem

class AITaskParser:
    def __init__(self):
        self.provider = settings.AI_PROVIDER.lower()
        self.base_url = settings.AI_BASE_URL
        self.api_key = settings.AI_API_KEY
        self.model = settings.AI_MODEL

    async def parse_task_description(self, description: str) -> TaskAnalyzeResponse:
        """Parses a natural language task description into a structured TaskAnalyzeResponse.
        Uses configured LLM provider or falls back to rule-based NLP extraction gracefully.
        """
        if self.provider in ["openai", "ollama"] and self.api_key:
            try:
                llm_result = await self._call_llm_provider(description)
                if llm_result:
                    return llm_result
            except Exception as e:
                print(f"AI Provider error ({self.provider}): {e}. Falling back to structured NLP parser.")

        # Structured rule-based heuristic fallback
        return self._heuristic_fallback_parse(description)

    async def _call_llm_provider(self, description: str) -> TaskAnalyzeResponse | None:
        prompt = f"""You are an AI task extraction engine for Skill2Pocket micro-task marketplace.
Analyze the following student micro-task description and return ONLY a raw valid JSON object with NO markdown or commentary:
{{
  "title": "Short descriptive title (max 10 words)",
  "category": "One of: Programming, Graphic Design, Content Writing, Video Editing, Data Science, Digital Marketing, Tutoring, Administrative",
  "skills": [
    {{"name": "SkillName", "level": "beginner|intermediate|advanced|expert"}}
  ],
  "estimated_hours": 4.0,
  "complexity": "low|medium|high",
  "deadline_days": 2,
  "suggested_budget_min": 1000.0,
  "suggested_budget_max": 2000.0
}}

Task Description:
"{description}"
"""
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        if self.provider == "openai":
            url = f"{self.base_url}/v1/chat/completions"
            payload = {
                "model": self.model or "gpt-3.5-turbo",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2
            }
        else: # ollama
            url = f"{self.base_url}/api/generate"
            payload = {
                "model": self.model or "llama3",
                "prompt": prompt,
                "stream": False
            }

        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(url, json=payload, headers=headers)
            if res.status_code == 200:
                data = res.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "") if self.provider == "openai" else data.get("response", "")
                
                # Clean JSON code block wrappers if any
                clean_json = re.sub(r"```json\s*|\s*```", "", content).strip()
                parsed = json.loads(clean_json)
                return TaskAnalyzeResponse(**parsed)
        return None

    def _heuristic_fallback_parse(self, description: str) -> TaskAnalyzeResponse:
        desc_lower = description.lower()

        # 1. Budget extraction (e.g. ₹1500, Rs 1500, $50, 1500 rupees, 1000-2000)
        budget_matches = re.findall(r"(?:₹|rs\.?|inr|\$)?\s*(\d{3,6})(?:\s*(?:to|-|–)\s*(\d{3,6}))?", desc_lower)
        b_min = 1000.0
        b_max = 1500.0
        if budget_matches:
            match = budget_matches[0]
            val1 = float(match[0])
            val2 = float(match[1]) if match[1] else val1 * 1.2
            b_min = min(val1, val2)
            b_max = max(val1, val2)

        # 2. Skill & Category Detection
        skills = []
        category = "Programming"

        skill_keywords = {
            "Python": ["python", "django", "fastapi", "flask", "script", "scraper", "crawling"],
            "Web Scraping": ["scrape", "scraping", "beautifulsoup", "selenium", "puppeteer", "crawler"],
            "React": ["react", "next.js", "nextjs", "jsx", "tsx", "frontend"],
            "Node.js": ["node", "express", "backend", "api"],
            "Graphic Design": ["design", "poster", "logo", "canva", "figma", "photoshop", "banner", "thumbnail"],
            "Video Editing": ["edit video", "reels", "shorts", "premiere", "capcut", "youtube video"],
            "Content Writing": ["write", "article", "blog", "content", "essay", "copywriting", "proofread"],
            "Data Analysis": ["data", "excel", "pandas", "visualization", "analysis", "sql", "powerbi"],
            "Social Media": ["instagram", "social media", "marketing", "ads", "seo"],
            "Tutoring": ["tutor", "math", "physics", "assignment", "help learn"]
        }

        category_map = {
            "Python": "Programming",
            "Web Scraping": "Programming",
            "React": "Web Development",
            "Node.js": "Web Development",
            "Graphic Design": "Design",
            "Video Editing": "Media & Video",
            "Content Writing": "Writing & Content",
            "Data Analysis": "Data Science",
            "Social Media": "Digital Marketing",
            "Tutoring": "Tutoring"
        }

        detected_skills = []
        for skill_name, keywords in skill_keywords.items():
            if any(kw in desc_lower for kw in keywords):
                level = "intermediate"
                if any(w in desc_lower for w in ["expert", "advanced", "complex"]):
                    level = "advanced"
                elif any(w in desc_lower for w in ["simple", "easy", "basic"]):
                    level = "beginner"
                detected_skills.append(AnalyzedSkillItem(name=skill_name, level=level))

        if detected_skills:
            skills = detected_skills
            category = category_map.get(skills[0].name, "Programming")
        else:
            skills = [
                AnalyzedSkillItem(name="Python", level="intermediate"),
                AnalyzedSkillItem(name="Web Scraping", level="intermediate")
            ]

        # 3. Estimated Hours & Deadline extraction
        est_hours = 3.0
        if "today" in desc_lower or "tonight" in desc_lower or "urgent" in desc_lower:
            deadline_days = 1
            est_hours = 2.0
        elif "tomorrow" in desc_lower:
            deadline_days = 2
            est_hours = 3.5
        elif "week" in desc_lower:
            deadline_days = 7
            est_hours = 10.0
        else:
            deadline_days = 3

        # 4. Title generation
        first_sentence = description.split(".")[0]
        title = first_sentence[:60].strip()
        if len(title) < 10:
            title = f"{category} Micro-task"

        complexity = "medium"
        if est_hours > 8 or len(skills) > 3:
            complexity = "high"
        elif est_hours <= 2:
            complexity = "low"

        return TaskAnalyzeResponse(
            title=title.capitalize(),
            category=category,
            skills=skills,
            estimated_hours=est_hours,
            complexity=complexity,
            deadline_days=deadline_days,
            suggested_budget_min=b_min,
            suggested_budget_max=b_max
        )

ai_task_parser = AITaskParser()
