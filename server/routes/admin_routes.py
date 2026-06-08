from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, User, TypingSession, Progress
from auth import require_admin
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
def admin_stats(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    total_users = db.query(User).count()
    total_sessions = db.query(TypingSession).count()
    avg_wpm = db.query(func.avg(TypingSession.wpm)).scalar() or 0
    avg_acc = db.query(func.avg(TypingSession.accuracy)).scalar() or 0

    top_surahs = (
        db.query(TypingSession.surah_name, func.count(TypingSession.id).label("count"))
        .group_by(TypingSession.surah_name)
        .order_by(func.count(TypingSession.id).desc())
        .limit(5)
        .all()
    )

    return {
        "total_users": total_users,
        "total_sessions": total_sessions,
        "avg_wpm": round(avg_wpm, 1),
        "avg_accuracy": round(avg_acc, 1),
        "top_surahs": [{"name": r[0], "count": r[1]} for r in top_surahs],
    }


@router.get("/users")
def list_users(
    page: int = 1,
    per_page: int = 20,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    offset = (page - 1) * per_page
    total = db.query(User).count()
    users = db.query(User).order_by(User.created_at.desc()).offset(offset).limit(per_page).all()
    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "users": [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "is_admin": u.is_admin,
                "is_active": u.is_active,
                "google": u.google_id is not None,
                "created_at": u.created_at.isoformat(),
                "last_seen": u.last_seen.isoformat() if u.last_seen else None,
                "sessions": db.query(TypingSession).filter(TypingSession.user_id == u.id).count(),
            }
            for u in users
        ],
    }


@router.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(404, "User not found")
    sessions = (
        db.query(TypingSession)
        .filter(TypingSession.user_id == user_id)
        .order_by(TypingSession.completed_at.desc())
        .limit(20)
        .all()
    )
    return {
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "avatar": u.avatar,
        "is_admin": u.is_admin,
        "is_active": u.is_active,
        "created_at": u.created_at.isoformat(),
        "sessions": [
            {
                "surah_name": s.surah_name,
                "ayah_key": s.ayah_key,
                "wpm": s.wpm,
                "accuracy": s.accuracy,
                "completed_at": s.completed_at.isoformat(),
            }
            for s in sessions
        ],
    }


class UserPatch(BaseModel):
    is_admin: bool | None = None
    is_active: bool | None = None


@router.patch("/users/{user_id}")
def patch_user(user_id: int, body: UserPatch, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(404, "User not found")
    if u.id == admin.id:
        raise HTTPException(400, "Cannot modify your own admin status")
    if body.is_admin is not None:
        u.is_admin = body.is_admin
    if body.is_active is not None:
        u.is_active = body.is_active
    db.commit()
    return {"ok": True}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(404, "User not found")
    if u.id == admin.id:
        raise HTTPException(400, "Cannot delete yourself")
    db.delete(u)
    db.commit()
    return {"ok": True}


@router.get("/sessions")
def list_sessions(
    page: int = 1,
    per_page: int = 30,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    offset = (page - 1) * per_page
    total = db.query(TypingSession).count()
    rows = (
        db.query(TypingSession)
        .order_by(TypingSession.completed_at.desc())
        .offset(offset)
        .limit(per_page)
        .all()
    )
    return {
        "total": total,
        "sessions": [
            {
                "id": s.id,
                "user_id": s.user_id,
                "surah_name": s.surah_name,
                "ayah_key": s.ayah_key,
                "wpm": s.wpm,
                "accuracy": s.accuracy,
                "completed_at": s.completed_at.isoformat(),
            }
            for s in rows
        ],
    }
