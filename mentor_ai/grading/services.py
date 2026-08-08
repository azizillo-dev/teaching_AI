import json
import time

from django.conf import settings
from google import genai
from google.genai import types

from mentor_ai.assignments.models import Submission
from mentor_ai.grading.models import CheckResult
from mentor_ai.grading.prompt_builder import build_grading_prompt


class GeminiGradingService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if not self.api_key:
            raise ValueError(
                "GEMINI_API_KEY is not configured. "
                "Set GEMINI_API_KEY in your .env file."
            )
        self.model_name = settings.GEMINI_MODEL_NAME
        self.client = genai.Client(api_key=self.api_key)

    def grade_submission(self, submission: Submission) -> CheckResult:
        """
        Grades the submission using Gemini AI with structured JSON output.
        """
        images = list(submission.images.all())
        if not images:
            raise ValueError("No images found for this submission.")

        assignment = submission.assignment
        prompt_text = build_grading_prompt(assignment)

        # Build contents (Prompt text + Teacher Assignment Image + Student Images)
        contents = [prompt_text]
        
        # If the assignment itself has an image, add it as context
        if assignment.image:
            with assignment.image.open("rb") as f:
                assignment_image_bytes = f.read()
                ext = assignment.image.name.split(".")[-1].lower()
                mime_type = "image/jpeg" if ext in ["jpg", "jpeg"] else "image/png"
                contents.append(
                    types.Part.from_bytes(
                        data=assignment_image_bytes,
                        mime_type=mime_type,
                    )
                )

        for img_obj in images:
            # Reopen the file to ensure we can read its bytes
            with img_obj.image.open("rb") as f:
                image_bytes = f.read()
                # Guess mimetype based on extension
                ext = img_obj.image.name.split(".")[-1].lower()
                mime_type = "image/jpeg" if ext in ["jpg", "jpeg"] else "image/png"

                contents.append(
                    types.Part.from_bytes(
                        data=image_bytes,
                        mime_type=mime_type,
                    )
                )

        schema = {
            "type": "OBJECT",
            "properties": {
                "score": {"type": "INTEGER"},
                "mistakes": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "question": {"type": "STRING"},
                            "student_answer": {"type": "STRING"},
                            "correct_answer": {"type": "STRING"},
                            "ai_explanation": {"type": "STRING"},
                            "suggestion": {"type": "STRING"},
                        },
                    },
                },
                "feedback": {"type": "STRING"},
            },
            "required": ["score", "mistakes", "feedback"],
        }

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=schema,
            temperature=0.0,
        )

        start_time = time.time()

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=contents,
            config=config,
        )

        processing_time_ms = int((time.time() - start_time) * 1000)

        # The response text is guaranteed to be JSON matching the schema
        raw_text = response.text
        try:
            parsed_json = json.loads(raw_text)
        except json.JSONDecodeError:
            # Fallback in case of unexpected output
            parsed_json = {
                "score": 0,
                "mistakes": [],
                "feedback": "Failed to parse AI response.",
                "error": raw_text,
            }

        # Create or Update CheckResult
        check_result, _ = CheckResult.objects.update_or_create(
            submission=submission,
            defaults={
                "score": parsed_json.get("score", 0),
                "mistakes": parsed_json.get("mistakes", []),
                "feedback": parsed_json.get("feedback", ""),
                "ai_model": self.model_name,
                "processing_time_ms": processing_time_ms,
                "raw_response": parsed_json,
            },
        )

        # Update Submission Status
        submission.status = Submission.Status.CHECKED
        submission.save(update_fields=["status"])

        return check_result
