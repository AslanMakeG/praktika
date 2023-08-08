from pydantic import BaseModel


class Theme(BaseModel):
    name: str


class Vote(BaseModel):
    name: str
    description: str = ""
    theme: str