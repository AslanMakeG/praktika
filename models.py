from pydantic import BaseModel


class Theme(BaseModel):
    name: str


class Vote(BaseModel):
    name: str
    description: str = ""
    agree_votes: int = 0
    disagree_votes: int = 0
    abstained_votes: int = 0
    status: int = 1
    theme: int


