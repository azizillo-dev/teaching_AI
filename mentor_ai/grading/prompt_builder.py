from mentor_ai.assignments.models import Assignment


def build_grading_prompt(assignment: Assignment) -> str:
    """
    Creates a prompt for Gemini AI.
    It passes the assignment details and explains the expected output schema.
    """
    return f"""Siz o'quvchining uy vazifasini baholaydigan professional ustozsiz.

Vazifa:
Mavzu: {assignment.title}
Tavsif: {assignment.description}

Sizga o'quvchi tomonidan yuborilgan uy vazifasi rasmlari beriladi.
Rasmlarni diqqat bilan tahlil qiling va vazifa shartlariga qanchalik to'g'ri kelishiga qarab 0 dan 100 gacha bo'lgan oraliqda baholang.

Barcha topilgan xatolarni "mistakes" (xatolar) ro'yxatida ko'rsating. Har bir xato quyidagilarni o'z ichiga olishi kerak:
- "question": Xato qilingan savol raqami yoki qismi.
- "student_answer": O'quvchi nima deb yozgani yoki javob bergani.
- "correct_answer": To'g'ri javob.
- "ai_explanation": Nima xato ekanligi va nima uchun xato ekanligining qisqacha tushuntirishi (Faqat O'zbek tilida).
- "suggestion": Kelajakda bunday xato qilmaslik uchun maslahat (Faqat O'zbek tilida).

Agar biron bir qism noma'lum yoki taaluqli bo'lmasa, bo'sh satr ("") qoldiring.

Umumiy xulosa va fikrlaringizni "feedback" (fikr-mulohaza) qismida yozing (Faqat O'zbek tilida).

MUHIM QOIDA: Barcha matnlar, xulosalar va tushuntirishlar 100% O'zbek tilida yozilishi SHART! Boshqa tillardan foydalanmang.

Faqatgina so'ralgan JSON formatida javob bering.
"""

