# backend/run_celery.sh
export DJANGO_SETTINGS_MODULE=blogify.settings

export PYTHONPATH=$PYTHONPATH:$(pwd):$(pwd)/blogify

enable_celery=$(echo "${ENABLE_CELERY:-false}" | tr '[:upper:]' '[:lower:]')
if [ "$enable_celery" != "true" ] && [ "$enable_celery" != "1" ] && [ "$enable_celery" != "yes" ]; then
    echo "ENABLE_CELERY is not true. Skipping Celery startup."
    exit 0
fi

if [ "$1" == "beat" ]; then
    echo "Starting Celery Beat..."
    celery -A celeryconfig:app beat --loglevel=info
else
    echo "Starting Celery Worker..."
    celery -A celeryconfig:app worker --loglevel=info
fi