import React from 'react';
import './App.css';
import Amplify from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";
import { Auth } from 'aws-amplify'
// import JSONPretty from 'react-json-pretty';
import 'whatwg-fetch'
import 'react-json-pretty/themes/monikai.css';

import awsConfig from "./config/aws"

Amplify.configure(awsConfig);


const sendMailEnpoint = "/SES-sendMail"

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {},
            userName: ""
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
        this.setState({ userName: event.target.value });
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
                    userName: this.state.userName
                })
            }).then(resp => resp.json());

            console.log(result)
            alert('Mail został wysłany');
        } catch (e) {
            console.error(e);
            alert("Wystąpił błąd przy wysyłaniu maila, spróbuj ponownie poźniej.")
        }
    }

    render() {
        return (
            <div className="App">
                {/* <JSONPretty id="json-pretty" style={{ textAlign: "left" }} data={this.state.user}></JSONPretty> */}
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Imię:
                        <input
                            type="text"
                            name="userName"
                            value={this.state.userName}
                            onChange={this.handleChange} />
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
//   --username kubakunc@gmail.com \
//   --password Passw0rd!