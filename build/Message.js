(function() {
  var Bloon, Message, Type, Uuid,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Uuid = require('node-uuid');

  Type = require('type-of-is');

  Bloon = require('bloon');

  Message = (function() {
    Message.prototype.name = null;

    Message.prototype.id = null;

    Message.prototype.token = null;

    Message.prototype.data = null;

    Message.prototype.error = null;

    Message.setModels = function(models) {
      var bloon;
      if (models == null) {
        models = {};
      }
      bloon = Bloon({
        models: models
      });
      this._inflate = bloon.inflate;
      return this._deflate = bloon.deflate;
    };

    function Message(args) {
      if (!args.name) {
        throw new Error("Message must have name");
      }
      this.name = args.name;
      this.id = args.id || Uuid.v1();
      this.token = args.token;
      this.data = 'data' in args ? this.constructor._inflate(args.data) : {};
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
        return new this(message_data);
      } catch (_error) {
        error = _error;
        return new this({
          name: 'InvalidJson',
          error: error
        });
      }
    };

    Message.prototype.stringify = function() {
      var message;
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
      message = this.constructor._deflate(message);
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

  Message.setModels();

  module.exports = Message;

}).call(this);
