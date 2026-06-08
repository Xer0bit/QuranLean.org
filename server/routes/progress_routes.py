from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, User, TypingSession, Progress
from auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api", tags=["progress"])


class SessionBody(BaseModel):
    surah_id: int
    surah_name: str
    ayah_key: str
    wpm: float
    accuracy: float
    ayah_index: int


@router.post("/session")
def save_session(body: SessionBody, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = TypingSession(
        user_id=user.id,
        surah_id=body.surah_id,
        surah_name=body.surah_name,
        ayah_key=body.ayah_key,
        wpm=body.wpm,
        accuracy=body.accuracy,
    )
    db.add(session)

    prog = db.query(Progress).filter(
        Progress.user_id == user.id,
        Progress.surah_id == body.surah_id,
    ).first()
    if prog:
        prog.last_ayah_index = max(prog.last_ayah_index, body.ayah_index)
        prog.ayahs_completed += 1
        prog.updated_at = datetime.utcnow()
    else:
        prog = Progress(
            user_id=user.id,
            surah_id=body.surah_id,
            surah_name=body.surah_name,
            last_ayah_index=body.ayah_index,
            ayahs_completed=1,
        )
        db.add(prog)

    db.commit()
    return {"ok": True}


@router.get("/progress")
def get_progress(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(Progress).filter(Progress.user_id == user.id).all()
    return [
        {
            "surah_id": r.surah_id,
            "surah_name": r.surah_name,
            "last_ayah_index": r.last_ayah_index,
            "ayahs_completed": r.ayahs_completed,
            "updated_at": r.updated_at.isoformat(),
        }
        for r in rows
    ]


@router.get("/stats")
def get_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total_sessions = db.query(TypingSession).filter(TypingSession.user_id == user.id).count()
    avg_wpm = db.query(func.avg(TypingSession.wpm)).filter(TypingSession.user_id == user.id).scalar() or 0
    avg_acc = db.query(func.avg(TypingSession.accuracy)).filter(TypingSession.user_id == user.id).scalar() or 0
    best_wpm = db.query(func.max(TypingSession.wpm)).filter(TypingSession.user_id == user.id).scalar() or 0
    recent = (
        db.query(TypingSession)
        .filter(TypingSession.user_id == user.id)
        .order_by(TypingSession.completed_at.desc())
        .limit(10)
        .all()
    )
    return {
        "total_ayahs": total_sessions,
        "avg_wpm": round(avg_wpm, 1),
        "avg_accuracy": round(avg_acc, 1),
        "best_wpm": round(best_wpm, 1),
        "recent": [
            {
                "surah_name": s.surah_name,
                "ayah_key": s.ayah_key,
                "wpm": s.wpm,
                "accuracy": s.accuracy,
                "completed_at": s.completed_at.isoformat(),
            }
            for s in recent
        ],
    }
