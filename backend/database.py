import sys
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
    except psycopg2.Error:
        raise HTTPException(status_code=500, detail=f"Error connecting to the database")


def create_tables():
    try:
        connection = get_connection()

        with connection.cursor() as cursor:
            #Создание таблицы статус и вставка 4 статусов в неё
            cursor.execute("CREATE TABLE IF NOT EXISTS public.status "
                           "(id smallint NOT NULL, "
                           'name character varying(50) COLLATE pg_catalog."default" NOT NULL, '
                           "CONSTRAINT status_pkey PRIMARY KEY (id)) "
                           "TABLESPACE pg_default;")
            cursor.execute("INSERT INTO status (id, name) VALUES (1, 'Не начато')")
            cursor.execute("INSERT INTO status (id, name) VALUES (2, 'В процессе')")
            cursor.execute("INSERT INTO status (id, name) VALUES (3, 'Закончено')")
            cursor.execute("INSERT INTO status (id, name) VALUES (4, 'Требует переголосования')")

            #Создание таблицы Темы
            cursor.execute("CREATE TABLE IF NOT EXISTS public.themes "
                           '(id character varying(32) COLLATE pg_catalog."default" NOT NULL, '
                           'name character varying(250) COLLATE pg_catalog."default" NOT NULL, '
                           "date_created timestamp without time zone NOT NULL, "
                           "CONSTRAINT themes_pkey PRIMARY KEY (id)) "
                           "TABLESPACE pg_default;")

            #Создание таблицы Голосования
            cursor.execute("CREATE TABLE IF NOT EXISTS public.votes "
                           '(id character varying(32) COLLATE pg_catalog."default" NOT NULL, '
                           'name character varying(250) COLLATE pg_catalog."default" NOT NULL, '
                           'description character varying(1000) COLLATE pg_catalog."default", '
                           "agree_votes smallint NOT NULL, "
                           "disagree_votes smallint NOT NULL, "
                           "abstained_votes smallint NOT NULL, "
                           "status smallint NOT NULL, "
                           'theme character varying(32) COLLATE pg_catalog."default" NOT NULL, '
                           'decision character varying(10) COLLATE pg_catalog."default", '
                           "date_created timestamp without time zone NOT NULL, "
                           "CONSTRAINT votes_pkey PRIMARY KEY (id), "
                           "CONSTRAINT vote_status FOREIGN KEY (status) "
                           "REFERENCES public.status (id) MATCH SIMPLE "
                           "ON UPDATE NO ACTION "
                           "ON DELETE NO ACTION "
                           "NOT VALID, "
                           "CONSTRAINT vote_theme FOREIGN KEY (theme) "
                           "REFERENCES public.themes (id) MATCH SIMPLE "
                           "ON UPDATE NO ACTION "
                           "ON DELETE NO ACTION "
                           "NOT VALID) "
                           "TABLESPACE pg_default;")

            connection.commit()

    except psycopg2.Error as ex:
        print('Не удалось создать таблицы', ex)
        sys.exit(1)
    finally:
        if connection:
            connection.close()


def create_db():
    try:
        connection = psycopg2.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database="postgres"
        )

        connection.autocommit = True

        with connection.cursor() as cursor:
            cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{DB_NAME}'")
            exists = cursor.fetchone()
            if not exists:
                #Создание базы данных
                cursor.execute(f"CREATE DATABASE {DB_NAME} "
                               "WITH "
                               f"OWNER = {DB_USER} "
                               "ENCODING = 'UTF8' "
                               "LC_COLLATE = 'Russian_Russia.1251' "
                               "LC_CTYPE = 'Russian_Russia.1251' "
                               "TABLESPACE = pg_default "
                               "CONNECTION LIMIT = -1 "
                               "IS_TEMPLATE = False;")

                connection.close()

                create_tables() #Создание таблиц
                print(f"База данных {DB_NAME} успешно создана")
            else:
                print(f"База данных {DB_NAME} уже существует")

    except psycopg2.Error as ex:
        print('Не удалось создать БД', ex)
        sys.exit(1)
    finally:
        if connection:
            connection.close()