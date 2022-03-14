require("es6-promise").polyfill();
require("isomorphic-fetch");
const {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { SendRawEmailCommand } = require("@aws-sdk/client-ses");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { Packer } = require("docx");
var mimemessage = require("mimemessage");
const { s3Client, dynamodbClient, emailClient } = require("./aws");
const { default: exportSurveyAsDocx } = require("./SurveysAsDoc");

const STATE_COMPLETE = "Complete";
const MAX_DOCUMENT_SIZE = 9 * 1024 * 1024; // 9Mb

function getSurveyResponse(surveyId) {
  console.log("getSurveyResponse", surveyId);

  var params = {
    TableName: process.env.SURVEY_DB_TABLE,
    Key: marshall({ id: surveyId }),
  };

  return dynamodbClient.send(new GetItemCommand(params)).then((result) => {
    console.log("Retrieved item:", result);
    const survey = unmarshall(result.Item);
    console.log("Retrieved survey:", survey);
    return survey;
  });
}

function movePhoto(photo) {
  console.log("movePhoto", photo);

  const uploadKey = photo.fullsize.uploadKey;
  if (uploadKey === null || uploadKey.length === 0) {
    console.log("No photo to move");
    return Promise.resolve("No photo to move");
  }

  return s3Client
    .send(
      new CopyObjectCommand({
        Bucket: photo.bucket,
        CopySource: photo.bucket + "/" + uploadKey,
        Key: photo.fullsize.key,
      })
    )
    .then((result) => {
      console.log("copy result", result);
      return s3Client.send(
        new DeleteObjectCommand({
          Bucket: photo.bucket,
          Key: uploadKey,
        })
      );
    })
    .then((result) => {
      console.log("delete result", result);
      photo.fullsize.uploadKey = null;
      return Promise.resolve("Photo moved");
    });
}

async function movePhotos(survey) {
  const result = await Promise.all(
    survey.photos.map((photo) => movePhoto(photo))
  );
  console.log("moved photos result", result);
  return Promise.resolve();
}

function getPhoto(photo) {
  console.log("getPhoto", photo);

  const key = photo.fullsize.key;
  if (!key) {
    console.log("No photo to get");
    return Promise.reject("No photo to get");
  }

  return s3Client
    .send(
      new GetObjectCommand({
        Bucket: photo.bucket,
        Key: key,
      })
    )
    .then((result) => {
      console.log("get result", result);
      return result.Body;
    });
}

async function getPhotos(survey) {
  const result = {};
  await Promise.allSettled(
    survey.photos.map((photo) =>
      getPhoto(photo).then((photoData) => {
        result[photo.fullsize.key] = { data: photoData };
        return Promise.resolve();
      })
    )
  );
  console.log("all photos retrieved");
  return result;
}

async function updateSurveyResponse(surveyResponse) {
  console.log("updateSurveyResponse", JSON.stringify(surveyResponse));

  const params = {
    TableName: process.env.SURVEY_DB_TABLE,
    Item: marshall({
      ...surveyResponse,
      uploadState: STATE_COMPLETE,
      updatedAt: new Date().toISOString(),
    }),
  };

  console.log("Updating item...", params);
  return dynamodbClient.send(new PutItemCommand(params)).then((result) => {
    console.log("Update result", result);
    return Promise.resolve();
  });
}

async function sendSurveyConfirmationEmail(survey) {
  const photosData = await getPhotos(survey);
  let surveyResultsDoc = await exportSurveyAsDocx(
    survey.surveyResponse,
    survey.photos,
    photosData
  );
  let surveyResultsDocBase64 = await Packer.toBase64String(surveyResultsDoc);

  if (surveyResultsDocBase64.length > MAX_DOCUMENT_SIZE) {
    // Report including photos is too large to email - create one without photos
    surveyResultsDoc = await exportSurveyAsDocx(survey.surveyResponse, []);
    surveyResultsDocBase64 = await Packer.toBase64String(surveyResultsDoc);
  }

  var attachmentEntity = mimemessage.factory({
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    contentTransferEncoding: "base64",
    body: surveyResultsDocBase64.replace(/([^\0]{76})/g, "$1\n"),
  });

  attachmentEntity.header(
    "Content-Disposition",
    'attachment ;filename="SchoolGroundsAuditResponse.docx"'
  );

  var mixedContent = mimemessage.factory({
    contentType: "multipart/mixed",
    body: [
      mimemessage.factory({
        contentType: "text/html;charset=utf-8",
        body: `<p>Dear ${survey.responderName || "survey responder"}</p>

<p><br/></p>

<p>Thank you for taking the time to complete the school grounds audit. In answering
the questions we expect that you, your pupils and other adults have
considered carefully how you should develop and use your outdoor
space.</p>

<p>Your completed form and images are attached. We hope you find it a useful place to
start considering what learning and play experiences you would like
to provide for your children.</p>

<p>We have collated a resource of useful tools, only available to schools that have
completed the School Grounds Audit Tool.</p>

<p><a href="https://www.ltl.org.uk/audit-complete/">https://www.ltl.org.uk/audit-complete/</a></p>

<p>We are thankful to Scottish Tech Army for creating this resource for Learning through Landscapes.</p>

<p><br/></p>

<p>Kind regards</p>

<p><br/></p>

<p>The LtL Scotland team</p>
<p><font color="#7f7f7f"><b>Learning through Landscapes – the UK’s leading outdoor learning and play charity for 30 years.</b></font></p>
<p><font color="#7f7f7f"><b>Phone:&nbsp;</b></font><font color="#afcd4b"><b>01786 465 934 </b></font></p>
<p><font color="#7f7f7f"><b>Web:</b></font><a href="https://www.ltl.org.uk/"><font color="#afcd4b"><span style="text-decoration: none"><b>https://www.ltl.org.uk</b></span></font></a></p>

<p><font color="#7f7f7f" size="1" style="font-size: 7pt">The
Learning through Landscapes Trust, a registered charity in England
and Wales (No. 803270) and in Scotland (No. SCO38890) and a company
limited by guarantee registered in England (No. 2485660).&nbsp;</font></p>

<p><font color="#7f7f7f" size="1" style="font-size: 7pt"><span lang="en-US">Registered
office: </span></font></font><font color="#7f7f7f"><font size="1" style="font-size: 7pt">Ground
Floor, F Block, Clarendon House, Monarch Way, Winchester, Hampshire, SO22 5PW </font></p>

<p><font color="#7f7f7f" size="1" style="font-size: 7pt">Office in Scotland: 1 Beta Centre, Stirling University Innovation Park, Stirling, FK9 4NF</font></p>

<p align="justify"><font color="#7f7f7f" size="1" style="font-size: 7pt">This
email (including attachments) is confidential and intended solely for
the use of the individual to whom it is addressed. If you are not the
intended recipient you must not print, copy or distribute it. All
views expressed are those of the author and not of the charity. If
you have received this email in error, please notify Learning through
Landscapes (LtL) immediately by replying to this email and delete the
email from your system. Please note that neither LtL nor the sender
accepts any responsibility for viruses and it is your responsibility
to scan attachments (if any). Thank you.</font></p>`,
      }),
      attachmentEntity,
    ],
  });

  var mailContent = mimemessage.factory({
    contentType: "multipart/mixed",
    body: [mixedContent],
  });
  mailContent.header("From", process.env.CONFIRM_SURVEY_EMAIL_FROM);
  mailContent.header("Bcc", process.env.CONFIRM_SURVEY_EMAIL_BCC);
  mailContent.header("To", survey.responderEmail);
  mailContent.header("Subject", "Survey complete");

  const emailInput = {
    RawMessage: { Data: Buffer.from(mailContent.toString()) },
  };

  console.log("Send email");
  const sendEmailCommand = new SendRawEmailCommand(emailInput);
  const sendEmailResponse = await emailClient.send(sendEmailCommand);
  console.log("Send email result", sendEmailResponse);
}

exports.handler = async (event) => {
  console.log("Incoming request", event);
  const inputRequest = JSON.parse(event.body);
  console.log(inputRequest);

  const surveyId = inputRequest.confirmId;
  const survey = await getSurveyResponse(surveyId);

  await movePhotos(survey);
  await updateSurveyResponse(survey);
  await sendSurveyConfirmationEmail(survey);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "OPTIONS,POST",
    },
    body: JSON.stringify({ result: "Submission complete" }),
  };
};
