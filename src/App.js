import React from 'react';
import ReactS3 from 'react-s3';


import SimpleReactValidator from 'simple-react-validator';
import './App.css';
import Amplify from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";
import { Auth } from 'aws-amplify'
// import JSONPretty from 'react-json-pretty';
import 'whatwg-fetch'
import 'react-json-pretty/themes/monikai.css';

import awsConfig from "./config/aws"

Amplify.configure(awsConfig);

const config = {
    bucketName: 'filedirforses',
    dirName: 'files', /* optional */
    region: 'eu-west-1',
    accessKeyId: 'AKIAIUWUDI76PDXISUEA',
    secretAccessKey: '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',
}

const sendMailEnpoint = "/SES-sendMail"

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {},
            nipNip: "",
            compName: "",
            address: ""
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }



    componentDidMount() {
        Auth.currentAuthenticatedUser({
            bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
        })
            .then(res => {
                this.setState({ user: res })
            })
            .catch(err => console.log(err));
    }

    handleChange(event) {
        const target = event.target;
        const name = target.name;

        this.setState({ [name]: event.target.value });
    }

    async handleSubmit(event) {
        event.preventDefault();

        try {
            const result = await fetch(sendMailEnpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nipNip: this.state.nipNip,
                    compName: this.state.compName,
                    address: this.state.address
                })
            }).then(resp => resp.json());

            console.log(result)
            alert('Mail został wysłany');
        } catch (e) {
            console.error(e);
            alert("Wystąpił błąd przy wysyłaniu maila, spróbuj ponownie poźniej.")
        }
    }

    async upload(e) {
        console.log(e.target.files[0]);
        let data = await ReactS3.uploadFile(e.target.files[0], config)
        console.log(data);

        this.setState({ "attachmentUrl": data.location })

    }

    render() {
        return (
            <div className="App">
                {/* <JSONPretty id="json-pretty" style={{ textAlign: "left" }} data={this.state.user}></JSONPretty> */}
                <form onSubmit={this.handleSubmit}>
                    <label>
                        NIP :
                        <input
                            type="text"
                            name="nipNip"
                            value={this.state.nipNip}
                            onChange={this.handleChange} />
                    </label>
                    <label>
                        Pełna nazwa firmy :
                        <input
                            type="text"
                            name="compName"
                            value={this.state.compName}
                            onChange={this.handleChange} />
                    </label>
                    <label>
                        Adres :
                        <input
                            type="text"
                            name="address"
                            value={this.state.address}
                            onChange={this.handleChange} />
                    </label>
                    <label>
                        Dodaj plik :
                        <input
                            type="file"
                            onChange={this.upload}
                        />
                    </label>
                    <input type="submit" value="Wyślij" />
                </form>
            </div>
        );
    }
}

export default (withAuthenticator(App, {
    includeGreetings: true,
}));

// aws cognito-idp sign-up \
//   --region eu-west-1 \
//   --client-id 7ubo85sakatf6d64ajll2e797f \
//   --nipNip kubakunc@gmail.com \
//   --password Passw0rd!