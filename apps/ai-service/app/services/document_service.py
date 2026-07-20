"""Document text extraction service."""

from __future__ import annotations

import base64
import io
import logging
import re
from typing import Any

from app.schemas.insights import DocumentParseRequest, DocumentParseResponse

logger = logging.getLogger(__name__)


def _extract_pdf(data: bytes) -> str:
    try:
        from pypdf import PdfReader  # type: ignore[import-untyped]

        reader = PdfReader(io.BytesIO(data))
        parts: list[str] = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                parts.append(text)
        return "\n".join(parts).strip()
    except Exception as exc:
        logger.warning("PDF extraction failed: %s", exc)
        return ""


def _extract_docx(data: bytes) -> str:
    try:
        from docx import Document  # type: ignore[import-untyped]

        doc = Document(io.BytesIO(data))
        return "\n".join(p.text for p in doc.paragraphs if p.text).strip()
    except Exception as exc:
        logger.warning("DOCX extraction failed: %s", exc)
        return ""


def _extract_plain(data: bytes) -> str:
    for encoding in ("utf-8", "utf-16", "cp1256", "latin-1"):
        try:
            return data.decode(encoding).strip()
        except UnicodeDecodeError:
            continue
    return ""


class DocumentService:
    async def parse(self, request: DocumentParseRequest) -> DocumentParseResponse:
        result = await self._parse_content(
            file_name=request.file_name,
            mime_type=request.mime_type,
            content_base64=request.content_base64,
        )
        return DocumentParseResponse(**result)

    async def _parse_content(
        self,
        *,
        file_name: str,
        mime_type: str,
        content_base64: str | None,
    ) -> dict[str, Any]:
      if not content_base64:
          return {
              "extracted_text": "",
              "fields": {},
              "document_type": None,
              "status": "error",
              "message": "محتوای فایل ارسال نشده است",
          }

      try:
          raw = base64.b64decode(content_base64)
      except Exception:
          return {
              "extracted_text": "",
              "fields": {},
              "document_type": None,
              "status": "error",
              "message": "فرمت base64 نامعتبر است",
          }

      mime = (mime_type or "").lower()
      name = file_name.lower()

      if "pdf" in mime or name.endswith(".pdf"):
          text = _extract_pdf(raw)
          doc_type = "pdf"
      elif "word" in mime or name.endswith(".docx"):
          text = _extract_docx(raw)
          doc_type = "docx"
      else:
          text = _extract_plain(raw)
          doc_type = "text"

      text = re.sub(r"\s+", " ", text).strip()
      fields: dict[str, Any] = {}
      if text:
          fields["char_count"] = len(text)
          fields["word_count"] = len(text.split())

      return {
          "extracted_text": text,
          "fields": fields,
          "document_type": doc_type,
          "status": "ready" if text else "error",
          "message": None if text else "متنی از فایل استخراج نشد",
      }
