import React from "react";
import { Link } from "react-router-dom";

class InfoAboutVoit extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {

        let textButton = '';
        switch (this.props.data.status) {
            case 'не начато': textButton = 'Начать голосование';
                break;
            case 'в процессе': textButton = 'Продолжить голосование'
                break;
            case 'закончено': textButton = 'Голосование закончено'
                break;
            case 'требуется переголосование': textButton = 'Переголосовать'
                break;
        }

        const route = `/cameraRecognition/${this.props.data.id}`;

        return (
            <div className='description'>

                <h3>{this.props.theme}</h3>
                <h4>{this.props.data.name}</h4>
                <div className='card3D'>
                    <span>
                        Статус: {this.props.data.status}
                    </span>
                    <span>
                        За: {this.props.data.agree_votes}
                    </span>
                    <span>
                        Против: {this.props.data.disagree_votes}
                    </span>
                    <span>
                        Воздержались: {this.props.data.abstained_votes}
                    </span>
                    <span>
                        Результат: {this.props.data.decision}
                    </span>
                </div>
                {
                    (textButton === 'Голосование закончено')
                        ? <button className="disable">{textButton}</button>
                        : <Link to={route}><button>{textButton}</button></Link>
                }

            </div>
        )
    }
}
export default InfoAboutVoit