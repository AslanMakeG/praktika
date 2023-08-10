import axios from 'axios';

export default class PostService {

    static async getVoteResults(formData) {
        const response = await axios({
            method: "post",
            url: "http://localhost:5000/api/get_vote_results",
            data: formData,
            headers: { "Content-Type": "multipart/form-data" },
        })
        return response.data;
    }

    static async getAll() {
        const response = await axios.get('http://localhost:5000/api/get_themes')
        return response.data;
    }

    static async addNewTheme(theme) {
        const response = await axios.post('http://localhost:5000/api/create_theme', {
            name: theme
        });
        return response.data;
    }

    static async addNewSubTheme(nameTheme, idTheme) {
        const response = await axios.post('http://localhost:5000/api/create_vote',
            { name: nameTheme, theme: idTheme });
        return response.data;
    }

    static async getVote(id) {
        const response = await axios.get('http://localhost:5000/api/get_vote/' + id)
        return response.data;
    }

    static async start_vote(key) {
        const response = await axios.put('http://localhost:5000/api/start_vote',
            { id: key });
        return response.data;
    }

    static async end_vote(key, ag, di, ab) {
        const response = await axios.put('http://localhost:5000/api/end_vote',
            {
                id: key, agreeable: ag,
                disagree: di, abstained: ab
            }
        );
        return response.data;
    }

}