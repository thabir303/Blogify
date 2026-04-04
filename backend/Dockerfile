FROM python:3.9-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app
COPY ./requirements.txt /app/
RUN pip install --no-cache-dir -r /app/requirements.txt
COPY . /app
WORKDIR /app/blogify
EXPOSE 8000
CMD ["gunicorn", "blogify.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]

# backend/blogify/manage.py