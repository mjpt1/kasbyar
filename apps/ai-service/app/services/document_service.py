"""Document parsing foundation — contract placeholder for future OCR/LLM."""

from app.schemas.insights import DocumentParseRequest, DocumentParseResponse


class DocumentService:
    async def parse(self, request: DocumentParseRequest) -> DocumentParseResponse:
        return DocumentParseResponse(
            extracted_text="",
            fields={},
            document_type=None,
            status="placeholder",
            message=(
                f"تحلیل خودکار «{request.file_name}» در نسخه‌های بعدی فعال می‌شود. "
                "فعلاً فایل به‌صورت متادیتا ذخیره می‌شود."
            ),
        )
