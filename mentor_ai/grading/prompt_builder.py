from mentor_ai.assignments.models import Assignment


def build_grading_prompt(assignment: Assignment) -> str:
    """
    Creates a prompt for Gemini AI.
    It passes the assignment details and explains the expected output schema.
    """
    return f"""You are a professional teacher grading a student's homework.

Task:
Title: {assignment.title}
Description: {assignment.description}

You will be provided with one or more images of the student's submission.
Analyze the images carefully and grade the submission from 0 to 100 based on how well it meets the task description.

List any mistakes found in the "mistakes" array. Each mistake should have:
- "question": The question number or specific part where the mistake happened. (e.g. 1, "task 2", etc.)
- "reason": A brief explanation of what was wrong.

Provide an overall constructive feedback in the "feedback" field.

Output strictly valid JSON matching the schema structure.
"""
