// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'eu-west-1'});

// Create sendEmail params
var params = {
    Destination: { /* required */
        ToAddresses: [
            'kubakunc@gmail.com'
            /* more items */
        ]
    },
    Message: { /* required */
        Body: { /* required */
            Html: {
                Charset: "UTF-8",
                Data: "HTML_FORMAT_BODY"
            },
            Text: {
                Charset: "UTF-8",
                Data: "Chuju muju kurwaaaaa"
            }
        },
        Subject: {
            Charset: 'UTF-8',
            Data: 'Test email'
        }
    },
    Source: 'coventia.test@gmail.com', /* required */
};

// Create the promise and SES service object
var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

// Handle promise's fulfilled/rejected states
sendPromise.then(
    function(data) {
        console.log(data.MessageId);
    }).catch(
    function(err) {
        console.error(err, err.stack);
    });