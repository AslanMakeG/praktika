import React, { createRef } from "react"
import { Link } from "react-router-dom";
import PostService from "../API/PostService";


class CameraMenu extends React.Component {

    constructor(props) {
        super(props)
        this.videoRef = createRef();
        this.timerId = '';

        this.captureScreenshot = this.captureScreenshot.bind(this);
        this.finishVoiting = this.finishVoiting.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.convertDataUrlToFile = this.convertDataUrlToFile.bind(this);
    }

    componentDidMount() {
        navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: true,
            })
            .then((stream) => {
                this.videoRef.current.srcObject = stream;
                this.videoRef.current.onloadedmetdata = () => this.videoRef.current.play();
            });
        this.timerId = setInterval(this.handleSubmit, 500);
    }


    componentWillUnmount() {

        clearInterval(this.timerId);
        this.videoRef.current.srcObject.getTracks()
            .forEach((track) => track.stop());
    }

    finishVoiting(event) {
        clearInterval(this.timerId);
        this.props.editVoitStatus(event);
    }


    captureScreenshot() {

        const videoElement = this.videoRef.current;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        // Рисуем текущий кадр видео на <canvas>
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        // Преобразуем рисунок в формат Data URL
        const dataUrl = canvas.toDataURL();
        return dataUrl;
    };

    convertDataUrlToFile() {

        const dataUrl = this.captureScreenshot();
        // Удаляем заголовок Data URL
        const base64Data = dataUrl.split(',')[1];
        // Определяем тип файла
        const mimeType = dataUrl.split(':')[1].split(';')[0];
        // Конвертируем base64 в массив байтов
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        for (let i = 0; i < byteCharacters.length; i++) {
            byteArrays.push(byteCharacters.charCodeAt(i));
        }
        // Создаем файл Blob из массива байтов
        const fileBlob = new Blob([new Uint8Array(byteArrays)], { type: mimeType });
        return fileBlob

    };

    async handleSubmit() {

        const formData = new FormData();
        let file = this.convertDataUrlToFile();
        formData.append("file", file);
        PostService.getVoteResults(formData)
                    .then(res => { this.props.editVoitings(res) })
                    .catch((error)=> {console.log(error)})

    }




    render() {

        let textButton = 'Закончить голосование'
        return (
            <div className='camera-menu'>
                <video playsInline muted autoPlay ref={this.videoRef}></video>

                <div className='buttons-menu'>
                    <Link to="/"><button>Вернуться к темам</button></Link>
                    <button onClick={this.finishVoiting}>
                        {textButton}
                    </button>
                </div>
            </div>
        )

    }
}

export default CameraMenu