# Admin Dashboard Backend

Separate backend service for the Admin Dashboard functionality.

## Structure

```
admin/
├── app/
│   ├── api/              # API routes and schemas
│   │   └── v1/
│   │       └── endpoints/
│   ├── core/             # Core configurations
│   ├── domain/           # Business logic
│   │   ├── entities/     # Domain models
│   │   ├── repositories/ # Repository interfaces
│   │   └── usecases/     # Use cases
│   └── infrastructure/   # Data access and external services
│       ├── database/
│       └── repositories/
├── tests/                # Test suite
├── run.py               # Entry point
└── requirements.txt     # Dependencies
```

## Getting Started

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the server:
   ```bash
   python run.py
   ```

The API will be available at `http://localhost:8001`
