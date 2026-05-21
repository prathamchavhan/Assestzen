import asyncio
import datetime
import logging
from typing import List, Optional
import httpx
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("KeepAliveService")

Base = declarative_base()

class KeepAliveTask(Base):
    __tablename__ = "keep_alive_tasks"
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    alias = Column(String, nullable=True)
    interval_minutes = Column(Integer, default=14)
    last_ping = Column(DateTime, nullable=True)
    last_status = Column(Integer, nullable=True) # HTTP status code
    is_active = Column(Boolean, default=True)

# Database setup
DB_URL = "sqlite:///./keep_alive.db"
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class KeepAliveService:
    def __init__(self):
        Base.metadata.create_all(bind=engine)
        self.scheduler = BackgroundScheduler()
        self.client = httpx.AsyncClient()

    def start(self):
        if not self.scheduler.running:
            self.scheduler.start()
            self._load_tasks()
            logger.info("KeepAlive Scheduler started.")

    def stop(self):
        self.scheduler.shutdown()
        logger.info("KeepAlive Scheduler stopped.")

    def _load_tasks(self):
        db = SessionLocal()
        tasks = db.query(KeepAliveTask).filter(KeepAliveTask.is_active == True).all()
        for task in tasks:
            self.schedule_task(task)
        db.close()

    def schedule_task(self, task: KeepAliveTask):
        job_id = f"keep_alive_{task.id}"
        # Remove if exists
        if self.scheduler.get_job(job_id):
            self.scheduler.remove_job(job_id)
        
        self.scheduler.add_job(
            self.ping_endpoint,
            IntervalTrigger(minutes=task.interval_minutes),
            args=[task.id],
            id=job_id,
            replace_existing=True
        )
        logger.info(f"Scheduled task {task.id}: {task.url} every {task.interval_minutes}m")

    def unschedule_task(self, task_id: int):
        job_id = f"keep_alive_{task_id}"
        if self.scheduler.get_job(job_id):
            self.scheduler.remove_job(job_id)
            logger.info(f"Unscheduled task {task_id}")

    def ping_endpoint(self, task_id: int):
        # We need to run the async ping in a synchronous context for APScheduler
        async_loop = asyncio.new_event_loop()
        asyncio.set_event_loop(async_loop)
        try:
            async_loop.run_until_complete(self._ping(task_id))
        finally:
            async_loop.close()

    async def _ping(self, task_id: int):
        db = SessionLocal()
        task = db.query(KeepAliveTask).filter(KeepAliveTask.id == task_id).first()
        if not task or not task.is_active:
            db.close()
            return

        try:
            logger.info(f"Pinging {task.url}...")
            response = await self.client.get(task.url, timeout=10.0)
            task.last_ping = datetime.datetime.utcnow()
            task.last_status = response.status_code
            logger.info(f"Ping {task.url} returned {response.status_code}")
        except Exception as e:
            logger.error(f"Error pinging {task.url}: {e}")
            task.last_ping = datetime.datetime.utcnow()
            task.last_status = 500 # Simulated error status
        
        db.commit()
        db.close()

# CRUD helpers
def get_all_tasks(db: Session) -> List[KeepAliveTask]:
    return db.query(KeepAliveTask).all()

def create_task(db: Session, url: str, alias: Optional[str], interval_minutes: int) -> KeepAliveTask:
    task = KeepAliveTask(url=url, alias=alias, interval_minutes=interval_minutes)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task_id: int) -> bool:
    task = db.query(KeepAliveTask).filter(KeepAliveTask.id == task_id).first()
    if task:
        db.delete(task)
        db.commit()
        return True
    return False

def toggle_task(db: Session, task_id: int) -> Optional[KeepAliveTask]:
    task = db.query(KeepAliveTask).filter(KeepAliveTask.id == task_id).first()
    if task:
        task.is_active = not task.is_active
        db.commit()
        db.refresh(task)
        return task
    return None
