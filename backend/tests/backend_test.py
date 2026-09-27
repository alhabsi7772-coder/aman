"""Backend API tests for Al MAAN Exchange feasibility study."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://exchange-kiosk-study.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def test_root(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    assert "message" in r.json()


def test_stats_initial(client):
    r = client.get(f"{API}/analytics/stats")
    assert r.status_code == 200
    d = r.json()
    for k in ("total_downloads", "pdf_downloads", "word_downloads"):
        assert k in d
        assert isinstance(d[k], int)


def test_log_pdf_download(client):
    before = client.get(f"{API}/analytics/stats").json()
    r = client.post(f"{API}/analytics/download", json={"format": "pdf", "page_count": 149})
    assert r.status_code == 200
    d = r.json()
    assert d["format"] == "pdf"
    assert d["page_count"] == 149
    assert "id" in d and "timestamp" in d
    after = client.get(f"{API}/analytics/stats").json()
    assert after["pdf_downloads"] == before["pdf_downloads"] + 1
    assert after["total_downloads"] == before["total_downloads"] + 1


def test_log_word_download(client):
    before = client.get(f"{API}/analytics/stats").json()
    r = client.post(f"{API}/analytics/download", json={"format": "word", "page_count": 149})
    assert r.status_code == 200
    assert r.json()["format"] == "word"
    after = client.get(f"{API}/analytics/stats").json()
    assert after["word_downloads"] == before["word_downloads"] + 1


def test_log_invalid_format_normalized(client):
    r = client.post(f"{API}/analytics/download", json={"format": "xls"})
    assert r.status_code == 200
    # server normalizes unknown to pdf
    assert r.json()["format"] == "pdf"


def test_stats_last_timestamp(client):
    r = client.get(f"{API}/analytics/stats")
    assert r.status_code == 200
    assert r.json().get("last_download_at") is not None
