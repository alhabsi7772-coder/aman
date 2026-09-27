"""Comprehensive backend API tests for Aman Modern Exchange feasibility study."""
import requests
import os

# Use the external backend URL from frontend/.env
BASE_URL = "https://bef7563e-1917-4dc2-946a-9a5f3b699290.preview.emergentagent.com"
API = f"{BASE_URL}/api"

def test_root_endpoint():
    """Test GET /api/ - should return welcome message"""
    print("\n1. Testing GET /api/")
    response = requests.get(f"{API}/")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert "message" in data, "Response should contain 'message' field"
    assert "Aman Modern Exchange" in data["message"], "Message should mention Aman Modern Exchange"
    print("   ✅ PASSED")
    return True

def test_create_status_check():
    """Test POST /api/status - should create and return a status check record"""
    print("\n2. Testing POST /api/status")
    payload = {"client_name": "test"}
    response = requests.post(f"{API}/status", json=payload)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert "id" in data, "Response should contain 'id' field"
    assert "client_name" in data, "Response should contain 'client_name' field"
    assert data["client_name"] == "test", f"Expected client_name='test', got '{data['client_name']}'"
    assert "timestamp" in data, "Response should contain 'timestamp' field"
    print("   ✅ PASSED")
    return data

def test_get_status_checks():
    """Test GET /api/status - should return list of status checks"""
    print("\n3. Testing GET /api/status")
    response = requests.get(f"{API}/status")
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Response: Found {len(data)} status check(s)")
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert isinstance(data, list), "Response should be a list"
    if len(data) > 0:
        print(f"   Sample record: {data[0]}")
        assert "id" in data[0], "Status check should have 'id' field"
        assert "client_name" in data[0], "Status check should have 'client_name' field"
        assert "timestamp" in data[0], "Status check should have 'timestamp' field"
    print("   ✅ PASSED")
    return data

def test_log_pdf_download():
    """Test POST /api/analytics/download with PDF format"""
    print("\n4. Testing POST /api/analytics/download (PDF)")
    payload = {"format": "pdf", "page_count": 149, "referrer": "test"}
    response = requests.post(f"{API}/analytics/download", json=payload)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert "id" in data, "Response should contain 'id' field"
    assert data["format"] == "pdf", f"Expected format='pdf', got '{data['format']}'"
    assert data["page_count"] == 149, f"Expected page_count=149, got {data['page_count']}"
    assert "timestamp" in data, "Response should contain 'timestamp' field"
    print("   ✅ PASSED")
    return data

def test_log_word_download():
    """Test POST /api/analytics/download with Word format"""
    print("\n5. Testing POST /api/analytics/download (Word)")
    payload = {"format": "word"}
    response = requests.post(f"{API}/analytics/download", json=payload)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert "id" in data, "Response should contain 'id' field"
    assert data["format"] == "word", f"Expected format='word', got '{data['format']}'"
    assert "timestamp" in data, "Response should contain 'timestamp' field"
    print("   ✅ PASSED")
    return data

def test_analytics_stats():
    """Test GET /api/analytics/stats - should return download statistics"""
    print("\n6. Testing GET /api/analytics/stats")
    response = requests.get(f"{API}/analytics/stats")
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Response: {data}")
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert "total_downloads" in data, "Response should contain 'total_downloads'"
    assert "pdf_downloads" in data, "Response should contain 'pdf_downloads'"
    assert "word_downloads" in data, "Response should contain 'word_downloads'"
    assert isinstance(data["total_downloads"], int), "total_downloads should be an integer"
    assert isinstance(data["pdf_downloads"], int), "pdf_downloads should be an integer"
    assert isinstance(data["word_downloads"], int), "word_downloads should be an integer"
    
    # After logging downloads, last_download_at should not be null
    if data["total_downloads"] > 0:
        assert data["last_download_at"] is not None, "last_download_at should not be null when downloads exist"
        print(f"   Last download at: {data['last_download_at']}")
    
    print("   ✅ PASSED")
    return data

def main():
    print("=" * 70)
    print("AMAN MODERN EXCHANGE - BACKEND API TEST SUITE")
    print("=" * 70)
    print(f"Testing backend at: {BASE_URL}")
    
    results = {
        "passed": 0,
        "failed": 0,
        "errors": []
    }
    
    tests = [
        ("Root Endpoint", test_root_endpoint),
        ("Create Status Check", test_create_status_check),
        ("Get Status Checks", test_get_status_checks),
        ("Log PDF Download", test_log_pdf_download),
        ("Log Word Download", test_log_word_download),
        ("Analytics Stats", test_analytics_stats),
    ]
    
    for test_name, test_func in tests:
        try:
            test_func()
            results["passed"] += 1
        except AssertionError as e:
            results["failed"] += 1
            results["errors"].append(f"{test_name}: {str(e)}")
            print(f"   ❌ FAILED: {e}")
        except Exception as e:
            results["failed"] += 1
            results["errors"].append(f"{test_name}: {str(e)}")
            print(f"   ❌ ERROR: {e}")
    
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    print(f"Total Tests: {results['passed'] + results['failed']}")
    print(f"Passed: {results['passed']}")
    print(f"Failed: {results['failed']}")
    
    if results["errors"]:
        print("\nFailed Tests:")
        for error in results["errors"]:
            print(f"  - {error}")
    else:
        print("\n🎉 All tests passed successfully!")
    
    print("=" * 70)
    
    return results["failed"] == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
