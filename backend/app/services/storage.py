from __future__ import annotations

import os
from abc import ABC, abstractmethod

from fastapi import UploadFile


class StorageProvider(ABC):
    """Provider interface to support S3, GCS, Azure, etc."""

    @abstractmethod
    def upload_logo(self, file: UploadFile, company_slug: str) -> str:
        """Return a public URL for the uploaded logo."""


class S3StorageProvider(StorageProvider):
    def upload_logo(self, file: UploadFile, company_slug: str) -> str:
        # Dummy implementation. Replace with boto3 upload logic.
        return f"https://s3.example.com/company-logos/{company_slug}/{file.filename}"


class GCSStorageProvider(StorageProvider):
    def upload_logo(self, file: UploadFile, company_slug: str) -> str:
        # Dummy implementation. Replace with google-cloud-storage upload logic.
        return f"https://storage.googleapis.com/company-logos/{company_slug}/{file.filename}"


class AzureBlobStorageProvider(StorageProvider):
    def upload_logo(self, file: UploadFile, company_slug: str) -> str:
        # Dummy implementation. Replace with Azure Blob SDK upload logic.
        return f"https://exampleaccount.blob.core.windows.net/company-logos/{company_slug}/{file.filename}"


def _normalize_provider(value: str) -> str:
    return value.strip().lower().replace("-", "_")


def get_storage_provider() -> StorageProvider:
    provider = _normalize_provider(os.getenv("STORAGE_PROVIDER", "s3"))
    if provider == "gcs":
        return GCSStorageProvider()
    if provider in {"azure", "azure_blob", "azure_blob_storage"}:
        return AzureBlobStorageProvider()
    return S3StorageProvider()
