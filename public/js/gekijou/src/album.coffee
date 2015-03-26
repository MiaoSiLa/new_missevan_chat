class SoundAlbum

  constructor: ->
    @albums = []
    @sounds = []

  init: ->
    $('#soundmusic').click ->
      $('#chatmusic').fadeToggle 500
      return

  load: (cb) ->
    # clear
    $('#chatmusic').html ''

    if @albums.length > 0
      # load process
      len = @albums.length
      loaded = 0
      for albumid in @albums
        @loadAlbum albumid, ->
            loaded++
            if loaded >= len
              # album load finish
              if cb? then cb()
            return
          , on
    else
      if cb? then cb()

    return

  set: (albumids) ->
    t = typeof albumids
    if t is 'string'
      tids = albumids.split ','
      for albumid in tids
        albumid = parseInt albumid
        if @albums.indexOf(albumid) < 0
          @albums.push albumid
    else if t is 'number'
      @albums.push t

    return

  # albumid must be integer
  loadAlbum: (albumid, cb, force) ->
    exist = @albums.indexOf(albumid) < 0
    if force or exist
      @albums.push albumid if exist
      # load
      self = @
      moTool.getAjax
        url: "/sound/soundlist?albumid=" + albumid,
        showLoad: no,
        callBack: (data) ->
          if data and data.state is 'success'
            if data.info and data.info.sounds.length > 0
              for s in data.info.sounds
                self.addSound s
          if cb? then cb()
          return
    else
      if cb? then cb()
    return

  addSound: (s) ->
    if not $('#sound' + s.id).length
      $music = $( """
                  <div id="sound#{s.id}" class="chatmusic">
                    <div class="soundtitle">#{s.soundstr}</div>
                    <img title="标题: #{s.soundstr}&#10;UP主: #{s.username}&#10;声音ID: #{s.id}" src="#{s.front_cover}" />
                  </div>
                  """ )
      $music.prependTo $('#chatmusic')
      if GG.env is 'dev'
        soundid = parseInt s.id
        self = @
        $music.click ->
          # index.soundBox.playChatMusic(s.soundurl, $(this), index.mo.soundPath);
          GG.em.doAction 'sound', soundid
          self.hideSelect()
        return
    return

  hideSelect: ->
    $chatmusic = $('#chatmusic')
    if $chatmusic.is(':visible')
      $chatmusic.fadeOut 500
    return

  showSelect: ->
    $chatmusic = $('#chatmusic')
    if not $chatmusic.is(':visible')
      $chatmusic.fadeIn 500
    return