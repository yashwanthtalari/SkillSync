import pytest
from app.ai.task_parser import ai_task_parser

@pytest.mark.asyncio
async def test_ai_task_parser_fallback():
    prompt = "I need someone to build a Python script that scrapes product prices from 5 websites. I need it by tomorrow evening. Budget is Rs 1500."
    parsed = await ai_task_parser.parse_task_description(prompt)

    assert parsed.title is not None
    assert parsed.category in ["Programming", "Web Development"]
    assert any(s.name in ["Python", "Web Scraping"] for s in parsed.skills)
    assert parsed.suggested_budget_min <= 1500.0
    assert parsed.deadline_days >= 1
