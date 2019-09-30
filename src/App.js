import React from 'react';
import './App.css';
import Amplify, {Auth, Storage} from "aws-amplify";
import {withAuthenticator} from "aws-amplify-react";
import 'whatwg-fetch'
import 'react-json-pretty/themes/monikai.css';

const configAWS = {
    Auth: {
        identityPoolId: process.env.REACT_APP_identityPoolId,
        region: process.env.REACT_APP_region,
        userPoolId: process.env.REACT_APP_userPoolId,
        userPoolWebClientId: process.env.REACT_APP_userPoolWebClientId,
    },
    Storage: {
        bucket: process.env.REACT_APP_Bucket_name,
        region: process.env.REACT_APP_region,
        identityPoolId: process.env.REACT_APP_identityPoolId
    }
};

Amplify.configure(configAWS);

const sendMailEnpoint = "/SES-sendMail"

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {},
            nipNip: "",
            compName: "",
            phone: "",
            address: "",
            imageName: "",
            imageFile: "",
            response: "",
            attachment: "",
            sent: false
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

    async handleSubmit() {
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
                    address: this.state.address,
                    phone: this.state.phone,
                    attachment: `https://${configAWS.Storage.bucket}.s3-eu-west-1.amazonaws.com/public/userFiles/` + this.state.attachment
                })
            }).then(resp => resp.json());
            this.setState({
                user: {},
                nipNip: "",
                compName: "",
                phone: "",
                address: "",
                imageName: "",
                imageFile: "",
                response: "",
                attachment: "",
                sent: true
            });

            console.log(result)
        } catch (e) {
            console.error(e);
            alert("Wystąpił błąd przy wysyłaniu maila, spróbuj ponownie poźniej.")
        }
    }

    uploadFile = () => {
        Storage.put(`userFiles/${escape(this.upload.files[0].name)}`,
            this.upload.files[0],
            {contentType: this.upload.files[0].type})
            .then(result => {
                this.upload = null;
                console.log(result)
                this.setState({attachment: result.key})
                this.setState({response: "Success uploading file!"});

            })
            .catch(err => {
                this.setState({response: `Cannot uploading file: ${err}`});
            });
    };

    render() {
        return (
            <div className="App">
                <div className="col-md-8 offset-md-2">
                    <div className="form-group">
                        <label>Nip</label>
                        <input
                            type="text"
                            name="nipNip"
                            value={this.state.nipNip}
                            onChange={this.handleChange}
                            className="form-control"
                            placeholder="Nip"/>
                        <small className="form-text text-muted">Podaj swoj NIP
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Pełna nazwa firmy :</label>
                        <input
                            type="text"
                            name="compName"
                            value={this.state.compName}
                            onChange={this.handleChange}
                            className="form-control"
                            placeholder="Nazwa firmy"/>
                        <small className="form-text text-muted">Nazwa firmy pozeoli nam ...
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Adres</label>
                        <input
                            type="text"
                            name="address"
                            value={this.state.address}
                            onChange={this.handleChange}
                            className="form-control"
                            placeholder="Adres firmy"/>
                        <small className="form-text text-muted">adres firmy pozeoli nam ...
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Telefon</label>
                        <input
                            type="phone"
                            name="phone"
                            value={this.state.phone}
                            onChange={this.handleChange}
                            className="form-control"
                            placeholder="Telefon firmy"/>
                        <small className="form-text text-muted">numer firmy pozeoli nam ...
                        </small>
                    </div>
                    <div className="form-group">

                        <input
                            type="file"
                            style={{display: "none"}}
                            ref={ref => (this.upload = ref)}
                            onChange={e =>
                                this.setState({
                                    imageFile: this.upload.files[0],
                                    imageName: this.upload.files[0].name
                                })
                            }
                        />
                        <input placeholder="Wybierz plik" value={this.state.imageName}/>
                        <button
                            onClick={e => {
                                this.upload.value = null;
                                this.upload.click();
                            }}
                            className="btn btn-primary"
                        >
                            Browse
                        </button>
                        <button className="btn btn-primary" onClick={this.uploadFile}>Dodaj</button>
                        {!!this.state.response && <div className="alert alert-primary"> {this.state.response}</div>}
                    </div>
                    <button className="btn btn-primary" onClick={() => this.handleSubmit()}>Wyślij</button>
                    {!!this.state.sent && <div className="alert alert-primary">Wysłano</div>}

                </div>
            </div>
        );
    }
}

export default (withAuthenticator(App, {
    includeGreetings: true,
}));