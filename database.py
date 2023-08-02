import psycopg2
from fastapi import HTTPException

DB_HOST = 'localhost'
DB_USER = 'postgres'
DB_PASSWORD = '123'
DB_NAME = 'voting'

def get_connection():
    try:
        connection = psycopg2.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )

        return connection
    except psycopg2.Error as ex:
        raise HTTPException(status_code=500, detail=f"Error connecting to the database: {ex}")