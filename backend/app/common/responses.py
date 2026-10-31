from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, Field

DataT = TypeVar("DataT")


class ResponseMeta(BaseModel):
    page: Optional[int] = None
    limit: Optional[int] = None
    total: Optional[int] = None
    pages: Optional[int] = None


class ApiResponse(BaseModel, Generic[DataT]):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[DataT] = None
    error: Optional[Any] = None
    meta: Optional[ResponseMeta] = None


def success_response(
    data: Any = None,
    message: str = "Operation completed successfully",
    meta: Optional[dict] = None,
) -> dict:
    res = {
        "success": True,
        "message": message,
        "data": data,
    }
    if meta:
        res["meta"] = meta
    return res


def error_response(
    message: str = "An error occurred",
    error_code: str = "BAD_REQUEST",
    details: Any = None,
) -> dict:
    return {
        "success": False,
        "message": message,
        "error": {
            "code": error_code,
            "details": details or [],
        },
    }
