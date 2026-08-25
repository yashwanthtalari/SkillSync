import os
import sys
import uuid
import asyncio
from datetime import datetime, timezone, timedelta

# Append backend directory to path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend"))
sys.path.append(backend_path)

from app.core.database import async_engine, AsyncSessionLocal, SyncSessionLocal, sync_engine, Base
from app.core.security import get_password_hash
from app.models.models import (
    User, StudentProfile, ClientProfile, Skill, StudentSkill, StudentAvailability,
    Task, TaskSkill, Application, TaskMatch, Review, UserRole, WorkMode,
    VerificationStatus, TaskStatus, ProficiencyLevel, ApplicationStatus
)

async def async_seed():
    print("Initializing Database Schema (Async)...")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if user already exists
        from sqlalchemy.future import select
        res = await session.execute(select(User))
        if res.scalars().first():
            print("Database already contains seeded data. Skipping re-seed.")
            return

        print("Seeding Skills...")
        skills_data = [
            ("Python", "Programming", "Python script automation, web scraping, backend development"),
            ("Web Scraping", "Programming", "BeautifulSoup, Selenium, Scrapy, API extraction"),
            ("React", "Web Development", "React.js, Next.js, TypeScript, Tailwind CSS"),
            ("Node.js", "Web Development", "Express.js, REST APIs, Node backend"),
            ("Graphic Design", "Design", "Photoshop, Canva, Illustrator, poster & banner creation"),
            ("Figma", "Design", "UI/UX design, wireframing, mobile app mockups"),
            ("Video Editing", "Media & Video", "Premiere Pro, CapCut, Instagram Reels, YouTube shorts"),
            ("Content Writing", "Writing", "Blog writing, SEO content, technical documentation"),
            ("Data Analysis", "Data Science", "Pandas, NumPy, Excel, data visualization"),
            ("SQL", "Data Science", "PostgreSQL, MySQL, query optimization"),
            ("Social Media Marketing", "Digital Marketing", "Instagram growth, content calendar, ad campaigns"),
            ("SEO", "Digital Marketing", "On-page SEO, keyword research, meta tags optimization"),
            ("Mathematics Tutoring", "Tutoring", "Calculus, Linear Algebra, College level Math tutoring"),
            ("Physics Tutoring", "Tutoring", "Mechanics, Electromagnetism college tutoring"),
            ("Canva", "Design", "Quick social media posters, presentations, graphics"),
            ("CapCut", "Media & Video", "Fast vertical video editing for Reels & TikTok"),
            ("Excel / Google Sheets", "Administrative", "Data entry, formulas, pivot tables, dashboard creation"),
            ("Proofreading", "Writing", "Grammar correction, essay review, formatting"),
            ("Logo Design", "Design", "Brand identity, vector logos, brand guidelines"),
            ("Copywriting", "Writing", "Ad copy, landing page copy, sales email copy")
        ]

        skill_objs = {}
        for name, category, desc in skills_data:
            s = Skill(id=uuid.uuid4(), name=name, category=category, description=desc)
            session.add(s)
            skill_objs[name] = s

        await session.flush()

        print("Seeding Students...")
        students_info = [
            ("Test Student", "student@test.com", "Test University", "B.Tech Computer Science", 2026, 400.0, "remote", 99.0, 10, 5.0, [("Python", "expert", 3.0), ("React", "advanced", 2.0), ("Web Scraping", "intermediate", 1.5)]),
            ("Aarav Sharma", "aarav.student@skill2pocket.com", "IIT Bombay", "B.Tech Computer Science", 2026, 400.0, "remote", 98.0, 12, 4.9, [("Python", "expert", 3.0), ("Web Scraping", "advanced", 2.0), ("SQL", "intermediate", 1.5)]),
            ("Priya Patel", "priya.student@skill2pocket.com", "BITS Pilani", "B.E. Computer Science", 2025, 350.0, "remote", 96.0, 9, 4.8, [("React", "advanced", 2.0), ("Node.js", "intermediate", 1.5), ("Figma", "intermediate", 1.0)]),
            ("Rohan Mehta", "rohan.student@skill2pocket.com", "Delhi Technological University", "B.Tech IT", 2026, 300.0, "remote", 92.0, 6, 4.7, [("Graphic Design", "advanced", 2.5), ("Canva", "expert", 3.0), ("Logo Design", "intermediate", 1.5)]),
            ("Ananya Verma", "ananya.student@skill2pocket.com", "St. Xavier's College Mumbai", "B.A. Mass Communication", 2025, 250.0, "remote", 95.0, 8, 4.9, [("Video Editing", "advanced", 2.0), ("CapCut", "expert", 2.5), ("Social Media Marketing", "intermediate", 1.5)]),
            ("Vikram Singh", "vikram.student@skill2pocket.com", "IIT Delhi", "B.Tech Electrical", 2027, 300.0, "remote", 90.0, 4, 4.6, [("Content Writing", "advanced", 2.0), ("Proofreading", "expert", 2.5), ("Copywriting", "intermediate", 1.0)]),
            ("Kavya Nair", "kavya.student@skill2pocket.com", "RV College of Engineering Bangalore", "B.E. Data Science", 2026, 380.0, "remote", 97.0, 11, 4.9, [("Data Analysis", "expert", 3.0), ("Python", "advanced", 2.5), ("SQL", "advanced", 2.0), ("Excel / Google Sheets", "expert", 3.0)]),
            ("Aditya Kumar", "aditya.student@skill2pocket.com", "SRM University Chennai", "B.Tech Mechanical", 2025, 200.0, "hybrid", 88.0, 3, 4.5, [("Mathematics Tutoring", "expert", 3.0), ("Physics Tutoring", "advanced", 2.0)]),
            ("Sneha Reddy", "sneha.student@skill2pocket.com", "Hyderabad Central University", "M.Sc Statistics", 2025, 320.0, "remote", 94.0, 7, 4.8, [("Data Analysis", "advanced", 2.0), ("Excel / Google Sheets", "expert", 3.0), ("SEO", "intermediate", 1.0)]),
            ("Devansh Gupta", "devansh.student@skill2pocket.com", "IIIT Hyderabad", "B.Tech CSE", 2026, 450.0, "remote", 99.0, 15, 5.0, [("Python", "expert", 3.5), ("React", "advanced", 2.0), ("Node.js", "advanced", 2.0)]),
            ("Meera Iyer", "meera.student@skill2pocket.com", "NIFT NIFT Bangalore", "B.Des Fashion Communication", 2026, 280.0, "remote", 91.0, 5, 4.7, [("Figma", "advanced", 2.0), ("Graphic Design", "expert", 3.0), ("Canva", "expert", 3.0)])
        ]

        student_objs = []
        for name, email, univ, deg, grad, rate, wmode, rel, comp, rat, s_skills in students_info:
            u = User(
                id=uuid.uuid4(),
                email=email,
                password_hash=get_password_hash("password123"),
                role=UserRole.STUDENT.value
            )
            session.add(u)
            await session.flush()

            sp = StudentProfile(
                id=uuid.uuid4(),
                user_id=u.id,
                full_name=name,
                university=univ,
                degree=deg,
                graduation_year=grad,
                bio=f"Passionate {deg} student at {univ}. Experienced in project delivery.",
                hourly_rate=rate,
                work_mode=wmode,
                reliability_score=rel,
                completed_tasks=comp,
                average_rating=rat,
                verification_status=VerificationStatus.VERIFIED.value
            )
            session.add(sp)
            await session.flush()
            student_objs.append(sp)

            for sname, level, exp in s_skills:
                if sname in skill_objs:
                    ss = StudentSkill(
                        id=uuid.uuid4(),
                        student_id=sp.id,
                        skill_id=skill_objs[sname].id,
                        proficiency_level=level,
                        years_experience=exp
                    )
                    session.add(ss)

            for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]:
                sa = StudentAvailability(
                    id=uuid.uuid4(),
                    student_id=sp.id,
                    day_of_week=day,
                    start_time="14:00",
                    end_time="20:00",
                    timezone="IST"
                )
                session.add(sa)

        await session.flush()

        print("Seeding Clients...")
        clients_info = [
            ("Test Client", "client@test.com", "Test Organization"),
            ("Rajesh Agarwal", "client.rajesh@techverse.in", "TechVerse Solutions"),
            ("Anita Roy", "client.anita@creativeminds.io", "CreativeMinds Agency"),
            ("Siddharth Kapoor", "client.siddharth@growthlabs.co", "GrowthLabs Startup"),
            ("Neha Sharma", "client.neha@edulearn.org", "EduLearn India"),
            ("Manish Joshi", "client.manish@shopcraft.in", "ShopCraft E-Commerce")
        ]


        client_objs = []
        for name, email, org in clients_info:
            u = User(
                id=uuid.uuid4(),
                email=email,
                password_hash=get_password_hash("password123"),
                role=UserRole.CLIENT.value
            )
            session.add(u)
            await session.flush()

            cp = ClientProfile(
                id=uuid.uuid4(),
                user_id=u.id,
                full_name=name,
                organization_name=org,
                bio=f"Founder / Manager at {org}. Hiring university talent for micro-tasks.",
                verification_status=VerificationStatus.VERIFIED.value
            )
            session.add(cp)
            await session.flush()
            client_objs.append(cp)

        print("Seeding Tasks...")
        now = datetime.now(timezone.utc)
        tasks_info = [
            (
                client_objs[0].id,
                "Python E-Commerce Price Scraper",
                "Build a Python script using BeautifulSoup or Selenium to scrape product prices, ratings, and stock status from 5 Indian e-commerce sites into a clean JSON file.",
                "Programming", 1200.0, 1800.0, now + timedelta(days=2), 3.5, "remote",
                [("Python", "advanced", "must_have"), ("Web Scraping", "intermediate", "must_have")]
            ),
            (
                client_objs[1].id,
                "Instagram Reel & Poster Graphic Design Pack",
                "Create 5 high-converting Instagram promo graphics and 2 short video cover templates on Canva or Photoshop for our upcoming product launch.",
                "Design", 800.0, 1500.0, now + timedelta(days=1), 2.0, "remote",
                [("Graphic Design", "intermediate", "must_have"), ("Canva", "expert", "must_have")]
            ),
            (
                client_objs[0].id,
                "React & Next.js Landing Page Component",
                "Build a clean responsive hero section component in Next.js, React, and Tailwind CSS with smooth hover animations.",
                "Web Development", 1500.0, 2500.0, now + timedelta(days=3), 4.0, "remote",
                [("React", "intermediate", "must_have"), ("Node.js", "beginner", "nice_to_have")]
            ),
            (
                client_objs[2].id,
                "Data Analysis & Excel Pivot Chart Dashboard",
                "Clean a dataset of 5,000 sales transactions in Excel/Pandas and build an interactive chart dashboard summarizing monthly revenue and top customer segments.",
                "Data Science", 1000.0, 2000.0, now + timedelta(days=2), 3.0, "remote",
                [("Data Analysis", "intermediate", "must_have"), ("Excel / Google Sheets", "advanced", "must_have")]
            ),
            (
                client_objs[3].id,
                "Engineering Calculus & Linear Algebra Tutoring",
                "Conduct 2 one-hour online tutoring sessions explaining Multivariable Calculus and Matrix Diagonalization for first-year engineering students.",
                "Tutoring", 1000.0, 1600.0, now + timedelta(days=4), 2.0, "remote",
                [("Mathematics Tutoring", "expert", "must_have")]
            ),
            (
                client_objs[1].id,
                "Video Editing for YouTube Shorts & Reels",
                "Edit 3 raw 5-minute talking head videos into engaging 60-second YouTube Shorts with auto-captions, sound effects, and smooth transitions.",
                "Media & Video", 1200.0, 2200.0, now + timedelta(days=2), 3.0, "remote",
                [("Video Editing", "advanced", "must_have"), ("CapCut", "expert", "must_have")]
            ),
            (
                client_objs[2].id,
                "Blog Post & Technical Article Writing",
                "Write a 1200-word SEO optimized blog article on 'Top AI Tools for Indian University Students in 2026'. Clear headings and engaging tone.",
                "Writing", 700.0, 1400.0, now + timedelta(days=3), 2.5, "remote",
                [("Content Writing", "intermediate", "must_have"), ("SEO", "beginner", "nice_to_have")]
            ),
            (
                client_objs[4].id,
                "Figma Mobile App UI Wireframe Mockup",
                "Design a 4-screen mobile app onboarding and product detail wireframe in Figma for a student marketplace app.",
                "Design", 1500.0, 3000.0, now + timedelta(days=5), 5.0, "remote",
                [("Figma", "advanced", "must_have"), ("Graphic Design", "intermediate", "nice_to_have")]
            )
        ]

        for c_id, title, desc, cat, bmin, bmax, dline, hrs, wmode, t_skills in tasks_info:
            t = Task(
                id=uuid.uuid4(),
                client_id=c_id,
                title=title,
                description=desc,
                category=cat,
                budget_min=bmin,
                budget_max=bmax,
                deadline=dline,
                estimated_hours=hrs,
                work_mode=wmode,
                status=TaskStatus.OPEN.value
            )
            session.add(t)
            await session.flush()

            for sname, req_lvl, imp in t_skills:
                if sname in skill_objs:
                    ts = TaskSkill(
                        id=uuid.uuid4(),
                        task_id=t.id,
                        skill_id=skill_objs[sname].id,
                        required_level=req_lvl,
                        importance=imp
                    )
                    session.add(ts)

        await session.commit()
        print("Successfully seeded Skill2Pocket database!")
        print("\n--- Seed Accounts Summary ---")
        print("Student Account: aarav.student@skill2pocket.com | Password: password123")
        print("Client Account:  client.rajesh@techverse.in   | Password: password123")

def seed_database():
    try:
        asyncio.run(async_seed())
    except Exception as e:
        err_str = str(e)
        print(f"\n==================================================")
        print(f"[SEED WARNING] Database seeding skipped or encountered an error:")
        print(f"  {e}")
        if "101" in err_str or "Network is unreachable" in err_str:
            print(f"\n[TROUBLESHOOTING GUIDE FOR RENDER DEPLOYMENT]")
            print(f"  Render free services do not support outbound IPv6 connections.")
            print(f"  1) Direct Supabase host (db.xxx.supabase.co) resolves to IPv6 and will fail with Errno 101.")
            print(f"  2) To fix: Use Supabase Connection Pooler (IPv4) URL in DATABASE_URL:")
            print(f"     postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres")
            print(f"  3) Or omit DATABASE_URL in Render Environment Variables to default to local SQLite.")
        print(f"==================================================\n")
        print("Continuing server startup...")

if __name__ == "__main__":
    seed_database()

