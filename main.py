import psycopg2
from ultralytics import YOLO
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.responses import JSONResponse
import shutil
import uvicorn
from database import get_connection
from models import Theme, Vote

#Загрузка модели для распознавания карточек
model = YOLO('card_detect.pt')

app = FastAPI()


def vote_row_to_json(row):
    return {'id': row[0], 'name': row[1], 'description': row[2], 'agree_votes': row[3],
     'disagree_votes': row[4], 'abstained_votes': row[5],
     'status': row[6].lower(), 'decision': row[7]}

#Получить результат распознавания карточек с картинки
@app.post("/api/get_vote_results")
async def get_vote_results(file: UploadFile = File(...)):

    if file.content_type not in ['image/jpeg', 'image/png']:
        raise HTTPException(400, detail="Неверный тип файла")

    with open('image.jpg', 'wb') as f:
        shutil.copyfileobj(file.file, f)

    print('Файл скопирован в image.jpg')

    votes = {'agreeable': 0, 'disagree': 0, 'abstained': 0}

    results = model.predict('image.jpg', conf=0.5)

    #0 red - красная карточка (несогласен)
    #1 yellow - желтая карточка (воздержался)
    #2 green - зеленая карточка (согласен)

    for r in results:
        for c in r.boxes.cls:
            if int(c) == 0:
                votes['disagree'] += 1
            if int(c) == 1:
                votes['abstained'] += 1
            if int(c) == 2:
                votes['agreeable'] += 1

    return JSONResponse(votes)

#Получить все темы
@app.get('/api/get_themes')
async def get_all_themes():
    try:
        connection = get_connection()

        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM themes") #Получаем все темы
            themes_list = []
            themes = cursor.fetchall()

            for theme in themes:
                theme_dict = {'id': theme[0], 'name': theme[1]}
                theme_votes = []
                cursor.execute(f"SELECT votes.id, votes.name, votes.description, votes.agree_votes, "
                               f"votes.disagree_votes, votes.abstained_votes, status.name, votes.decision "
                               f"FROM votes JOIN status ON votes.status = status.id "
                               f"WHERE votes.theme = {theme_dict['id']}") #Для каждой темы получаем голосования
                votes = cursor.fetchall()

                for vote in votes:
                    theme_votes.append(vote_row_to_json(vote))

                theme_dict['votes'] = theme_votes
                themes_list.append(theme_dict)

            return JSONResponse(themes_list)
    finally:
        connection.close()

#Создать тему
@app.post('/api/create_theme')
async def create_theme(theme: Theme):
    try:
        connection = get_connection() #Подключение к БД

        theme_response = {"name": theme.name} #Подготовка ответа с созданной темой
        with connection.cursor() as cursor:  # Создание курсора
            cursor.execute(f"INSERT INTO themes (name) VALUES ('{theme.name}')")
            cursor.execute(" SELECT currval('themes_id_seq')")
            theme_response['id'] = cursor.fetchone()[0]
            connection.commit()

        return JSONResponse(theme_response)


    except psycopg2.Error as ex:
        raise HTTPException(status_code=500, detail=f"Ошибка {ex}")
    finally:
        connection.close()


#Создать голосование в теме (нужно передать только name и theme)
@app.post('/api/create_vote')
async def create_vote(vote: Vote):
    try:
        connection = get_connection() #Подключение к БД

        vote_response = {} #Подготовка ответа с созданным голосованием
        with connection.cursor() as cursor: #Создание курсора
            cursor.execute("INSERT INTO votes (name, description, agree_votes, "
                           "disagree_votes, abstained_votes, status, theme)"
                           f"VALUES('{vote.name}', '{vote.description}', 0, 0,"
                           f"0, 1, {vote.theme})")

            cursor.execute("SELECT votes.id, votes.name, votes.description, votes.agree_votes, "
                            "votes.disagree_votes, votes.abstained_votes, status.name, votes.decision, votes.theme "
                            "FROM votes JOIN status ON votes.status = status.id "
                            "WHERE votes.id = currval('votes_id_seq')")
            inserted_vote = cursor.fetchone()

            vote_response = vote_row_to_json(inserted_vote)
            vote_response['theme'] = inserted_vote[8]

            connection.commit()

        return JSONResponse(vote_response)

    except psycopg2.Error as ex:
        raise HTTPException(status_code=500, detail=f"Ошибка {ex}")
    finally:
        connection.close()


