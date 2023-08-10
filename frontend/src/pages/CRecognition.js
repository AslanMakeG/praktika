import React from 'react';
import '../App.css';
import VotingForRecognition from '../components/VotingForRecognition';
import CameraMenu from '../components/CameraMenu';
import { useParams } from 'react-router-dom';
import PostService from '../API/PostService';


class CRecognition extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      voiting: null,
    }

    this.editVoitings = this.editVoitings.bind(this);
    this.editVoitStatus = this.editVoitStatus.bind(this);

  }

  componentDidMount() {
    const params = this.props.params;
    PostService.getVote(params.id)
          .then((res) => {
              if (res.status == 'не начато' || res.status == 'требуется переголосование')
                PostService.start_vote(res.id);
              res.status = 'в процессе'
              this.setState({ voiting: res })
          })
          .catch((error)=> {console.log(error)})
  }




  editVoitings = (data) => {

    let newVoiting = this.state.voiting

    newVoiting.agree_votes = data.agreeable;
    newVoiting.abstained_votes = data.abstained;
    newVoiting.disagree_votes = data.disagree;

    this.setState({ voiting: newVoiting })
  };

  editVoitStatus = (event) => {

    if (this.state.voiting.status == 'не начато' || this.state.voiting.status == 'требуется переголосование') {

      PostService.start_vote(this.state.voiting.id).catch((error)=> {console.log(error)});
      let newVoiting = this.state.voiting;
      newVoiting.status = 'в процессе';
      event.target.innerText = 'Закончить голосование';
      this.setState({ voiting: newVoiting })


    } else if (this.state.voiting.status == 'в процессе') {


      PostService.end_vote(this.state.voiting.id,
          this.state.voiting.agree_votes,
          this.state.voiting.disagree_votes,
          this.state.voiting.abstained_votes)
        .catch((error)=> {console.log(error)})

      let newVoiting = this.state.voiting;
      newVoiting.status = 'закончено';
      event.target.disabled = true;
      event.target.innerText = 'Голосование закончено';
      this.setState({ voiting: newVoiting })

    }

  };

  render() {

    let status = 'не начато'
    if (this.state.voiting) status = this.state.voiting.status;

    return (

      <div className='common-menu'>

        <CameraMenu editVoitings={this.editVoitings} id={this.props.params.id}
          editVoitStatus={this.editVoitStatus} status={status} />

        {
          (this.state.voiting)
              ? <VotingForRecognition voiting={this.state.voiting} />
              : <></>
        }

      </div>
    )
  }
}

export default (props) => (
  <CRecognition
    {...props}
    params={useParams()}
  />
)