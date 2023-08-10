import React from "react";
import greenCard from '../img/greenCard.svg'
import redCard from '../img/redCard.svg'
import yellowCard from '../img/yellowCard.svg'

class VotingForRecognition extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {

        return (

            <div className='history-chat'>

                <div className='recent-voting'>

                    <div className='recent-voting-name' >
                        <span className='recent-voting-name-input'>{this.props.voiting.name}</span>
                    </div>

                    {
                        (this.props.voiting.agree_votes || this.props.voiting.abstained_votes || this.props.voiting.disagree_votes)
                            ? <div className='recent-voting-results'>
                                <img src={greenCard} />
                                <div className='recent-voting-result'>{this.props.voiting.agree_votes}</div>
                                <img src={redCard} />
                                <div className='recent-voting-result'>{this.props.voiting.disagree_votes}</div>
                                <img src={yellowCard} />
                                <div className='recent-voting-result'>{this.props.voiting.abstained_votes}</div>
                            </div>
                            : <div className='recent-voting-results'>
                                {
                                    (this.props.voiting.status === 'закончено')
                                        ? <span className="recent-voting-result">Голосование закончено</span>
                                        : <span className="recent-voting-result">Идет распознование...</span>
                                }

                            </div>
                    }
                </div>
            </div>
        )
    }
}

export default VotingForRecognition