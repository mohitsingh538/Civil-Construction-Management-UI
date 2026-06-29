import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# ensure app module is importable
# Ensure Python can import `app` package inside `backend/`.
ROOT = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, os.path.join(ROOT, "backend"))

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import application's metadata
from app.db.session import Base

# Import all models so that metadata is populated for autogenerate
import pkgutil
import importlib
import app.models as models_pkg

for finder, name, ispkg in pkgutil.iter_modules(models_pkg.__path__):
    importlib.import_module(f"app.models.{name}")

target_metadata = Base.metadata


def get_url():
    # prefer DATABASE_URL env var
    return os.getenv("DATABASE_URL") or os.getenv("SQLALCHEMY_DATABASE_URL")


def run_migrations_offline():
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = get_url()

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
