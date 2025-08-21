FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt psycopg2-binary gunicorn

COPY . .

CMD ["gunicorn", "erp.wsgi:application", "--bind", "0.0.0.0:8000"]
