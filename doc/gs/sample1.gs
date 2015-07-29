
# 小剧场脚本样例 v0.3
# Updated: 2015/07/29

# 主结构为多块定义
# 目前已经定义的块 setup, chara, event
# 定义块的顺序没有要求，可随意，一般建议使用 setup -> chara -> event 的顺序
# # 号在非空白字符的最前面表示为注释行

# **暂未定稿，下面所述内容仍可能变动**

#
## setup 包含一些配置信息、引用状态（暂未定义）等
#
#  # 指定了音频专辑的 id ，用于编辑器
#  album [albumid]
#
#  # 指定了整个剧场是否显示角色的名称，默认为 `on`
#  showname [on, off]
#
#  # 指定了剧场呈现方式，是否为立即展示，默认为 `off`
#  instantshow [on, off]
#

setup {
  album 55690
}

#
## chara 包含在剧本中使用的角色信息
#
# define [charaid] [string 角色名] [string 角色称呼] {
#   # 定义角色头像，与主站头像相同定义
#   # `iconurl` 需要加上 `http://static.missevan.cn/mimagesmini/` 或 `http://static.missevan.cn/mimages/` 的对应资源地址
#   icon [iconid] [iconurl] [iconcolor]
#
#   # 角色称号
#   subtitle [string 角色称号]
#
#   # 显示位置，默认为 `left`
#   showon [left, right]
# }
#

chara {
  define 1 "诸葛亮" {
    icon 22768 "201501/20/dcede7aa9e9b7c114633e817d415216d153731.png" "#97d7e5m#e0f6fbm#97d7e5m#7bbdcbm#97d7e5"
  }
  define 2 "王朗" {
    icon 22767 "201501/20/79d982de6b15b29028613ae93912cb6d153730.png" "#94cec8m#cdf6f2m#94cec8m#78b8b1m#94cec8"
  }
}

#
## event 包含在剧本中使用的事件信息
#
# define [eventid] [string 事件名] [事件持续时间] {
#   # 内部可包含多个操作 (action)
#   # 操作指令包含 text, state, image, sound
#   # 当前的操作指令后面有发出角色，在将来扩充定义的时候部分指令不一定会包含这个
#
#   # 角色对话操作 `text` ，角色将以文本形式说出一句话
#   text chara:[charaid] [string 文本]
#
#   # 文本状态操作 `state` ，角色将发出一个文本状态
#   # 第二个参数指定是文本或是图片，可以忽略
#   # 如果不需要角色，可在第三参数指定 `nochara`
#   state [text] chara:[charaid] [string 文本]
#   state image [string 图片地址]
#
#   # 角色发出图片操作 `image` ，角色将发出一个图片
#   # 如果不需要角色，可在第二参数指定 `nochara`，等效于 `state image` 指令
#   image chara:[charaid] [string 图片地址]
#
#   # 事件声音操作 `sound` ，将以角色身份发出一个声音
#   # 第二个参数指定了是由角色发出还是将作为音效、背景音乐等持续播放
#   # 第二个参数备选值: `chara:[charaid]`, `effect`, `background`
#   # 第三个参数除了为 `[soundid]` 外，还可以为 `stop` 表示停止该声音层的播放
#   # 若为角色声音应该在当前事件结束后停止播放，音效将只播放一次就停止，背景音乐将循环播放直到被更换或被停止
#   sound chara:[charaid] [soundid]
#
# }
#

event {
  define 0 "加入战场" 200 {
    state chara:1 "加入战场"
    state chara:2 "加入战场"
  }
  define 1 "1" 10000 {
    text chara:2 "来者可是诸葛孔明？久闻公之搞基大名\n为何要兴这无名之师，前来犯我疆界？"
    sound chara:2 30499
  }
  define 2 "2" 5500 {
    text chara:1 "曹贼篡汉，霸占中原\n奉诏讨贼，何谓无名？"
    sound chara:2 30500
  }
  define 3 "3" 2000 {
    text chara:2 "天数有变，自然之理\n有德之人，神器更易\n今日有幸相会孔明~\n嗯 （。０／／／０。） 实乃天命"
  }
  define 4 "4" 2000 {
    text chara:1 "司徒平生，素有耳闻\n来到阵前，必有高论？"
  }
  define 5 "5" 1500 {
    text chara:2 "扫清六合席卷八方，太祖武皇，搞比利"
    image chara:2 "http://static.missevan.cn/chatImage/201503/07/886d830f486876b658be0f9bc60127ae230822.gif"
  }
  define 6 "5-2" 1500 {
    text chara:2 "神文圣武继承大统，世祖文皇，妮可妮"
    image chara:2 "http://static.missevan.cn/chatImage/201503/07/8c753c9966a79991f38ff5e4132105c1230859.gif"
  }
  define 7 "5-3" 1500 {
    text chara:2 "黄巾猖獗天下纷争，桓帝灵帝，太垃圾"
  }
  define 8 "5-4" 1500 {
    text chara:2 "良将千员来到这里，你就给我，一百一？"
  }
  define 9 "6" 22000 {
    text chara:1 "无耻老贼，同谋篡位\n摇唇鼓舌，狺狺狂吠\n\n国乱岁凶，未立寸功\n罪恶深重。天地不容\n\n皓首匹夫，禽兽不如\n奴颜之徒，有何面目\n在我面前，妄称天数？！"
    sound chara:1 28790
  }
  define 10 "7" 5500 {
    text chara:1 "哈哈哈哈哈哈哈哈，王司徒？（这一套下来，伤害量应该够了）"
    sound chara:1 28791
  }
  define 11 "8" 1500 {
    text chara:2 "哈哈哈哈哈哈哈"
  }
  define 12 "9" 1500 {
    text chara:1 "哈哈哈哈哈哈哈哈"
  }
  define 13 "10" 2500 {
    text chara:2 "哈哈哈哈哈哈哈"
  }
  define 14 "11" 800 {
    text chara:1 "。。。。。"
  }
  define 15 "12" 3000 {
    text chara:1 "你笑个毛啊，不要脸。。。"
  }
  define 16 "13" 4000 {
    text chara:1 "我从未见过如此厚颜无耻之人！！！"
    sound chara:1 28792
  }
  define 17 "14" 2000 {
    text chara:2 "哈哈哈哈，嗯~美哉！niconiconi~"
    sound chara:2 28793
  }
  define 18 "15" 2000 {
    text chara:1 "。。。。。。"
  }
  define 19 "撤离战场" 2000 {
    state chara:1 "撤离了战场"
    state chara:2 "获得了胜利"
    state chara:2 "升级了！学会了新的技能：poi"
  }
}
