"""Models package for database models.

This file makes `app.models` a package so Alembic can import and autogenerate
from contained modules.
"""

# Import individual model modules to ensure they are discoverable when
# iterating the package from Alembic's env.py.
from . import company  # noqa: F401
