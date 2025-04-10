# backend/run_celery.sh
export DJANGO_SETTINGS_MODULE=blogify.settings

export PYTHONPATH=$PYTHONPATH:$(pwd):$(pwd)/blogify

if [ "$1" == "beat" ]; then
    echo "Starting Celery Beat..."
    celery -A celeryconfig:app beat --loglevel=info
else
    echo "Starting Celery Worker..."
    celery -A celeryconfig:app worker --loglevel=info
fi