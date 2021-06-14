import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import path = require('path');
import * as s3 from "@aws-cdk/aws-s3";
import * as apigateway from '@aws-cdk/aws-apigateway';
// import * as acm from "@aws-cdk/aws-certificatemanager";


export class SlackListenerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "slacklistener");

    const lambdaListener = new lambda.Function(this, 'slackListener', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.listener',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../assets/lambda/SlackAppService')),
      timeout: cdk.Duration.minutes(5),
      memorySize: 256,
      environment: {
        BUCKET: bucket.bucketName
      }
    });
    lambdaListener.addEnvironment("SlackBotToken","");
    lambdaListener.addEnvironment("emailReceivers","");
    lambdaListener.addEnvironment("emailSender","");
    lambdaListener.addEnvironment("emailSenderName","");
    lambdaListener.addEnvironment("senderPassword","");


    bucket.grantReadWrite(lambdaListener)

    // const cert = new acm.Certificate(this, "Certificate", {
    //   domainName: "*.cdk.clarence.tw",
    //   validation: acm.CertificateValidation.fromDns(),
    // });
    
    const api = new apigateway.RestApi(this, "slackListener-api", {
      restApiName: "Slack Listener",
      description: "Listen to Sebastian Slackbot"
    });

    const slackIntegration = new apigateway.LambdaIntegration(lambdaListener, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    const slackRoot = api.root.addResource('slackapi');
    const slackListen = slackRoot.addResource('sebastian');
    const interactivity = slackRoot.addResource('interactivity');
    

    slackListen.addMethod("GET", slackIntegration); // GET /
    slackListen.addMethod("POST", slackIntegration);
    slackListen.addMethod("PUT", slackIntegration);
    slackListen.addMethod("DELETE", slackIntegration);
    interactivity.addMethod("GET", slackIntegration); // GET /
    interactivity.addMethod("POST", slackIntegration);
    interactivity.addMethod("PUT", slackIntegration);
    interactivity.addMethod("DELETE", slackIntegration);
  }
}
