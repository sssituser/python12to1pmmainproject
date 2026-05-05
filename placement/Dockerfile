
FROM python:3.13.5
WORKDIR /app

COPY requirements.txt .
RUN apt-get update && apt-get install -y netcat-openbsd && pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && python create_admin_user.py && python manage.py runserver 0.0.0.0:8000"]