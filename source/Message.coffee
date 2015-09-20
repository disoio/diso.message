# NPM dependencies
# ------------------
# [shortid](https://github.com/dylang/shortid)
# [type-of-is](https://github.com/stephenhandley/type-of-is)
# [bloon](https://github.com/stephenhandley/bloon)
ShortId = require('shortid')
Type    = require('type-of-is')
Bloon   = require('bloon')

# Message
# =======
# A WebSocket message
class Message
  name  : null  # name for this message
  id    : null  # unique id for this message (shared by its reply)
  token : null  # jwt auth token
  data  : null  # the data for this message
  error : null  # an error if needed

  # @setModels
  # ----------
  # Set models to be used by Bloon
  #
  # **models* object mapping names to model constructors
  @setModels : (models = {})->
    bloon = Bloon(
      models : models
    )
    @_inflate = bloon.inflate
    @_deflate = bloon.deflate

  # constructor
  # -----------
  # Create a message
  #
  # ### required args
  # **name** : the name for this message
  #
  # *id*     : id for this message, otherwise will be generated
  #
  # *token*  : jwt token used to identify / authorize the user
  #            sending this message
  #
  # *data*   : the data / params for this message
  #
  # *error*  : used in replies if error occured during processing
  #            of message
  constructor : (args)->
    unless args.name
      throw new Error("Message must have name")

    @name  = args.name
    @id    = args.id || ShortId.generate()
    @token = args.token
    @data  = if ('data' of args)
      @constructor._inflate(args.data)
    else
      {}

    @error = null
    if args.error
      @error = args.error
      unless Type(@error, Error)
        @error = new Error(@error)


  # @parse
  # ------
  # Parse and create message from raw json string
  #
  # **json** : the raw json to parse
  @parse : (json)->
    try
      message_data = JSON.parse(json)
    catch error
      return @error("JSON.parse failed")

    new @(message_data)


  # stringify
  # ---------
  # Encode this message into json, deflating its data in the process
  stringify : ()->
    message = {
      name  : @name
      id    : @id
      token : @token
    }

    if @error
      message.error = @error.message

    if @data
      message.data = @data

    message = @constructor._deflate(message)
    JSON.stringify(message)


  # reply
  # ------
  # Create a reply message from this message using its id
  #
  # *data* : data for the reply
  #
  # *error* : error
  reply : (args)->
    args.name = @replyName()
    args.id   = @id
    new @constructor(args)


  # replyName
  # ---------
  # The name of the reply to this message
  replyName : ()->
    "#{@name}Reply"


  # isError
  # -------
  # Returns true if this message has an error
  isError : ()->
    !!@error


  # is
  # --
  # Convenience method for checking the name of this message
  #
  # **name** : message name to check against
  is : (name)->
    (@name is name)


  # in
  # --
  # Convenience method for checking whether this message's is one
  # of several possibilities
  #
  # **names** : message names to check against
  in : (names)->
    (@name in names)

Message.setModels()

module.exports = Message
