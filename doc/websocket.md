# Chat Room WebSocket API


## socket.io Address

```
/chat/roomInfo
/chat/chatRoom
```

## Overall Error State

```socket.on "errorinfo" "<error message>"```

## Overall User Info

```
{
  "id": <user id>,
  "username": "<user username",
  "iconid": <user iconid>,
  "iconurl": "<user iconurl>",
  "iconcolor": "<user iconcolor>",
  "subtitle": "<user subtitle>"
}
```

iconurl 只包含了基本图片路径，请加上URL前缀：

```http://static.missevan.cn/mimages/```


## roomInfo

```/chat/roomInfo```

可收到聊天室列表页面变化信息

### 有人进入房间

```socket.on "enter room"
{
  "room": <room id>,
  "number": "+1",
  "personInfo": <user info>
}
```

### 有人离开房间

```socket.on "leave room"
{
  "room": <room id>,
  "number": "-1",
  "personInfo": <user info>
}
```
