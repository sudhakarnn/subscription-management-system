import pytest
from fastapi.testclient import TestClient
from app.modules.auth.models import UserRole


class TestCustomerRegistration:
    def test_customer_registration_success(self, client: TestClient):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "customer1@example.com",
                "password": "SecurePassword2026!",
                "full_name": "Alice Customer",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "customer1@example.com"
        assert data["full_name"] == "Alice Customer"
        assert data["role"] == "CUSTOMER"
        assert data["is_active"] is True
        assert "password" not in data
        assert "hashed_password" not in data

    def test_registration_ignores_injected_role(self, client: TestClient):
        # Attempt to inject role=ADMIN in registration request body
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "sneaky@example.com",
                "password": "SecurePassword2026!",
                "full_name": "Sneaky User",
                "role": "ADMIN",
            },
        )
        assert response.status_code == 201
        data = response.json()
        # Must strictly be assigned CUSTOMER role
        assert data["role"] == "CUSTOMER"

    def test_registration_duplicate_email_fails(self, client: TestClient, create_test_user):
        create_test_user(email="duplicate@example.com")
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "duplicate@example.com",
                "password": "SecurePassword2026!",
                "full_name": "Second Person",
            },
        )
        assert response.status_code == 409
        assert "already exists" in response.json()["detail"]


class TestPasswordValidation:
    @pytest.mark.parametrize(
        "invalid_password,reason",
        [
            ("Ab1!", "Must be > 8 characters (8 chars or fewer)"),
            ("Abcdef1!", "8 characters exactly"),
            ("alllowercase123!", "Missing uppercase letter"),
            ("ALLUPPERCASE123!", "Missing lowercase letter"),
            ("NoSpecialChar123", "Missing special character"),
            ("NoDigitsHere!@#", "Missing numeric digit"),
        ],
    )
    def test_password_policy_rejections(self, client: TestClient, invalid_password, reason):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "pwdtest@example.com",
                "password": invalid_password,
                "full_name": "Password Tester",
            },
        )
        assert response.status_code == 422, f"Failed on reason: {reason}"

    def test_valid_passwords_accepted(self, client: TestClient):
        valid_passwords = [
            "ValidPass123!",
            "Super_Long_Password_999#",
            "Brightloop$2026",
        ]
        for i, pwd in enumerate(valid_passwords):
            res = client.post(
                "/api/v1/auth/register",
                json={
                    "email": f"valid{i}@example.com",
                    "password": pwd,
                    "full_name": f"Valid User {i}",
                },
            )
            assert res.status_code == 201


class TestAuthenticationAndLogin:
    def test_login_success(self, client: TestClient, create_test_user):
        user = create_test_user(email="login_user@example.com", password="SecretPassword2026!")
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "login_user@example.com",
                "password": "SecretPassword2026!",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "login_user@example.com"
        assert data["user"]["role"] == "CUSTOMER"

    def test_login_wrong_password_fails(self, client: TestClient, create_test_user):
        create_test_user(email="login_user@example.com", password="SecretPassword2026!")
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "login_user@example.com",
                "password": "WrongPassword2026!",
            },
        )
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]

    def test_login_nonexistent_email_fails(self, client: TestClient):
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "SecretPassword2026!",
            },
        )
        assert response.status_code == 401

    def test_login_deactivated_account_fails(self, client: TestClient, create_test_user):
        create_test_user(
            email="inactive@example.com",
            password="SecretPassword2026!",
            is_active=False,
        )
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "inactive@example.com",
                "password": "SecretPassword2026!",
            },
        )
        assert response.status_code == 403
        assert "deactivated" in response.json()["detail"]

    def test_get_current_user_profile(self, client: TestClient, create_test_user, auth_headers):
        user = create_test_user(email="profile@example.com", role=UserRole.CUSTOMER)
        headers = auth_headers(user)

        response = client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "profile@example.com"
        assert data["role"] == "CUSTOMER"

    def test_get_current_user_unauthenticated_fails(self, client: TestClient):
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401


class TestRoleBasedAccessControl:
    def test_admin_can_create_staff_account(self, client: TestClient, create_test_user, auth_headers):
        admin = create_test_user(email="admin_user@example.com", role=UserRole.ADMIN)
        headers = auth_headers(admin)

        response = client.post(
            "/api/v1/auth/staff",
            headers=headers,
            json={
                "email": "staff1@example.com",
                "password": "StaffPassword2026!",
                "full_name": "Staff Member One",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "staff1@example.com"
        assert data["role"] == "STAFF"
        assert data["is_active"] is True

    def test_staff_cannot_create_staff_account(self, client: TestClient, create_test_user, auth_headers):
        staff = create_test_user(email="staff_user@example.com", role=UserRole.STAFF)
        headers = auth_headers(staff)

        response = client.post(
            "/api/v1/auth/staff",
            headers=headers,
            json={
                "email": "another_staff@example.com",
                "password": "StaffPassword2026!",
                "full_name": "Another Staff",
            },
        )
        assert response.status_code == 403
        assert "insufficient privileges" in response.json()["detail"]

    def test_customer_cannot_create_staff_account(self, client: TestClient, create_test_user, auth_headers):
        customer = create_test_user(email="customer_user@example.com", role=UserRole.CUSTOMER)
        headers = auth_headers(customer)

        response = client.post(
            "/api/v1/auth/staff",
            headers=headers,
            json={
                "email": "staff_attempt@example.com",
                "password": "StaffPassword2026!",
                "full_name": "Staff Attempt",
            },
        )
        assert response.status_code == 403
        assert "insufficient privileges" in response.json()["detail"]

    def test_unauthenticated_cannot_create_staff_account(self, client: TestClient):
        response = client.post(
            "/api/v1/auth/staff",
            json={
                "email": "staff_anon@example.com",
                "password": "StaffPassword2026!",
                "full_name": "Anonymous",
            },
        )
        assert response.status_code == 401
