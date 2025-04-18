FROM python:3.9-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app
COPY ./requirements.txt /app/
RUN pip install --no-cache-dir -r /app/requirements.txt
COPY ./blogify /app/blogify  
COPY .env /app/.env  
EXPOSE 8000
CMD ["python3", "blogify/manage.py", "runserver", "0.0.0.0:8000"] 

# backend/blogify/manage.py