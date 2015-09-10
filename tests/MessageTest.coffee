Assert = require('assert')
Message = require('../build/Message')

class Base
  constructor : (data)->
    @_data = data

  deflate : (args)->
    data = {}
    for k,v of @_data
      data[k] = v
    data[args.model_key] = @constructor.name
    data

class Barf extends Base
class Borf extends Base
class Derp extends Base

module.exports = {
  'Message' : {
    beforeEach : ()->
      Message.models = {
        Barf : Barf
        Borf : Borf
        Derp : Derp
      }

    'should properly stringify/parse' : ()->
      data = {
        b : new Barf({x : 10})
        c : [new Borf({x : 11})]
      }

      msg = new Message(
        name  : 'wow'
        id    : 123
        token : 'abc'
        data  : data
      )
      json = msg.stringify()
      msg_from_json = Message.parse(json)

      Assert.equal(msg_from_json.data.b.x, data.b.x);
      Assert.equal(msg_from_json.data.c[0].constructor, data.c[0].constructor)

  }
}
