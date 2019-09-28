var AWS = require('aws-sdk');

const fs = require('fs');
const util = require('util');

async function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', function (err, data) {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}


exports.handler = async (event) => {
    console.info("got event:", event);

    const body = JSON.parse(event.body)

    const raw_html = await readFile('./index.html');

    const html = util.format(raw_html, body.userName);

    console.info(html);

    // Create sendEmail params 
    var params = {
        Destination: { /* required */
            ToAddresses: [
                'h.kopysc@gmail.com'
                /* more items */
            ]
        },
        Message: { /* required */
            Body: { /* required */
                Html: {
                    Charset: "UTF-8",
                    Data: html
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Test email'
            }
        },
        Source: 'coventia.test@gmail.com',
        /* required */
    };

    // Create the promise and SES service object
    let ses = new AWS.SES({ apiVersion: '2010-12-01' });

    var data;

    try {
        data = await ses.sendEmail(params).promise();
    }
    catch (e) {
        console.error(e);
    }

    console.log(data.MessageId);

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            "message": "sent successfully!",
            "messageId": data.MessageId
        }),
    };

    return response;
}
