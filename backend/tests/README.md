# Tests for GEO-app Backend

This directory contains tests for the backend services.

## Setup

Install testing dependencies:

```bash
pip install pytest pytest-asyncio pytest-mock
```

Or install from requirements.txt:

```bash
pip install -r requirements.txt
```

## Running Tests

### Run all tests
```bash
pytest
```

### Run specific test file
```bash
pytest tests/test_competitor_analyzer.py
```

### Run with verbose output
```bash
pytest -v
```

### Run with coverage (if pytest-cov is installed)
```bash
pytest --cov=app tests/
```

## Test Files

- `test_competitor_analyzer.py` - Tests for the CompetitorAnalyzer service
  - Tests competitor discovery functionality
  - Tests AI provider fallback mechanisms
  - Tests JSON parsing and response handling
  - Tests comparison report generation
  - Tests data models (Pydantic)

## Test Coverage

The test suite for `competitor_analyzer.py` includes:

- **Initialization tests**: Verify the analyzer is set up correctly
- **AI availability tests**: Test behavior when AI services are unavailable
- **Discovery tests**: Test competitor discovery with different AI providers
- **Parsing tests**: Test JSON response parsing with various formats
- **Business context extraction**: Test web scraping functionality
- **Comparison reports**: Test competitive analysis report generation
- **Data models**: Test Pydantic model validation
- **Singleton pattern**: Verify singleton instance works correctly

## Mocking

Tests use mocked AI services to avoid:
- Making real API calls during testing
- Incurring costs from AI provider APIs
- Test flakiness from network issues

The `mock_ai_service` fixture provides a fully mocked AI service with configurable responses.
