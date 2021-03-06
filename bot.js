'use strict';

// Weather Example
// See https://wit.ai/sungkim/weather/stories and https://wit.ai/docs/quickstart
const Wit = require('node-wit').Wit;
const FB = require('./facebook.js');
const Config = require('./const.js');
const API = require('./api.js');

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const firstValue = (entity) => {
  return entity[0].value;
};

// Bot actions
const actions = {
  say(sessionId, context, message, cb) {
    console.log(message);

    // Bot testing mode, run cb() and return
    if (require.main === module) {
      cb();
      return;
    }

    // Our bot has something to say!
    // Let's retrieve the Facebook user whose session belongs to from context
    // TODO: need to get Facebook user name
    const recipientId = context._fbid_;
    if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.
      FB.fbMessage(recipientId, message, (err, data) => {
        if (err) {
          console.log(
            'Oops! An error occurred while forwarding the response to',
            recipientId,
            ':',
            err
          );
        }

        // Let's give the wheel back to our bot
        cb();
      });
    } else {
      console.log('Oops! Couldn\'t find user in context:', context);
      // Giving the wheel back to our bot
      cb();
    }
  },
  merge(sessionId, context, entities, message, cb) {
    // Retrieve the location entity and store it into a context field
    var keys = Object.keys(entities);
    var i;
    for(i = 0; i < keys.length; i++){
      context[keys[i]] = firstValue(entities[keys[i]]);
    }
    cb(context);
  },
  error(sessionId, context, error) {
    console.log(error.message);
  },
  ['fetch-weather-bobbejaanland'](sessionId, context, cb) {
    API.getForecast('Herentals', forecastCallback, context, cb);
  },
  ['fetch-weather'](sessionId, context, cb) {
    // Here should go the api call, e.g.:
    API.getForecast(context.location, forecastCallback, context, cb);
  },
  ['fetch-drukte'](sessionId, context, cb) {
    API.call('/drukte/' + context.datetime, drukteCallback, context, cb);
  },
  ['fetch-drukte-vandaag'](sessionId, context, cb) {
    API.call('/drukte/vandaag', drukteCallback, context, cb);
  },
  ['fetch-openingsuren'](sessionId, context, cb) {
    console.log(context);
    API.call('/openingsuren/' + context.openingsuren + '/' + context.datetime, openingsurenCallback, context, cb);
  },
  ['fetch-openingsuren-vandaag'](sessionId, context, cb) {
    console.log(context);
    API.call('/openingsuren/' + context.openingsuren + '/vandaag', openingsurenCallback, context, cb);
  },
  ['fetch-grap'](sessionId, context, cb) {
    console.log(context);
    API.call('/grap', grapCallback, context, cb);
  },
  ['fetch-attractiegrootte'](sessionId, context, cb) {
    console.log(context);
    API.call('/attractie/' + context.bob_attractie + '/size', attractiegrootteCallback, context, cb);
  },
  ['fetch-wachtrij'](sessionId, context, cb) {
    API.call('/wachtrij/' + context.bob_attractie, wachtrijCallback, context, cb);
  },
  ['fetch-where'](sessionId, context, cb) {
    API.call('/where/type/' + context.bob_faciliteiten + '/3', whereCallback, context, cb);
  },
  ['clear-context'](sessionId, context, cb) {
    fbid = context._fbid_;
    context = {};
    context._fbid_ = fbid;
    cb();
  }
};


const getWit = () => {
  return new Wit(Config.WIT_TOKEN, actions);
};

exports.getWit = getWit;


function forecastCallback(data, context, cb) {
  var data = JSON.parse(data);
  var weather = data.weather[0];
  context.forecast = weather.main;
  cb(context);
}

function drukteCallback(data, context, cb) {
  context.drukte = data;
  cb(context);
}

function openingsurenCallback(data, context, cb) {
  context.openingsuren = data;
  cb(context);
}

function wachtrijCallback(data, context, cb) {
  context.wachtrij = data;
  cb(context);
}

function whereCallback(data, context, cb) {
  context.location = data;
  cb(context);
}

function grapCallback(data, context, cb) {
  context.grap = data;
  cb(context);
}

function attractiegrootteCallback(data, context, cb) {
  context.attractiegrootte = data;
  cb(context);
}

// bot testing mode
// http://stackoverflow.com/questions/6398196
if (require.main === module) {
  console.log("Bot testing mode.");
  const client = getWit();
  client.interactive();
}