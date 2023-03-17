import axios from "axios"

const config = {
    headers: { 
      'Content-Type': 'application/json'
    },
}

export default class HttpProvider {
    public host: string

    constructor(host: string) {
        this.host = host
    }

    public send = (data: any): any => {
        return axios.post(this.host, JSON.stringify(data), config)
        .then(res => {
            return res.data;
        }).catch(err => {
            return err;
        })
    }
}