#Начать голосование (при нажатии на кнопку)
@app.put('/api/start_vote')
async def start_vote(vote: dict = Body(...)):
    try:
        connection = get_connection()  # Подключение к БД

        if 'id' not in vote.keys():
            raise HTTPException(status_code=400, detail=f"Не указан id")

        vote_response = {} #Подготовка ответа с созданным голосованием
        with connection.cursor() as cursor:  # Создание курсора
            cursor.execute(f"SELECT status FROM votes WHERE id = {vote['id']}")

            if cursor.fetchone()[0] not in [1, 4]:
                raise HTTPException(status_code=400, detail=f"Голосование уже начато или закончено")

            cursor.execute(f"UPDATE votes SET status = 2 WHERE id = {vote['id']}")
            cursor.execute("SELECT votes.id, votes.name, votes.description, votes.agree_votes, "
                            "votes.disagree_votes, votes.abstained_votes, status.name, votes.decision, votes.theme "
                            "FROM votes JOIN status ON votes.status = status.id "
                            f"WHERE votes.id = {vote['id']}")

            inserted_vote = cursor.fetchone()

            vote_response = vote_row_to_json(inserted_vote)
            vote_response['theme'] = inserted_vote[8]

            connection.commit()

        return JSONResponse(vote_response)

    except psycopg2.Error as ex:
        raise HTTPException(status_code=500, detail=f"Ошибка {ex}")
    finally:
        connection.close()


#Закончить голосование (при нажатии на кнопку)
@app.put('/api/end_vote')
async def start_vote(vote: dict = Body(...)):
    try:
        connection = get_connection()  # Подключение к БД

        valid_keys = ['id', 'agreeable', 'disagree', 'abstained']
        for key in valid_keys:
            if key not in vote.keys():
                raise HTTPException(status_code=400, detail=f"Не указан {key}")

        amount_of_votes = vote['agreeable'] + vote['disagree'] + vote['abstained']
        agree_percent = vote['agreeable'] / amount_of_votes #Процент голосов за
        disagree_percent = vote['disagree'] / amount_of_votes #Процент голосов против

        vote_response = {}
        with connection.cursor() as cursor:
            if agree_percent > 0.5:
                cursor.execute(f"UPDATE votes SET decision = 'За', status = 3 WHERE id = {vote['id']}")
            elif disagree_percent > 0.5:
                cursor.execute(f"UPDATE votes SET decision = 'Против', status = 3 WHERE id = {vote['id']}")
            else:
                cursor.execute(f"UPDATE votes SET decision = null, status = 4 WHERE id = {vote['id']}")

            cursor.execute(f"UPDATE votes SET agree_votes = {vote['agreeable']}, disagree_votes = {vote['disagree']}, "
                           f"abstained_votes = {vote['abstained']} WHERE id = {vote['id']}")

            cursor.execute("SELECT votes.id, votes.name, votes.description, votes.agree_votes, "
                            "votes.disagree_votes, votes.abstained_votes, status.name, votes.decision, votes.theme "
                            "FROM votes JOIN status ON votes.status = status.id "
                            f"WHERE votes.id = {vote['id']}")
            inserted_vote = cursor.fetchone()

            vote_response = vote_row_to_json(inserted_vote)
            vote_response['theme'] = inserted_vote[8]

            connection.commit()

        return JSONResponse(vote_response)

    except psycopg2.Error as ex:
        raise HTTPException(status_code=500, detail=f"Ошибка {ex}")
    finally:
        connection.close()


if __name__ == "__main__":
    uvicorn.run("main:app", host="25.57.86.102", port=5000)