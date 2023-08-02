import psycopg2
from fastapi import HTTPException

host = 'localhost'
user = 'postgres'
password = '123'
db_name = 'voting'

def get_connection():
    try:
        connection = psycopg2.connect(
            host=host,
            user=user,
            password=password,
            database=db_name
        )

        return connection
    except psycopg2.Error as ex:
        raise HTTPException(status_code=500, detail="Error connecting to the database.")