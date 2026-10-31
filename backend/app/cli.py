import sys
import getpass
import argparse
from app.core.database import SessionLocal
from app.core.security import validate_password_strength
from app.modules.auth.services import create_admin_user, get_user_by_email


def prompt_create_admin(email: str = None, full_name: str = None, password: str = None):
    print("=" * 60)
    print(" Brightloop SaaS — Initial Admin Account Setup")
    print("=" * 60)

    if not email:
        email = input("Admin Email: ").strip()
    if not full_name:
        full_name = input("Admin Full Name: ").strip()

    if not email or not full_name:
        print("Error: Email and Full Name are required.")
        sys.exit(1)

    if not password:
        while True:
            pwd1 = getpass.getpass("Admin Password: ")
            pwd2 = getpass.getpass("Confirm Admin Password: ")
            if pwd1 != pwd2:
                print("Error: Passwords do not match. Please try again.\n")
                continue
            try:
                validate_password_strength(pwd1)
                password = pwd1
                break
            except Exception as e:
                print(f"Password Validation Error: {e.detail if hasattr(e, 'detail') else e}\n")
    else:
        validate_password_strength(password)

    db = SessionLocal()
    try:
        user = create_admin_user(
            db=db,
            email=email,
            password=password,
            full_name=full_name,
        )
        print("\n" + "=" * 60)
        print(f" SUCCESS: Admin user '{user.email}' created successfully!")
        print(f" User ID: {user.id}")
        print(f" Role:    {user.role.value}")
        print("=" * 60)
    except Exception as e:
        print(f"\nFailed to create admin account: {e}")
        sys.exit(1)
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Brightloop SaaS Administrative CLI")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    admin_parser = subparsers.add_parser("create-admin", help="Create an initial Admin account")
    admin_parser.add_argument("--email", help="Admin email address", required=False)
    admin_parser.add_argument("--name", help="Admin full name", required=False)
    admin_parser.add_argument("--password", help="Admin password (optional, prompted securely if omitted)", required=False)

    args = parser.parse_args()

    if args.command == "create-admin" or len(sys.argv) == 1:
        prompt_create_admin(
            email=getattr(args, "email", None),
            full_name=getattr(args, "name", None),
            password=getattr(args, "password", None),
        )
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
