import random
import string
import secrets

from django.db import transaction
from django.core.exceptions import ValidationError

from mentor_ai.classrooms.models import Group, StudentProfile
from mentor_ai.users.models import User


def _generate_student_email(first_name: str, last_name: str) -> str:
    """Talaba uchun noyob email generatsiya qilish."""
    base_first = first_name.lower().strip().replace(" ", "")
    base_last = last_name.lower().strip().replace(" ", "")
    random_suffix = "".join(random.choices(string.digits, k=4))
    email = f"{base_first}.{base_last}.{random_suffix}@mentor.local"

    while User.objects.filter(email=email).exists():
        random_suffix = "".join(random.choices(string.digits, k=4))
        email = f"{base_first}.{base_last}.{random_suffix}@mentor.local"

    return email


def _generate_password(length: int = 10) -> str:
    """Xavfsiz tasodifiy parol generatsiya qilish."""
    alphabet = string.ascii_letters + string.digits + "!@#$%&*"
    return "".join(secrets.choice(alphabet) for _ in range(length))


# ──────────────────────────────────────────────
# Group Services
# ──────────────────────────────────────────────


def group_create(*, owner: User, name: str, description: str = "") -> Group:
    if owner.role == User.Role.TEACHER:
        # Hozircha hamma tekin tarifda bo'lgani uchun, 3 ta guruhdan ko'p ochish mumkin emas
        if owner.owned_groups.count() >= 3:
            raise ValidationError("Free tarifida eng ko'pi bilan 3 ta guruh yaratish mumkin. Iltimos, limitni oshirish uchun obunani xarid qiling.")
            
    group = Group(owner=owner, name=name, description=description)
    group.full_clean()
    group.save()
    return group


def group_update(*, group: Group, name: str | None = None, description: str | None = None) -> Group:
    if name is not None:
        group.name = name
    if description is not None:
        group.description = description

    group.full_clean()
    group.save()
    return group


def group_delete(*, group: Group) -> None:
    group.delete()


# ──────────────────────────────────────────────
# Student Services
# ──────────────────────────────────────────────


@transaction.atomic
def student_create(
    *, teacher: User, first_name: str, last_name: str, group_id: str | None = None
) -> dict:
    email = _generate_student_email(first_name, last_name)
    raw_password = _generate_password()

    user = User.objects.create_user(
        email=email,
        password=raw_password,
        first_name=first_name,
        last_name=last_name,
        role=User.Role.STUDENT,
    )

    student_profile = StudentProfile.objects.create(
        user=user,
        created_by=teacher,
    )

    if group_id:
        from mentor_ai.classrooms.models import Group, GroupMembership
        group = Group.objects.filter(id=group_id, owner=teacher).first()
        if group:
            GroupMembership.objects.create(
                group=group,
                student_profile=student_profile,
            )

    return {
        "user": user,
        "email": email,
        "password": raw_password,
    }


def student_update(
    *,
    student_profile: StudentProfile,
    first_name: str | None = None,
    last_name: str | None = None,
    is_active: bool | None = None,
) -> StudentProfile:
    user = student_profile.user

    if first_name is not None:
        user.first_name = first_name
    if last_name is not None:
        user.last_name = last_name
    if is_active is not None:
        student_profile.is_active = is_active
        user.is_active = is_active

    user.full_clean()
    user.save()

    student_profile.full_clean()
    student_profile.save()

    return student_profile


def student_delete(*, student_profile: StudentProfile) -> None:
    user = student_profile.user
    user.delete()
