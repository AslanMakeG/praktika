import React from 'react';
import '../App.css';
import InfoAboutVoit from '../components/InfoAboutVoit'
import PostService from '../API/PostService';

class Themes extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            inputTheme: null,
            inputSubTheme: null,
            selectedThemes:
            {
                id: null,
                name: null
            },
            selectedSubTheme:
            {
                id: null,
                name: null
            },

            data: null,
        }

        PostService.getAll()
            .then((res) => {
                this.setState({ data: res })
            })
            .catch((error)=> {console.log(error)})

        this.renderData = this.renderData.bind(this);
        this.selectTheme = this.selectTheme.bind(this);
        this.selectSubTheme = this.selectSubTheme.bind(this);
        this.addNewTheme = this.addNewTheme.bind(this);
        this.addNewSubTheme = this.addNewSubTheme.bind(this);

    }

    renderData = () => {
        PostService.getAll()
            .then((res) => {
                this.setState({ data: res })
            })
            .catch((error)=> {console.log(error)})
    }

    addNewTheme = (e) => {
        e.preventDefault();
        if (this.state.inputTheme && this.state.inputTheme !== '') {

            PostService.addNewTheme(this.state.inputTheme)
            .then((res) => {
                this.setState({
                    data: [... this.state.data,
                    {
                        name: res.name,
                        id: res.id,
                    }
                    ]
                })
            })
            .catch((error)=> {console.log(error)})
        }

    }

    addNewSubTheme = (e) => {

        e.preventDefault();

        if (this.state.inputSubTheme && this.state.inputSubTheme !== '') {
            PostService.addNewSubTheme(this.state.inputSubTheme, this.state.selectedThemes.id)
            .then(() => { this.renderData() })
            .catch((error)=> {console.log(error)})
        }
    }



    selectTheme = (e) => {
        let key = e.target.getAttribute('keyli');
        let theme = e.target.innerText
        this.setState({ selectedThemes: { id: key, name: theme } });
        this.setState({ selectedSubTheme: { id: null, name: null } });
        console.log(this.state.selectedThemes);
    }

    selectSubTheme = (e) => {
        let key = e.target.getAttribute('keyli');
        let theme = e.target.innerText
        this.setState({ selectedSubTheme: { id: key, name: theme } });
    }

    render() {

        let filteredData = 0;
        let listItems = '';
        let filteredSubTheme = 0;
        let listThemes = '';

        if (this.state.data) {
            listThemes = this.state.data.map((el) => {
                return (<li key={el.id} keyli={el.id} onClick={this.selectTheme}> {el.name}</li>)
            })
        }

        if (this.state.selectedThemes.id) {

            filteredData = this.state.data.filter(item => { return this.state.selectedThemes.id == item.id });
            if (filteredData) {
                listItems = filteredData.map(item => {
                    if (!item.votes) {
                        return;
                    }

                    return item.votes.map(item => {
                        console.log(item)
                        if (this.state.selectedSubTheme.id == item.id) { filteredSubTheme = item; }
                        return (
                            <li key={item.id} keyli={item.id} onClick={this.selectSubTheme}>
                                {item.name}
                            </li>)
                    })
                }
                );
            }
        }
        return (

            <div className='themes'>
                <div className='sections'>
                    <h3>Разделы голосований</h3>
                    <form className='inputTheme'>

                        <input value={this.state.inputTheme}
                            onChange={(e) => {
                                this.setState({ inputTheme: e.target.value });
                            }} required></input>

                        <button onClick={this.addNewTheme}>Добавить</button>
                    </form>
                    <ul>
                        {listThemes}

                    </ul>
                </div>
                <div className='partitions'>
                    <h3>Темы голосований</h3>

                    <form className='inputTheme'>
                        <input value={this.state.inputSubTheme}
                            onChange={(e) => {
                                this.setState({ inputSubTheme: e.target.value });
                            }} required></input>
                        <button onClick={this.addNewSubTheme}>Добавить</button>
                    </form>

                    {(this.state.selectedThemes.id)
                        ? <h4>{this.state.selectedThemes.name}</h4>
                        : <span className='hintThemes'>Выберите раздел голосования</span>
                    }
                    <ul>
                        {listItems}
                    </ul>
                </div>
                <div>

                    {(this.state.selectedThemes.id && this.state.selectedSubTheme.id)
                        ? <InfoAboutVoit theme={this.state.selectedThemes.name} data={filteredSubTheme} />
                        : <span className='hintThemes'> Выберете тему голосования</span>}

                </div>
            </div>
        );
    }
}

export default Themes