const { IncomingWebhook } = require('@slack/webhook');
var url = process.env.HOOK_URL;
var webhook = new IncomingWebhook(url);

var postMessage = function(subject, attachments) {
  console.log(subject);
  console.log(attachments);
  (async () => {
    await webhook.send({
      text: subject,
      attachments: attachments
      // username: "webhookbot",
      // channel: "#test",
      // icon_emoji: ":ghost",
    });
  })();
};

var getAttachments = function(event) {
  var timestamp = (new Date(event.time)).getTime()/1000;
  var detail = event.detail;
  var oldState = detail.previousState.value;
  var newState = detail.state.value;

  let color = "warning";
  if (newState === "ALARM") { color = "danger";}
  else if (newState === "OK") { color = "good";}

  const attachments = [
    {
      "color": color,
      "ts": timestamp,
      "fields": [
        {"title": "Alarm Name", "value": JSON.stringify(detail.alarmName), "short": true},
        {"title": "State Change Reason", "value": JSON.stringify(detail.state.reason), "short": false},
        {"title": "Old State", "value": oldState, "short": true},
        {"title": "Current State", "value": newState, "short": true},
        {
          "title": "Link to Alarm",
          "value": "https://console.aws.amazon.com/cloudwatch/home?region=" + detail.region + "#alarm:alarmFilter=ANY;name=" + encodeURIComponent(detail.alarmName),
          "short": false
        }
      ]
    }
  ];

  return attachments;
};

var processEvent = function(event) {
  var attachments = getAttachments(event);
  var subject = "*AWS CloudWatch Notification*";
  postMessage(subject, attachments)
};

exports.handler = function(event, context) {
    processEvent(event, context);
};



const myEvent = {
  version: '0',
  id: 'f5eae2a7-2059-cbfe-9721-dc6627159e42',
  'detail-type': 'CloudWatch Alarm State Change',
  source: 'aws.cloudwatch',
  account: '101444535047',
  time: '2021-04-13T16:06:38Z',
  region: 'eu-west-1',
  resources: [
    'arn:aws:cloudwatch:eu-west-1:101444535047:alarm:sample-app-backend-dev_openjobs_web_cpu_utilization_high'
  ],
  detail: {
    alarmName: 'sample-app-backend-dev_openjobs_web_cpu_utilization_high',
    state: {
      value: 'OK',
      reason: 'Threshold Crossed: 2 out of the last 2 datapoints [0.01758096118768056 (13/04/21 16:04:00), 0.01575357001274824 (13/04/21 16:03:00)] were not greater than the threshold (40.0) (minimum 1 datapoint for ALARM -> OK transition).',
      reasonData: '{"version":"1.0","queryDate":"2021-04-13T16:06:38.066+0000","startDate":"2021-04-13T16:03:00.000+0000","statistic":"Average","period":60,"recentDatapoints":[0.01575357001274824,0.01758096118768056],"threshold":40.0,"evaluatedDatapoints":[{"timestamp":"2021-04-13T16:04:00.000+0000","sampleCount":1.0,"value":0.01758096118768056}]}',
      timestamp: '2021-04-13T16:06:38.067+0000'
    },
    previousState: {
      value: 'ALARM',
      reason: 'Threshold Crossed: 2 out of the last 2 datapoints [0.017910949885845184 (13/04/21 15:44:00), 0.017077552154660225 (13/04/21 15:43:00)] were less than the threshold (40.0) (minimum 2 datapoints for OK -> ALARM transition).',
      reasonData: '{"version":"1.0","queryDate":"2021-04-13T15:46:16.506+0000","startDate":"2021-04-13T15:43:00.000+0000","statistic":"Average","period":60,"recentDatapoints":[0.017077552154660225,0.017910949885845184],"threshold":40.0,"evaluatedDatapoints":[{"timestamp":"2021-04-13T15:44:00.000+0000","sampleCount":1.0,"value":0.017910949885845184},{"timestamp":"2021-04-13T15:43:00.000+0000","sampleCount":1.0,"value":0.017077552154660225}]}',
      timestamp: '2021-04-13T15:46:16.509+0000'
    },
    configuration: {metrics: [Array]}
  }
};

processEvent(myEvent)
