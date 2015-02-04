# Chat Room HTTP API

## Overall Fail State

```
{
  "code": <error code (< 0)>,
  "message": "<error message>"
}
```

## 创建房间

``` POST /room/new ```

```
{
  "code": 0,
  "roominfo": <room info>
}

<room info>
{
  "id": <room id>,
  "name": "<room name>",
  "type": <room type>,
  "maxNum": <room members max number>,
  "userId": <room creator user id>,
  "userName": <room creator user name>
}
```

### 获取房间列表

```GET /room/list```

```
{
  "code": 0,
  "roomlist": [
    <room info>, ...
  ],
  "members": {
    "<room id>": [
      <user info>
    ], ...
  }
}
```
