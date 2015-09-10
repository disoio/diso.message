(function() {
  var InDeflate, Message, ShortId, Type,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ShortId = require('shortid');

  Type = require('type-of-is');

  InDeflate = require('indeflate');

  Message = (function() {
    Message.prototype.name = null;

    Message.prototype.id = null;

    Message.prototype.token = null;

    Message.prototype.data = null;

    Message.prototype.error = null;

    Message.models = null;

    Message.model_key = null;

    function Message(args) {
      var inflate, ref;
      if (!args.name) {
        throw new Error("Message must have name");
      }
      this.name = args.name;
      this.id = args.id || ShortId.generate();
      this.token = args.token;
      this.data = 'data' in args ? ((ref = InDeflate({
        models: this.constructor.models,
        model_key: this.constructor.model_key
      }), inflate = ref.inflate, ref), inflate(args.data)) : {};
      this.error = null;
      if (args.error) {
        this.error = args.error;
        if (!Type(this.error, Error)) {
          this.error = new Error(this.error);
        }
      }
    }

    Message.parse = function(json) {
      var error, message_data;
      try {
        message_data = JSON.parse(json);
      } catch (_error) {
        error = _error;
        return this.error("JSON.parse failed");
      }
      return new this(message_data);
    };

    Message.prototype.stringify = function() {
      var deflate, message;
      message = {
        name: this.name,
        id: this.id,
        token: this.token
      };
      if (this.error) {
        message.error = this.error.message;
      }
      if (this.data) {
        message.data = this.data;
      }
      deflate = InDeflate({
        models: this.constructor.models,
        model_key: this.constructor.model_key
      }).deflate;
      message = deflate(message);
      return JSON.stringify(message);
    };

    Message.prototype.reply = function(args) {
      args.name = this.replyName();
      args.id = this.id;
      return new this.constructor(args);
    };

    Message.prototype.replyName = function() {
      return this.name + "Reply";
    };

    Message.prototype.isError = function() {
      return !!this.error;
    };

    Message.prototype.is = function(name) {
      return this.name === name;
    };

    Message.prototype["in"] = function(names) {
      var ref;
      return ref = this.name, indexOf.call(names, ref) >= 0;
    };

    return Message;

  })();

  module.exports = Message;

}).call(this);
