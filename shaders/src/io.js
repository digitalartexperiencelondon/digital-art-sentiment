// io.js

function requestSentimentFromURL(url) {
  let sentimentResponse;
  httpGet(url, "jsonp", false, function (response) {
    sentimentResponse = new SentimentResponse(response);
  });
  return sentimentResponse;
}

function requestLocalRandomSentiment(numSentiments = 8) {
  const dataArray = Array.from({ length: numSentiments }, () => random());
  const sentimentResponse = new SentimentResponse({});
  sentimentResponse.fromArray(dataArray);
  return sentimentResponse;
}

function requestLocalEmptySentiment(numSentiments = 8) {
  const dataArray = Array.from({ length: numSentiments }, () => 0.0);
  const sentimentResponse = new SentimentResponse({});
  sentimentResponse.fromArray(dataArray);
  return sentimentResponse;
}
