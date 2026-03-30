import datetime
from dataclasses import dataclass, field


@dataclass
class Ledger:
    id: int | None = None
    student_id: int | None = None
    debit: float | None = None
    credit: float | None = None
    balance: float | None = None
    description: str | None = None
    transaction_date: datetime.datetime = field(
        default_factory=datetime.datetime.utcnow
    )
