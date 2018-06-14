'use strict';

var PluginError = require('plugin-error');
var md5 = require("md5");
var queryString = require('querystring');
var request = require('request');
var through = require('through2');
const PLUGIN_NAME = 'gulp-onesky-post';

function makePostOptions(options) {
  var timestamp = Math.floor(Date.now() / 1000);
  var devHash = md5(timestamp + options.secretKey);
  var apiAddress = "https://platform.api.onesky.io"
  
  return {
    method: 'POST',
    url: apiAddress + '/1/projects/' + options.projectId + '/files?' + queryString.stringify({
      api_key: options.publicKey,
      timestamp: timestamp,
      dev_hash: devHash
    }),
    formData: {
      file: {
        value: options.content,
        options: {
          filename: options.fileName
        }
      },
      api_key: options.publicKey,
      dev_hash: devHash,
      file_format: options.format,
      is_keeping_all_strings: options.keepStrings.toString(),
      locale: options.locale,
      timestamp: timestamp.toString(),
      is_allow_translation_same_as_original: (options.allowSameAsOriginal || false).toString()
    }
  };
}

function sendRequest(requestData, callback) {
  request(requestData, function (error, response, body) {
    body = JSON.parse(body);
    
    if (error) {
      error = new PluginError(PLUGIN_NAME, 'error in sending request to one sky api');
    }
    else if (body.meta.status !== 201) {
      error = new PluginError(PLUGIN_NAME, JSON.stringify(body.meta));
    }
    else {
      body = body.meta.data;
    }
    callback(error,body);
  });
}


function postFile(options) {
  options = options || {};

  if (!options.publicKey || !options.secretKey)
    throw new PluginError(PLUGIN_NAME, 'please specify public and secret keys');

  if (!options.projectId)
    throw new PluginError(PLUGIN_NAME, 'please specify project id');

  if(!options.fileName)
    throw new PluginError(PLUGIN_NAME, 'please specify file name');

  if(!options.format)
    throw new PluginError(PLUGIN_NAME, 'please specify the format');
    
  if (options.keepStrings !== true && options.keepStrings !== false)
      options.keepStrings = true;
  
  var stream = through.obj(function(file, enc, cb) {
      
    if (file.isBuffer()) {
      var fileContent = file.contents;
      // if null is read
      if (!fileContent) {  
        throw new PluginError(PLUGIN_NAME, 'file content is NULL');
      }
      fileContent = fileContent.toString(enc);
      options.content = fileContent;
      var requestData = makePostOptions(options);
      sendRequest(requestData, function(error, body){
        if(error) {
          stream.emit("error", error);
        }
        stream.emit('end');
      });
    }
    this.push(file);
    cb();
  });
  return stream;
}

// Exporting the plugin main function
module.exports = postFile;