const { IncomingWebhook } = require('@slack/webhook');
// var url = process.env.HOOK_URL;
var url = "https://hooks.slack.com/services/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";
var lodash = require('lodash');
var baseSlackMessage = {baseSlackMessage: "base slack message"}
var webhook = new IncomingWebhook(url);

var postMessage = function(message, callback) {
  console.log();
  console.log(message);
  (async () => {
    await webhook.send({
      text: JSON.stringify(message),
      // username: "webhookbot",
      // channel: "#test",
      // icon_emoji: ":ghost"
    });
  })();
};

var handleCloudWatch = function(event, context) {
  var timestamp = (new Date(event.Records[0].Sns.Timestamp)).getTime()/1000;
  var message = event.Records[0].Sns.Message;
  var region = event.Records[0].EventSubscriptionArn.split(":")[3];
  var subject = "AWS CloudWatch Notification";
  var alarmName = message.AlarmName;
  var oldState = message.OldStateValue;
  var newState = message.NewStateValue;
  var alarmDescription = message.AlarmDescription;
  var alarmReason = message.NewStateReason;
  var trigger = message.Trigger;
  var color = "warning";

  if (message.NewStateValue === "ALARM") {
      color = "danger";
  } else if (message.NewStateValue === "OK") {
      color = "good";
  }

  var slackMessage = {
    text: "*" + subject + "*",
    attachments: [
      {
        "color": color,
        "fields": [
          { "title": "Alarm Name", "value": alarmName, "short": true },
          { "title": "Alarm Description", "value": alarmDescription, "short": false},
          {
            "title": "Trigger",
            "value": trigger.Statistic + " "
              + trigger.MetricName + " "
              + trigger.ComparisonOperator + " "
              + trigger.Threshold + " for "
              + trigger.EvaluationPeriods + " period(s) of "
              + trigger.Period + " seconds.",
              "short": false
          },
          { "title": "Old State", "value": oldState, "short": true },
          { "title": "Current State", "value": newState, "short": true },
          {
            "title": "Link to Alarm",
            "value": "https://console.aws.amazon.com/cloudwatch/home?region=" + region + "#alarm:alarmFilter=ANY;name=" + encodeURIComponent(alarmName),
            "short": false
          }
        ],
        "ts":  timestamp
      }
    ]
  };
  return lodash.merge(slackMessage, baseSlackMessage);
};

var processEvent = function(event, context) {
  console.log("sns received:" + JSON.stringify(event, null, 2));
  console.log("processing cloudwatch notification");
  var slackMessage = handleCloudWatch(event,context);


  postMessage(slackMessage);
};

exports.handler = function(event, context) {
    processEvent(event, context);
};

var myEvent = {
  "Records": [
    {
      "EventSource": "aws:sns",
      "EventVersion": "1.0",
      "EventSubscriptionArn": "arn:aws:sns:eu-west-1:{{{accountId}}}:ExampleTopic",
      "Sns": {
        "Type": "Notification",
        "MessageId": "95df01b4-ee98-5cb9-9903-4c221d41eb5e",
        "TopicArn": "arn:aws:sns:eu-west-1:123456789012:ExampleTopic",
        "Subject": "Subject",
        "Message": {
          "Trigger": {
            "MetricName": "MetricName",
            "ComparisonOperator": "ComparisonOperator",
            "Threshold" : "Threshold",
            "EvaluationPeriods" : "EvaluationPeriods",
            "Period" : "Period",
            "Statistic" : "Statistic",
          },
          "AlarmName": "AlarmName",
          "OldStateValue": "OldStateValue",
          "NewStateValue": "NewStateValue",
          "AlarmDescription": "AlarmDescription",
          "NewStateReason": "NewStateReason",
        },
        "Timestamp": "1970-01-01T00:00:00.000Z",
        "SignatureVersion": "1",
        "Signature": "EXAMPLE",
        "SigningCertUrl": "EXAMPLE",
        "UnsubscribeUrl": "EXAMPLE",
        "MessageAttributes": {
          "Test": {
            "Type": "String",
            "Value": "TestString"
          },
          "TestBinary": {
            "Type": "Binary",
            "Value": "TestBinary"
          }
        }
      }
    }
  ]
}
processEvent(myEvent, 1)
